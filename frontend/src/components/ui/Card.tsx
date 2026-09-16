import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glow?: boolean;
}

export function Card({ children, className = '', glow = false, ...props }: CardProps) {
  const glowClass = glow ? 'neon-glow' : '';
  
  return (
    <div 
      className={`glass rounded-2xl p-6 ${glowClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
