import Header from '@/components/dashboard/Header'
import { LOGIN_URL } from '@/lib/constants'
import { getUser } from '@/lib/user'
import { redirect } from 'next/navigation'
import { Toaster } from 'sonner'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()

  if (!user?.data?.id) {
    redirect(LOGIN_URL)
  }

  return (
    <>
      <Toaster position="bottom-right" richColors />
      <div className="bg-background min-h-screen">
        <Header user={user} />
        {children}
      </div>
    </>
  )
}
