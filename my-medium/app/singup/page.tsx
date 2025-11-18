import { AuthForm } from '@/components/auth-form'

export const metadata = {
  title: 'Sign Up - WriteHub',
  description: 'Create a new WriteHub account',
}

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Join WriteHub
          </h1>
          <p className="text-muted-foreground">
            Start sharing your stories and ideas
          </p>
        </div>
        <AuthForm type="signup" />
      </div>
    </main>
  )
}
