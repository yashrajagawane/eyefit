import { Card } from "@/components/ui/Card";

export default function Settings() {
  return (
    <div className="flex-1 w-full max-w-3xl mx-auto p-6 md:p-12">
      <h1 className="text-3xl font-bold mb-12">Settings</h1>
      
      <div className="space-y-6">
        <Card>
          <h3 className="text-lg font-bold mb-4">Game Preferences</h3>
          <div className="flex items-center justify-between py-2 border-b border-white/10">
            <span>Sound Effects</span>
            <button className="w-12 h-6 bg-primary rounded-full relative">
              <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></span>
            </button>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-white/10">
            <span>Background Music</span>
            <button className="w-12 h-6 bg-zinc-700 rounded-full relative">
              <span className="absolute left-1 top-1 w-4 h-4 bg-zinc-400 rounded-full"></span>
            </button>
          </div>
          <div className="flex items-center justify-between py-2">
            <span>Show Camera Preview</span>
            <button className="w-12 h-6 bg-primary rounded-full relative">
              <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></span>
            </button>
          </div>
        </Card>
        
        <Card>
          <h3 className="text-lg font-bold mb-4">Account</h3>
          <button className="text-red-400 hover:text-red-300 font-medium">
            Sign Out
          </button>
        </Card>
      </div>
    </div>
  );
}
