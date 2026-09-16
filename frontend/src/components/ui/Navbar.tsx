import Link from 'next/link';

export function Navbar() {
  return (
    <nav className="glass sticky top-0 z-50 w-full px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Link href="/" className="text-xl font-bold tracking-wider neon-text-glow text-primary flex items-center gap-2">
          <span>👀</span>
          <span>EYEFIT</span>
        </Link>
      </div>
      
      <div className="flex items-center gap-6">
        <Link href="/challenges" className="text-sm font-medium hover:text-primary transition-colors">
          Challenges
        </Link>
        <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
          Dashboard
        </Link>
        <Link href="/profile" className="text-sm font-medium hover:text-primary transition-colors">
          Profile
        </Link>
      </div>
    </nav>
  );
}
