import LoginForm from '@/components/auth/LoginForm'
import { Metadata } from 'next'
import { PenTool } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Login',
  description: 'Login to your account',
}

export default function LoginPage() {
  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <div className="bg-primary rounded-full p-3">
            <PenTool className="text-primary-foreground h-8 w-8" />
          </div>
        </div>
        <h1 className="text-foreground text-3xl font-bold">UkVersity</h1>
        <p className="text-muted-foreground mt-2">Sign in to start creating amazing content</p>
      </div>

      <LoginForm />

      <div className="text-muted-foreground text-center text-sm">
        <p>Demo: Use any email and password to sign in</p>
      </div>
    </div>
  )
}
