import { Card } from "@/components/ui/Card";
import Link from "next/link";

export default function Results() {
  return (
    <div className="flex-1 w-full max-w-4xl mx-auto p-6 md:p-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black mb-2 text-primary neon-text-glow uppercase tracking-wider">
          Session Complete 🎉
        </h1>
        <p className="text-zinc-400">EyeFit Challenge</p>
      </div>
      
      <Card glow className="mb-12 text-center bg-gradient-to-b from-primary/20 to-transparent border-primary/30">
        <div className="text-sm uppercase tracking-wider text-zinc-400 mb-2">Final Score</div>
        <div className="text-7xl font-black text-white neon-text-glow">2481</div>
      </Card>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <Card className="text-center p-4">
          <div className="text-xs text-zinc-400 uppercase mb-1">Push-ups</div>
          <div className="text-2xl font-bold">32</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-xs text-zinc-400 uppercase mb-1">Valid Reps</div>
          <div className="text-2xl font-bold text-green-400">29</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-xs text-zinc-400 uppercase mb-1">Form</div>
          <div className="text-2xl font-bold">87%</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-xs text-zinc-400 uppercase mb-1">Duration</div>
          <div className="text-2xl font-bold">08:42</div>
        </Card>
      </div>
      
      <Card className="mb-12 border-accent/30">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span>🤖</span>
          <span>AI Coach</span>
        </h2>
        <div className="space-y-4 text-zinc-300">
          <p>Great session! 💪</p>
          <div>
            <span className="text-green-400 font-bold block mb-1">Your strongest area:</span>
            Consistent form during the first 20 repetitions.
          </div>
          <div>
            <span className="text-yellow-400 font-bold block mb-1">Focus next time:</span>
            Maintain range of motion when fatigue increases.
          </div>
        </div>
      </Card>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link 
          href="/challenges"
          className="flex h-12 px-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold hover:bg-accent transition-colors"
        >
          TRY AGAIN
        </Link>
        <Link 
          href="/dashboard"
          className="flex h-12 px-8 items-center justify-center rounded-lg border border-white/20 font-bold hover:bg-white/10 transition-colors"
        >
          DASHBOARD
        </Link>
      </div>
    </div>
  );
}
