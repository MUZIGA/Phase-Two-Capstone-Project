import { AuthForm } from '../components/auth-form'

export const metadata = {
  title: 'Sign In - WriteHub',
  description: 'Sign in to your WriteHub account',
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome Back
          </h1>
          <p className="text-muted-foreground">
            Sign in to your account
          </p>
        </div>
        <AuthForm type="login" />
      </div>
    </main>
  )
}
