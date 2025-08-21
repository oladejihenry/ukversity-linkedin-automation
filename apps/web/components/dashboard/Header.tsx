'use client'
import { LogOut, PenTool, Plus, User } from 'lucide-react'
import ThemeToggle from '../theme-toggle'
import { Button } from '@workspace/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { useRouter } from 'next/navigation'
import { User as UserType } from '@/types/user'
import { logout } from '@/lib/auth'
import { LOGIN_URL } from '@/lib/constants'

export default function Header({ user }: { user: UserType | null }) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logout()
      //   console.log(response)
      window.location.href = LOGIN_URL
    } catch (error) {
      console.error(error)
    }
  }

  const handleNewArticle = () => {
    router.push('/dashboard/editor')
  }

  return (
    <header className="border-border bg-card/50 supports-[backdrop-filter]:bg-card/50 border-b backdrop-blur">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-primary rounded-lg p-2">
              <PenTool className="text-primary-foreground h-6 w-6" />
            </div>
            <div>
              <h1 className="text-foreground text-2xl font-bold">UkVersity</h1>
              <p className="text-muted-foreground text-sm">Manage your articles and content</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />

            <Button onClick={handleNewArticle}>
              <Plus className="mr-2 h-4 w-4" />
              New Article
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <User className="mr-2 h-4 w-4" />
                  {user?.data?.name}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
