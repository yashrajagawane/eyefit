import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center relative overflow-hidden">
      {/* Background neon elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -z-10" />
      <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-accent/20 rounded-full blur-[80px] -z-10" />
      
      <main className="flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto z-10">
        <h1 className="text-7xl md:text-9xl font-black tracking-tighter mb-2">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent neon-text-glow">
            EYE
          </span>
          <br />
          <span className="text-foreground">FIT</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-zinc-400 mt-8 mb-12 max-w-2xl font-medium tracking-wide">
          Your eyes control the game. <br className="md:hidden" />
          Your body controls the challenge.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 w-full max-w-md mx-auto">
          <Link 
            href="/challenges"
            className="flex-1 flex items-center justify-center h-14 rounded-full bg-primary text-primary-foreground font-bold text-lg hover:bg-accent transition-all neon-glow"
          >
            START CHALLENGE
          </Link>
          <Link 
            href="/dashboard"
            className="flex-1 flex items-center justify-center h-14 rounded-full border border-primary/50 text-foreground font-bold text-lg hover:bg-primary/10 transition-colors glass"
          >
            EXPLORE MODES
          </Link>
        </div>
        
        {/* CV Mock visualization block */}
        <div className="mt-24 glass px-6 py-4 rounded-xl flex items-center gap-8 text-sm font-mono text-zinc-300">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span>Gaze: CENTER</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span>Pose: DETECTED</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span>Camera: READY</span>
          </div>
        </div>
      </main>
    </div>
  );
}
