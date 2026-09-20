"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/context/AuthContext";
import { fetchWithAuth } from "@/lib/api";
import { xpProgress, ACHIEVEMENTS } from "@/lib/gamification";

interface Session {
  id: number;
  duration_seconds: number;
  game_score: number;
  total_reps: number;
  valid_reps: number;
  average_form: number;
  performance_score: number;
  fatigue_indicator: number;
  created_at: string;
}

interface Stats {
  totalWorkouts: number;
  totalValidReps: number;
  bestGameScore: number;
  averageForm: number;
  averagePerformance: number;
  streak: number;
  formTrend: number;   // positive = improving
  recentSessions: Session[];
}

function computeStats(sessions: Session[]): Stats {
  if (sessions.length === 0) {
    return {
      totalWorkouts: 0,
      totalValidReps: 0,
      bestGameScore: 0,
      averageForm: 0,
      averagePerformance: 0,
      streak: 0,
      formTrend: 0,
      recentSessions: [],
    };
  }

  const totalValidReps = sessions.reduce((s, x) => s + x.valid_reps, 0);
  const bestGameScore = Math.max(...sessions.map((x) => x.game_score));
  const averageForm = Math.round(
    sessions.reduce((s, x) => s + x.average_form, 0) / sessions.length
  );
  const averagePerformance = Math.round(
    sessions.reduce((s, x) => s + x.performance_score, 0) / sessions.length
  );

  // Streak: consecutive days with a session (starting from today)
  const daySet = new Set(
    sessions.map((s) => new Date(s.created_at).toDateString())
  );
  let streak = 0;
  const d = new Date();
  while (daySet.has(d.toDateString())) {
    streak++;
    d.setDate(d.getDate() - 1);
  }

  // Form trend: avg form of last 3 vs avg form of previous 3
  const formTrend =
    sessions.length >= 2
      ? sessions.slice(0, Math.min(3, sessions.length)).reduce((s, x) => s + x.average_form, 0) /
          Math.min(3, sessions.length) -
        sessions.slice(-Math.min(3, sessions.length)).reduce((s, x) => s + x.average_form, 0) /
          Math.min(3, sessions.length)
      : 0;

  return {
    totalWorkouts: sessions.length,
    totalValidReps,
    bestGameScore,
    averageForm,
    averagePerformance,
    streak,
    formTrend: Math.round(formTrend),
    recentSessions: sessions.slice(0, 5),
  };
}

