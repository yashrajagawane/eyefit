import { Card } from "@/components/ui/Card";
import Link from "next/link";

const MODES = [
  {
    id: "eye-flap",
    title: "👀 EYE FLAP",
    desc: "Control the bird with your gaze.",
    btn: "PLAY",
    href: "/results?mode=eye-flap" // Mocks the flow
  },
  {
    id: "push-up",
    title: "💪 PUSH-UP",
    desc: "Test your form.",
    btn: "START",
    href: "/results?mode=push-up"
  },
  {
    id: "eyefit",
    title: "🔥 EYEFIT",
    desc: "Game + Workout.",
    btn: "CHALLENGE",
    href: "/results?mode=eyefit"
  },
  {
    id: "endurance",
    title: "⏱️ ENDURANCE",
    desc: "No fixed rep target.",
    btn: "START",
    href: "/results?mode=endurance"
  }
];

export default function Challenges() {
  return (
    <div className="flex-1 w-full max-w-5xl mx-auto p-6 md:p-12">
      <h1 className="text-3xl font-bold mb-12 text-center">Select Challenge</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {MODES.map((mode) => (
          <Card key={mode.id} glow className="flex flex-col h-full border border-primary/20 hover:border-primary/60 transition-colors group">
            <h2 className="text-2xl font-bold mb-4">{mode.title}</h2>
            <p className="text-zinc-400 mb-8 flex-1">{mode.desc}</p>
            <Link 
              href={mode.href}
              className="w-full flex h-12 items-center justify-center rounded-lg bg-white/5 border border-white/10 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all font-bold tracking-wider"
            >
              {mode.btn}
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
