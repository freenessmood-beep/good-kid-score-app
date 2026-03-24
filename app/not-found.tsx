import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-8xl mb-6">🐰</div>
        <h1 className="text-4xl font-bold text-app-text mb-2">Oops!</h1>
        <p className="text-app-text/60 text-lg mb-6">This bunny got lost...</p>
        <Link href="/" className="bg-primary text-white font-bold px-6 py-3 rounded-2xl hover:bg-primary/80 transition shadow">
          Go Home 🏠
        </Link>
      </div>
    </div>
  )
}
