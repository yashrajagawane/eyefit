import GameCanvas from "@/components/game/GameCanvas";

export default function PlayRoute() {
  return (
    <div className="flex-1 w-full flex flex-col items-center justify-center p-6 bg-[#09090b]">
      <div className="w-full max-w-5xl">
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold">Eye Flap Mode</h1>
            <p className="text-zinc-400">Pure game mode testing</p>
          </div>
        </div>
        
        <GameCanvas />
        
        <div className="mt-8 text-center text-zinc-500">
          <p>Controls: Use SPACEBAR to flap.</p>
        </div>
      </div>
    </div>
  );
}
