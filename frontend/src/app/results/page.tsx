"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { fetchWithAuth } from "@/lib/api";
import { getAchievementInfo } from "@/lib/gamification";

interface SessionResult {
  id: number;
  game_score: number;
  total_reps: number;
  valid_reps: number;
  average_form: number;
  performance_score: number;
  fatigue_indicator: number;
  duration_seconds: number;
  xp_earned?: number;
  new_total_xp?: number;
  level?: number;
  leveled_up?: boolean;
  unlocked_achievements?: string[];
}

interface CoachFeedback {
  summary: string;
  strength: string;
  improvement_area: string;
  suggested_next_target: string;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function Results() {
  const router = useRouter();
  const [session, setSession] = useState<SessionResult | null>(null);
  const [coach, setCoach] = useState<CoachFeedback | null>(null);
  const [coachLoading, setCoachLoading] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("eyefit_last_session");
    if (!raw) {
      // No session data — redirect back
      router.replace("/challenges");
      return;
    }
    try {
      const data = JSON.parse(raw) as SessionResult;
      setSession(data);

      // Fetch AI coach feedback in the background
      if (data.id) {
        setCoachLoading(true);
        fetchWithAuth(`/coach/${data.id}`)
          .then((fb) => setCoach(fb as CoachFeedback))
          .catch(() => setCoach(null))
          .finally(() => setCoachLoading(false));
      }
    } catch {
      router.replace("/challenges");
    }
  }, [router]);

  if (!session) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-zinc-500 animate-pulse">Loading results...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto p-6 md:p-12">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black mb-2 text-primary neon-text-glow uppercase tracking-wider">
          Session Complete 🎉
        </h1>
        <p className="text-zinc-400">EyeFit Challenge</p>
      </div>

      {/* Score */}
      <Card glow className="mb-8 text-center bg-gradient-to-b from-primary/20 to-transparent border-primary/30">
        <div className="text-sm uppercase tracking-wider text-zinc-400 mb-2">Final Score</div>
        <div className="text-7xl font-black text-white neon-text-glow">
          {session.game_score.toLocaleString()}
        </div>
      </Card>

      {/* XP & Level Row */}
      {session.xp_earned !== undefined && (
        <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-5 py-2">
            <span className="text-yellow-400 font-black text-lg">+{session.xp_earned} XP</span>
          </div>
          {session.leveled_up && (
            <div className="flex items-center gap-2 bg-primary/20 border border-primary/50 rounded-full px-5 py-2 animate-bounce">
              <span className="text-primary font-bold">⭐ Level Up! Now Level {session.level}</span>
            </div>
          )}
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="text-center p-4">
          <div className="text-xs text-zinc-400 uppercase mb-1">Push-ups</div>
          <div className="text-3xl font-black">{session.total_reps}</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-xs text-zinc-400 uppercase mb-1">Valid Reps</div>
          <div className="text-3xl font-black text-green-400">{session.valid_reps}</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-xs text-zinc-400 uppercase mb-1">Avg Form</div>
          <div className="text-3xl font-black">{session.average_form}%</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-xs text-zinc-400 uppercase mb-1">Duration</div>
          <div className="text-3xl font-black">{formatDuration(session.duration_seconds)}</div>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card className="p-4">
          <div className="text-xs text-zinc-400 uppercase mb-2">Performance Score</div>
          <div className="text-2xl font-black mb-2">{session.performance_score}<span className="text-sm font-normal text-zinc-500">/100</span></div>
          <div className="w-full bg-zinc-800 rounded-full h-2">
            <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${session.performance_score}%` }} />
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-zinc-400 uppercase mb-2">Fatigue Indicator *</div>
          <div className="text-2xl font-black mb-2">{session.fatigue_indicator}<span className="text-sm font-normal text-zinc-500">/100</span></div>
          <div className="w-full bg-zinc-800 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all"
              style={{
                width: `${session.fatigue_indicator}%`,
                backgroundColor: session.fatigue_indicator > 70 ? '#f87171' : session.fatigue_indicator > 40 ? '#fbbf24' : '#34d399'
              }}
            />
          </div>
        </Card>
      </div>

      {/* Unlocked Achievements */}
      {session.unlocked_achievements && session.unlocked_achievements.length > 0 && (
        <Card glow className="mb-8 border-yellow-500/30 bg-yellow-500/5">
          <h2 className="text-lg font-bold mb-4 text-yellow-400">🏆 Achievements Unlocked!</h2>
          <div className="flex flex-wrap gap-3">
            {session.unlocked_achievements.map((id) => {
              const info = getAchievementInfo(id);
              return (
                <div key={id} className="flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/30 rounded-lg px-3 py-2">
                  <span className="text-2xl">{info.icon}</span>
                  <div>
                    <div className="font-bold text-white text-sm">{info.name}</div>
                    <div className="text-xs text-zinc-400">{info.description}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* AI Coach */}
      <Card className="mb-10 border-accent/30">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span>🤖</span>
          <span>AI Coach</span>
        </h2>
        {coachLoading ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-3 bg-white/10 rounded w-3/4" />
            <div className="h-3 bg-white/10 rounded w-1/2" />
            <div className="h-3 bg-white/10 rounded w-2/3" />
          </div>
        ) : coach ? (
          <div className="space-y-4 text-zinc-300">
            <p>{coach.summary}</p>
            <div>
              <span className="text-green-400 font-bold block mb-1">Your strongest area:</span>
              {coach.strength}
            </div>
            <div>
              <span className="text-yellow-400 font-bold block mb-1">Focus next time:</span>
              {coach.improvement_area}
            </div>
            <div>
              <span className="text-primary font-bold block mb-1">🎯 Suggested goal:</span>
              {coach.suggested_next_target}
            </div>
          </div>
        ) : (
          <p className="text-zinc-500 text-sm">AI Coach feedback unavailable. Check your GEMINI_API_KEY configuration.</p>
        )}
      </Card>

      {/* Disclaimer */}
      <p className="text-center text-xs text-zinc-600 mb-8">
        * Fatigue indicator is an estimated performance signal based on movement trends, not a medical measurement.
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/play"
          className="flex h-12 px-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold hover:bg-accent transition-colors"
        >
          PLAY AGAIN
        </Link>
        <Link
          href="/dashboard"
          className="flex h-12 px-8 items-center justify-center rounded-lg border border-white/20 font-bold hover:bg-white/10 transition-colors"
        >
          DASHBOARD
        </Link>
        <Link
          href="/challenges"
          className="flex h-12 px-8 items-center justify-center rounded-lg border border-white/10 text-zinc-400 font-bold hover:bg-white/5 transition-colors"
        >
          CHALLENGES
        </Link>
      </div>
    </div>
  );
}
