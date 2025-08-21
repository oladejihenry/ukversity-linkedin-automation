import EditorComponent from '@/components/dashboard/Editor/EditorComponent'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Editor',
  description: 'Editor',
}

export default function EditorPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <EditorComponent />
    </main>
  )
}
