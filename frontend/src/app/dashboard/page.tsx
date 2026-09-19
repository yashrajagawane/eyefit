"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/context/AuthContext";
import { fetchWithAuth } from "@/lib/api";

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
      {/* Header */}
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black neon-text-glow text-white tracking-wider uppercase">
            Dashboard
          </h1>
          {user && (
            <p className="text-zinc-400 mt-1">
              Welcome back, <span className="text-cyan-400 font-bold">{user.username}</span> 👋
            </p>
          )}
        </div>
        <Link
          href="/play"
          className="inline-flex h-12 px-6 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold hover:bg-accent transition-all neon-glow text-sm tracking-widest"
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
              <Card key={session.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center hover:border-white/20 transition-colors">
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
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
