import { Card } from "@/components/ui/Card";

export default function Profile() {
  return (
    <div className="flex-1 w-full max-w-3xl mx-auto p-6 md:p-12">
      <h1 className="text-3xl font-bold mb-12">Profile</h1>
      
      <Card className="mb-8 flex items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center font-bold text-3xl text-white shadow-lg neon-glow">
          U
        </div>
        <div>
          <h2 className="text-2xl font-bold">User Name</h2>
          <p className="text-zinc-400">user@example.com</p>
        </div>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <h3 className="text-lg font-bold mb-4 text-primary">Stats</h3>
          <ul className="space-y-4">
            <li className="flex justify-between">
              <span className="text-zinc-400">Total Workouts</span>
              <span className="font-bold">18</span>
            </li>
            <li className="flex justify-between">
              <span className="text-zinc-400">Time Active</span>
              <span className="font-bold">2h 45m</span>
            </li>
            <li className="flex justify-between">
              <span className="text-zinc-400">Current Streak</span>
              <span className="font-bold text-accent">3 days 🔥</span>
            </li>
          </ul>
        </Card>
        
        <Card>
          <h3 className="text-lg font-bold mb-4 text-primary">Achievements</h3>
          <div className="space-y-4">
            <div className="p-3 bg-white/5 rounded border border-white/10 flex items-center justify-between">
              <span>🏆 Perfect Form</span>
              <span className="text-green-400 text-sm">Unlocked</span>
            </div>
            <div className="p-3 bg-white/5 rounded border border-white/10 flex items-center justify-between opacity-50">
              <span>🔒 Endurance Master</span>
              <span className="text-zinc-500 text-sm">Locked</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
