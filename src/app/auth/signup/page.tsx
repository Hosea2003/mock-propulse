import Logo from '@/components/ui/logo'
import { AuthForm } from '@/features/auth/components/auth-form'

function SignupPage() {
  return (
    <div className='flex flex-1 flex-col items-center p-6'>
        <Logo/>
        <div className='flex w-full max-w-sm flex-1 flex-col justify-center gap-8'>
            <div className='flex flex-col gap-2 text-center'>
                <h2 className='text-3xl font-bold'>Create your account</h2>
                <p className='text-muted-foreground'>
                    Start growing your Instagram with real followers today.
                </p>
            </div>
            <AuthForm mode='signup' />
        </div>
    </div>
  )
}

export default SignupPage
