import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">Director Video Editor</h1>
        <div className="space-y-4">
          <Link 
            href="/new-editor" 
            className="block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Simple Editor
          </Link>
          <Link 
            href="/advanced-editor" 
            className="block px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
          >
            Advanced Editor
          </Link>
        </div>
      </div>
    </div>
  )
}
