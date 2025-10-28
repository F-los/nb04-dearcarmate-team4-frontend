import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { setTokenCookies } from '@shared/auth'
import useUserStore from '@zustand/useUserStore'
import useConfirmModal from '@ui/shared/modal/confirm-modal/useConfirmModal'

interface GoogleSignUpRequest {
  token: string
  name: string
  employeeNumber: string
  phoneNumber: string
  companyCode: string
}

interface GoogleSignUpResponse {
  user: {
    id: number
    name: string
    email: string
    employeeNumber: string
    phoneNumber?: string
    imageUrl?: string
    isAdmin: boolean
    authProvider?: string
    company: {
      companyName: string
    }
  }
  accessToken: string
  refreshToken: string
}

const useGoogleSignUp = () => {
  const router = useRouter()
  const setUser = useUserStore.use.setUser()
  const { openConfirmModal } = useConfirmModal()

  return useMutation({
    mutationFn: async (data: GoogleSignUpRequest) => {
      const response = await axios.post<GoogleSignUpResponse>(
        `${process.env.NEXT_PUBLIC_BASE_URL}/auth/google/signup`,
        data,
      )
      return response.data
    },
    onSuccess: (data) => {
      // 토큰 저장
      setTokenCookies(data.accessToken, data.refreshToken)

      // 사용자 정보 저장
      setUser(data.user)

      // 메인 페이지로 리다이렉트
      openConfirmModal({
        text: '회원가입이 완료되었습니다!',
        onCloseSuccess: () => {
          router.push('/')
        },
      })
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || 'Google 회원가입에 실패했습니다'
      openConfirmModal({
        text: errorMessage,
      })
    },
  })
}

export default useGoogleSignUp
