import Logo from '@/components/ui/logo'
import { AuthForm } from '@/app/auth/auth-form'

function LoginPage() {
  return (
    <div className='flex flex-1 flex-col items-center p-6'>
        <Logo/>
        <div className='flex w-full max-w-sm flex-1 flex-col justify-center gap-8'>
            <div className='flex flex-col gap-2 text-center'>
                <h2 className='text-3xl font-bold'>Welcome to Propulse</h2>
                <p className='text-muted-foreground'>
                    Grow your Instagram with real followers and build a community around your business.
                </p>
            </div>
            <AuthForm mode='login' />
        </div>
    </div>
  )
}

export default LoginPage
