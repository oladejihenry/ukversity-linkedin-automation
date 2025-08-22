'use client'
import { Bell, LogOut, PenTool, Plus, User } from 'lucide-react'
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
import axiosInstance from '@/lib/axios'
import { FaLinkedin } from 'react-icons/fa'
import Link from 'next/link'
import { toast } from 'sonner'
import { useUserLinkedIn } from '@/hooks/userLinkedIn'
import Image from 'next/image'

export default function Header({ user }: { user: UserType | null }) {
  const router = useRouter()
  const { data: userLinkedIn, isLoading: isLoadingLinkedIn } = useUserLinkedIn()

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

  const handleConnectLinkedIn = async () => {
    try {
      const response = await axiosInstance.get('/api/linkedin/redirect')
      if (response.status === 200) {
        window.location.href = response.data.auth_url
      }
    } catch (error) {
      console.error(error)
      toast.error('Failed to connect LinkedIn')
    }
  }

  const handleDisconnectLinkedIn = async () => {
    try {
      const response = await axiosInstance.post('/api/linkedin/disconnect')
      if (response.status === 200) {
        window.location.reload()
      }
    } catch (error) {
      console.error(error)
      toast.error('Failed to disconnect LinkedIn')
    }
  }

  return (
    <header className="border-border bg-card/50 supports-[backdrop-filter]:bg-card/50 border-b backdrop-blur">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="rounded-lg p-2 dark:bg-white">
              {/* Logo */}
              <Link href="/dashboard">
                <Image
                  src="/uk-versity.png"
                  alt="UkVersity"
                  width={70}
                  height={70}
                  className="h-auto w-auto object-contain"
                  // loading="lazy"
                  priority
                />
              </Link>
            </div>
            {/* <div>
              <h1 className="text-foreground text-2xl font-bold">UkVersity</h1>
              <p className="text-muted-foreground text-sm">
                Manage your social media articles and content
              </p>
            </div> */}
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />

            {userLinkedIn?.data?.isConnected ? (
              <Button variant="outline" size="sm" onClick={handleDisconnectLinkedIn}>
                <FaLinkedin className="mr-2 h-4 w-4" />
                Disconnect LinkedIn
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={handleConnectLinkedIn}>
                <FaLinkedin className="mr-2 h-4 w-4" />
                Connect LinkedIn
              </Button>
            )}

            {!userLinkedIn?.data?.isExpired && (
              <Button onClick={handleNewArticle}>
                <Plus className="mr-2 h-4 w-4" />
                New Article
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <User className="mr-2 h-4 w-4" />
                  {user?.data?.name}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
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
