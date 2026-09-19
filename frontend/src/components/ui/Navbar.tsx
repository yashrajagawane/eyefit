"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';

export function Navbar() {
  const { user, logout } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
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
        {user ? (
          <>
            <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
              Dashboard
            </Link>
            <Link href="/history" className="text-sm font-medium hover:text-primary transition-colors">
              History
            </Link>
            <div className="text-sm text-cyan-400 font-bold ml-4 border-l border-white/20 pl-4">
              {user.username}
            </div>
            <button 
              onClick={logout}
              className="text-sm font-medium text-zinc-400 hover:text-red-400 transition-colors"
            >
              Logout
            </button>
          </>
        ) : (
          <button 
            onClick={() => setIsAuthModalOpen(true)}
            className="text-sm font-bold bg-cyan-600/20 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-600/40 px-4 py-1.5 rounded-full transition-colors neon-glow"
          >
            Login
          </button>
        )}
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </nav>
  );
}
