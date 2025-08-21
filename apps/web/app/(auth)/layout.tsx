import ThemeToggle from '@/components/theme-toggle'
import { DASHBOARD_URL } from '@/lib/constants'
import { getUser } from '@/lib/user'
import { redirect } from 'next/navigation'
import { Toaster } from 'sonner'

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()

  if (user?.data?.id) {
    redirect(DASHBOARD_URL)
  }
  return (
    <>
      <Toaster position="bottom-right" richColors />
      <div className="bg-background flex min-h-screen items-center justify-center p-4">
        <ThemeToggle />
        {children}
      </div>
    </>
  )
}
