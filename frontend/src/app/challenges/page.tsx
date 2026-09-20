import { Card } from "@/components/ui/Card";
import Link from "next/link";

const MODES = [
  {
    id: "eye-flap",
    title: "👀 EYE FLAP",
    desc: "Control the bird with your gaze.",
    btn: "PLAY",
    href: "/play",
    active: true,
  },
  {
    id: "push-up",
    title: "💪 PUSH-UP",
    desc: "Test your form. Pure endurance.",
    btn: "START",
    href: "/push-up",
    active: true,
  },
  {
    id: "eyefit",
    title: "🔥 EYEFIT",
    desc: "Game + Workout — gaze controls the bird, push-ups grant shields.",
    btn: "PLAY",
    href: "/play",
    active: true,
  },
  {
    id: "endurance",
    title: "⏱️ ENDURANCE",
    desc: "Survive until the timer ends. No fixed rep target.",
    btn: "START",
    href: "/endurance",
    active: true,
  }
];


export default function Challenges() {
  return (
    <div className="flex-1 w-full max-w-5xl mx-auto p-6 md:p-12">
      <h1 className="text-3xl font-bold mb-12 text-center">Select Challenge</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {MODES.map((mode) => (
          <Card key={mode.id} glow className={`flex flex-col h-full border transition-colors group ${mode.active ? 'border-primary/20 hover:border-primary/60' : 'border-white/5 opacity-60'}`}>
            <h2 className="text-2xl font-bold mb-4">{mode.title}</h2>
            <p className="text-zinc-400 mb-8 flex-1">{mode.desc}</p>
            {mode.active && mode.href ? (
              <Link 
                href={mode.href}
                className="w-full flex h-12 items-center justify-center rounded-lg bg-white/5 border border-white/10 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all font-bold tracking-wider"
              >
                {mode.btn}
              </Link>
            ) : (
              <div className="w-full flex h-12 items-center justify-center rounded-lg bg-white/5 border border-white/5 text-zinc-600 font-bold tracking-wider cursor-not-allowed">
                {mode.btn}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