function fmtDuration(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function SessionCard({ session }: { session: Session }) {
  const [feedback, setFeedback] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleAskCoach = async () => {
    if (feedback) return; // already loaded
    setLoading(true);
    try {
      const data = await fetchWithAuth(`/coach/${session.id}`);
      setFeedback(data);
    } catch (error) {
      console.error(error);
      setFeedback({ summary: "Failed to load coach feedback.", strength: "", improvement_area: "", suggested_next_target: "" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="flex flex-col hover:border-white/20 transition-colors">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <div className="font-bold text-white text-lg">Eye Flap</div>
          <div className="text-sm text-zinc-400">
            {new Date(session.created_at).toLocaleDateString(undefined, {
              weekday: "short", month: "short", day: "numeric"
            })}
            {" · "}
            {fmtDuration(session.duration_seconds)}
            {" · "}
            {session.valid_reps} reps
          </div>
        </div>
        <div className="flex gap-8 text-right mt-4 sm:mt-0">
          <div>
            <div className="text-xs text-zinc-500 uppercase">Score</div>
            <div className="font-bold text-white">{session.game_score}</div>
          </div>
          <div>
            <div className="text-xs text-zinc-500 uppercase">Form</div>
            <div className={`font-bold ${session.average_form >= 80 ? "text-green-400" : session.average_form >= 50 ? "text-yellow-400" : "text-red-400"}`}>
              {session.average_form}%
            </div>
          </div>
          <div>
            <div className="text-xs text-zinc-500 uppercase">Perf</div>
            <div className="font-bold text-cyan-400">{session.performance_score}</div>
          </div>
        </div>
      </div>
      
      {/* AI Coach Section */}
      <div className="mt-4 pt-4 border-t border-white/5">
        {!feedback && !loading && (
          <button onClick={handleAskCoach} className="text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-2">
            <span>🤖</span> Ask AI Coach
          </button>
        )}
        {loading && (
          <div className="text-sm text-zinc-500 flex items-center gap-2 animate-pulse">
            <div className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
            Analyzing session...
          </div>
        )}
        {feedback && (
          <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-lg p-4">
            <div className="text-indigo-400 font-bold mb-2 flex items-center gap-2">
              <span>🤖</span> Coach AI
            </div>
            <p className="text-white text-sm mb-3">{feedback.summary}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <div className="text-green-400 font-bold mb-1">STRENGTH</div>
                <div className="text-zinc-300">{feedback.strength}</div>
              </div>
              <div>
                <div className="text-amber-400 font-bold mb-1">IMPROVE</div>
                <div className="text-zinc-300">{feedback.improvement_area}</div>
              </div>
              <div>
                <div className="text-cyan-400 font-bold mb-1">NEXT TARGET</div>
                <div className="text-zinc-300">{feedback.suggested_next_target}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        fetchWithAuth("/sessions")
          .then((sessions: Session[]) => setStats(computeStats(sessions)))
          .catch(() => setStats(computeStats([])))
          .finally(() => setLoading(false));
      } else {
        setStats(computeStats([]));
        setLoading(false);
      }
    }
  }, [user, authLoading]);

  const formTrendLabel =
    !stats || stats.formTrend === 0
      ? null
      : stats.formTrend > 0
      ? { text: `↑ +${stats.formTrend}% improving`, color: "text-green-400" }
      : { text: `↓ ${stats.formTrend}% declining`, color: "text-red-400" };

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto p-6 md:p-12">
      {/* Header & Progress */}
      <header className="flex justify-between items-center mb-10">
        <div className="flex-1">
          <h1 className="text-3xl font-black neon-text-glow text-white tracking-wider uppercase mb-2">
            Dashboard
          </h1>
          {user ? (
            <div className="max-w-md">
              <div className="flex justify-between items-end mb-1">
                <p className="text-zinc-400">
                  Welcome back, <span className="text-cyan-400 font-bold">{user.username}</span> 👋
                </p>
                <div className="text-sm font-bold text-primary">
                  Level {user.level}
                </div>
              </div>
              
              {/* Live XP Bar */}
              <div className="bg-white/5 rounded-full h-3 w-full border border-white/10 relative overflow-hidden">
                {(() => {
                  const { pct, currentXp, nextLvlXp } = xpProgress(user.xp);
                  return (
                    <>
                      <div
                        className="bg-gradient-to-r from-primary to-accent h-3 rounded-full transition-all duration-1000"
                        style={{ width: `${pct}%` }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-md">
                        {currentXp} / {nextLvlXp} XP
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          ) : (
             <p className="text-zinc-400 mt-1">Sign in to track your progress.</p>
          )}
        </div>
        <Link
          href="/play"
          className="inline-flex h-12 px-6 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold hover:bg-accent transition-all neon-glow text-sm tracking-widest ml-4"
        >
          ▶ PLAY NOW
        </Link>
      </header>

      {/* Streak banner */}
      {stats && stats.streak > 0 && (
        <div className="mb-6 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border border-orange-400/30 rounded-xl px-6 py-3 flex items-center gap-3">
          <span className="text-2xl">🔥</span>
          <span className="font-bold text-orange-300">
            {stats.streak}-day streak! Keep it up!
          </span>
        </div>
      )}

      {/* Stat tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Workouts", value: loading ? "—" : stats?.totalWorkouts ?? 0, icon: "🏋️" },
          { label: "Best Score", value: loading ? "—" : stats?.bestGameScore ?? 0, icon: "🏆" },
          { label: "Total Reps", value: loading ? "—" : stats?.totalValidReps ?? 0, icon: "💪" },
          { label: "Avg Form", value: loading ? "—" : `${stats?.averageForm ?? 0}%`, icon: "📐" },
        ].map(({ label, value, icon }) => (
          <Card key={label} className="text-center py-6">
            <div className="text-2xl mb-1">{icon}</div>
            <div className="text-xs text-zinc-400 uppercase tracking-wider mb-1">{label}</div>
            <div className="text-3xl font-black text-primary neon-text-glow">{value}</div>
          </Card>
        ))}
      </div>

      {/* Performance + Form trend row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <Card className="flex flex-col gap-2">
          <div className="text-xs text-zinc-400 uppercase tracking-wider font-bold mb-1">Avg Performance Score</div>
          <div className="text-4xl font-black text-white">
            {loading ? "—" : stats?.averagePerformance ?? 0}
            <span className="text-zinc-500 text-lg font-normal"> / 100</span>
          </div>
          <div className="mt-2 bg-white/5 rounded-full h-2 w-full">
            <div
              className="bg-gradient-to-r from-cyan-500 to-primary h-2 rounded-full transition-all duration-700"
              style={{ width: `${stats?.averagePerformance ?? 0}%` }}
            />
          </div>
        </Card>

        <Card className="flex flex-col gap-2">
          <div className="text-xs text-zinc-400 uppercase tracking-wider font-bold mb-1">Form Trend</div>
          <div className="text-4xl font-black text-white">
            {loading ? "—" : `${stats?.averageForm ?? 0}%`}
          </div>
          {formTrendLabel && (
            <div className={`text-sm font-bold mt-1 ${formTrendLabel.color}`}>
              {formTrendLabel.text} vs previous sessions
            </div>
          )}
          {!formTrendLabel && !loading && (
            <div className="text-sm text-zinc-500 mt-1">Play more sessions to see trend</div>
          )}
        </Card>
      </div>

      {/* Achievements (only if logged in) */}
      {user && (
        <div className="mb-10">
          <h2 className="text-xl font-bold text-white mb-4">Achievements</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {ACHIEVEMENTS.map((a: any) => {
              const unlocked = user.achievements.includes(a.id);
              return (
                <Card key={a.id} className={`flex flex-col items-center text-center p-4 transition-all ${unlocked ? 'border-primary/50 bg-primary/10' : 'opacity-50 grayscale border-white/5'}`}>
                  <div className="text-4xl mb-2">{a.icon}</div>
                  <div className="font-bold text-white">{a.name}</div>
                  <div className="text-xs text-zinc-400 mt-1">{a.description}</div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent sessions */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Recent Sessions</h2>
          <Link href="/history" className="text-sm text-cyan-400 hover:text-cyan-300 font-bold">
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="text-zinc-500 text-center py-10 animate-pulse">Loading sessions…</div>
        ) : !user ? (
          <Card className="text-center py-10 border-white/5">
            <p className="text-zinc-400 mb-4">Log in to see your personal stats.</p>
            <Link href="/challenges" className="text-cyan-400 font-bold hover:underline">
              Play as guest →
            </Link>
          </Card>
        ) : stats?.recentSessions.length === 0 ? (
          <Card className="text-center py-10 border-white/5">
            <p className="text-zinc-400 mb-4">No sessions yet — play your first game!</p>
            <Link href="/play" className="inline-flex h-10 px-6 items-center rounded-full bg-primary text-white font-bold hover:bg-accent transition-all">
              Play Now
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {(stats?.recentSessions ?? []).map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
