import { Button } from '@workspace/ui/components/button'
import Link from 'next/link'

export default function Page() {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Welcome to UkVersity LinkedIn Post Automation</h1>
        <Link href="/login" className="text-sm text-blue-500 hover:underline">
          Login
        </Link>
      </div>
    </div>
  )
}
