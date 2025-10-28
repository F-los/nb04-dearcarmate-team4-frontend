import classNames from 'classnames/bind'
import styles from './SignUpForm.module.scss'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import { SignUpFormInput } from '@shared/types'
import FieldLabel from '@ui/shared/input/FieldLabel/FieldLabel'
import TextFieldConnect from '@ui/shared/form-field/TextFieldConnect'
import PasswordFieldConnect from '@ui/shared/form-field/PasswordFieldConnect'
import Button from '@ui/shared/button/Button'
import { EMAIL_VALIDATION_REGEXP, PASSWORD_VALIDATION_REGEXP, PHONE_NUMBER_VALIDATION_REGEXP } from '@ui/shared/util-constants/constants'
import useSignUp from '../data-access-auth/useSignUp'
import useGoogleSignUp from '../data-access-auth/useGoogleSignUp'
import { useEffect, useState } from 'react'

const cx = classNames.bind(styles)

type SignUpFormProps = {

}

const SignUpForm = ({ }: SignUpFormProps) => {
  const [isGoogleSignUp, setIsGoogleSignUp] = useState(false)
  const [googleToken, setGoogleToken] = useState<string | null>(null)
  const methods = useForm<SignUpFormInput>()
  const { mutate, isPending } = useSignUp()
  const googleSignUp = useGoogleSignUp()

  useEffect(() => {
    // 세션 스토리지에서 Google 정보 가져오기
    const googleInfo = sessionStorage.getItem('googleSignUpInfo')
    if (googleInfo) {
      try {
        const { email, name, token } = JSON.parse(googleInfo)
        setIsGoogleSignUp(true)
        setGoogleToken(token)

        // 폼에 자동으로 값 설정
        methods.setValue('email', email)
        methods.setValue('name', name)
        // Google 로그인 사용자는 자동 생성된 비밀번호 표시
        methods.setValue('password', 'GOOGLE_AUTH_USER')
        methods.setValue('passwordConfirmation', 'GOOGLE_AUTH_USER')

        // 세션 스토리지에서 제거 (한 번만 사용)
        sessionStorage.removeItem('googleSignUpInfo')
      } catch (error) {
        console.error('Failed to parse Google info:', error)
      }
    }
  }, [methods])

  const handleSignUp: SubmitHandler<SignUpFormInput> = async (data) => {
    if (isGoogleSignUp && googleToken) {
      // Google 회원가입
      googleSignUp.mutate({
        token: googleToken,
        name: data.name,
        employeeNumber: data.employeeNumber,
        phoneNumber: data.phoneNumber,
        companyCode: data.companyCode,
      })
    } else {
      // 일반 회원가입
      mutate(data)
    }
  }

  return (
    <FormProvider {...methods}>
      <form className={cx('container')} onSubmit={methods.handleSubmit(handleSignUp)}>
        <div className={cx('inputs')}>
          <div>
            <FieldLabel label='이름' />
            <TextFieldConnect
              name='name'
              autoComplete='name'
              placeholder='이름을 입력해 주세요'
              rules={{
                validate: value => (value && value.trim() !== '') || '필수 입력사항입니다.',
              }}
            />
          </div>
          <div>
            <FieldLabel label='이메일' />
            <TextFieldConnect
              name='email'
              autoComplete='email'
              placeholder='이메일을 입력해 주세요'
              disabled={isGoogleSignUp}
              rules={{
                required: '필수 입력사항입니다',
                pattern: {
                  value: EMAIL_VALIDATION_REGEXP,
                  message: '이메일 형식에 맞지 않습니다',
                },
              }}
            />
          </div>
          <div>
            <FieldLabel label='사원번호' />
            <TextFieldConnect
              name='employeeNumber'
              autoComplete='employee-number'
              placeholder='사원번호를 입력해 주세요'
              rules={{
                validate: value => (value && value.trim() !== '') || '필수 입력사항입니다.',
              }}
            />
          </div>
          <div>
            <FieldLabel label='연락처' />
            <TextFieldConnect
              name='phoneNumber'
              autoComplete='tel'
              placeholder='연락처를 입력해 주세요'
              rules={{
                validate: value => value.trim() !== '' || '필수 입력사항입니다.',
                pattern: {
                  value: PHONE_NUMBER_VALIDATION_REGEXP,
                  message: '전화번호 형식에 맞지 않습니다(하이픈 포함 필요)',
                },
              }}
            />
          </div>
          <div>
            <FieldLabel label='비밀번호' />
            <PasswordFieldConnect
              name='password'
              autoComplete='new-password'
              disabled={isGoogleSignUp}
              placeholder={isGoogleSignUp ? '' : ''}
              rules={{
                required: '필수 입력사항입니다',
                pattern: isGoogleSignUp ? undefined : {
                  value: PASSWORD_VALIDATION_REGEXP,
                  message: '영문, 숫자 조합 8~16자리로 입력해주세요',
                },
              }}
            />
          </div>
          <div>
            <FieldLabel label='비밀번호 확인' />
            <PasswordFieldConnect
              name='passwordConfirmation'
              autoComplete='new-password'
              placeholder={isGoogleSignUp ? '' : '비밀번호를 한번 더 입력해 주세요'}
              disabled={isGoogleSignUp}
              rules={{
                required: '필수 입력사항입니다',
                validate: value => value === methods.getValues('password') || '비밀번호가 일치하지 않습니다',
              }}
            />
          </div>
          <div>
            <FieldLabel label='기업명' />
            <TextFieldConnect
              name='companyName'
              placeholder='기업명을 입력해 주세요'
              rules={{
                validate: value => value.trim() !== '' || '필수 입력사항입니다.',
              }}
            />
          </div>
          <div>
            <FieldLabel label='기업 인증코드' />
            <TextFieldConnect
              name='companyCode'
              placeholder='기업 인증코드를 입력해 주세요'
              rules={{
                validate: value => value.trim() !== '' || '필수 입력사항입니다.',
              }}
            />
          </div>
        </div>
        <div className={cx('buttonContainer')}>
          <div className={cx('text')}>* 회사 신규 가입은 디어카메이트 담당자 문의 부탁드립니다.</div>
          <Button type='submit' size='large' theme='red' disabled={isPending}>회원가입</Button>
        </div>
      </form>
    </FormProvider>
  )
}

export default SignUpForm
