"use client";

import { useEffect, useState } from "react";
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

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && user) {
      const loadSessions = async () => {
        try {
          const data = await fetchWithAuth("/sessions");
          setSessions(data);
        } catch (err: any) {
          setError(err.message || "Failed to load history");
        } finally {
          setLoading(false);
        }
      };
      loadSessions();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="flex-1 w-full flex items-center justify-center p-6 bg-[#09090b]">
        <div className="text-white text-xl animate-pulse">Loading history...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-1 w-full flex flex-col items-center justify-center p-6 bg-[#09090b]">
        <h2 className="text-3xl font-bold text-white mb-4">Access Denied</h2>
        <p className="text-zinc-400">Please login to view your workout history.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-black neon-text-glow text-white tracking-widest uppercase">Workout History</h1>
        <p className="text-zinc-400 mt-2">Past sessions for {user.username}</p>
      </div>

      {error && (
        <div className="bg-red-500/20 text-red-200 p-4 rounded-lg mb-6 border border-red-500/50">
          {error}
        </div>
      )}

      {sessions.length === 0 && !error ? (
        <div className="text-center py-20 bg-zinc-900/50 border border-white/10 rounded-2xl">
          <p className="text-zinc-400 text-lg">You haven't completed any sessions yet.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {sessions.map((session) => (
            <div key={session.id} className="bg-zinc-900/80 border border-white/10 p-6 rounded-xl flex items-center justify-between hover:border-cyan-500/50 transition-colors">
              <div>
                <div className="text-zinc-400 text-sm mb-1">
                  {new Date(session.created_at).toLocaleString()}
                </div>
                <div className="text-2xl font-black text-white">
                  Score: <span className="text-cyan-400">{session.game_score}</span>
                </div>
              </div>
              
              <div className="flex gap-8 text-center">
                <div>
                  <div className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-1">Duration</div>
                  <div className="text-white text-lg font-bold">{Math.round(session.duration_seconds)}s</div>
                </div>
                <div>
                  <div className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-1">Reps</div>
                  <div className="text-white text-lg font-bold">{session.valid_reps} / {session.total_reps}</div>
                </div>
                <div>
                  <div className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-1">Avg Form</div>
                  <div className={`text-lg font-bold ${session.average_form >= 80 ? 'text-green-400' : session.average_form >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {session.average_form}%
                  </div>
                </div>
                <div>
                  <div className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-1">Fatigue</div>
                  <div className="text-white text-lg font-bold">{session.fatigue_indicator}%</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
