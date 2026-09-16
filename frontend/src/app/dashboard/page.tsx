import { Card } from "@/components/ui/Card";
import Link from "next/link";

export default function Dashboard() {
  return (
    <div className="flex-1 w-full max-w-5xl mx-auto p-6 md:p-12">
      <header className="flex justify-between items-center mb-12">
        <h1 className="text-3xl font-bold">EyeFit Dashboard</h1>
        <div className="flex items-center gap-4">
          <button className="p-2 glass rounded-full hover:bg-white/10 transition-colors" title="Notifications">
            <span className="text-xl">🔔</span>
          </button>
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold text-white shadow-lg neon-glow">
            U
          </div>
        </div>
      </header>
      
      <Card glow className="mb-12 bg-gradient-to-r from-primary/10 to-accent/10">
        <h2 className="text-2xl font-bold mb-2">Welcome back 👋</h2>
        <p className="text-zinc-400 mb-6">Ready for today&apos;s challenge?</p>
        <Link 
          href="/challenges"
          className="inline-flex h-12 px-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold hover:bg-accent transition-all neon-glow"
        >
          START WORKOUT
        </Link>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="text-center">
          <div className="text-sm text-zinc-400 uppercase tracking-wider mb-2">Workouts</div>
          <div className="text-4xl font-black text-primary neon-text-glow">18</div>
        </Card>
        <Card className="text-center">
          <div className="text-sm text-zinc-400 uppercase tracking-wider mb-2">Best Score</div>
          <div className="text-4xl font-black text-primary neon-text-glow">3421</div>
        </Card>
        <Card className="text-center">
          <div className="text-sm text-zinc-400 uppercase tracking-wider mb-2">Total Reps</div>
          <div className="text-4xl font-black text-primary neon-text-glow">426</div>
        </Card>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <span>Recent Sessions</span>
        </h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="flex flex-col sm:flex-row justify-between items-start sm:items-center hover:bg-white/5 transition-colors cursor-pointer">
              <div>
                <h4 className="font-bold text-lg text-primary">EyeFit Challenge</h4>
                <p className="text-sm text-zinc-400">32 reps • 08:42</p>
              </div>
              <div className="mt-4 sm:mt-0 flex gap-8 text-right">
                <div>
                  <div className="text-xs text-zinc-500 uppercase">Score</div>
                  <div className="font-bold">2481</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500 uppercase">Form</div>
                  <div className="font-bold text-green-400">87%</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
