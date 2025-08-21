'use client'

import { Button } from '@workspace/ui/components/button'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { usePathname } from 'next/navigation'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  let top = 'top-4'
  if (pathname.includes('/dashboard')) {
    top = ''
  }
  return (
    <div className={`absolute right-4 ${top} z-50`}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        className="h-8 w-8"
      >
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    </div>
  )
}
