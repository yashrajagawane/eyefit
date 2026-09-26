"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { fetchWithAuth } from "@/lib/api";

interface LeaderboardEntry {
  username: string;
  xp: number;
  level: number;
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithAuth("/leaderboard")
      .then(setEntries)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto p-6 md:p-12">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-black neon-text-glow text-primary tracking-wider uppercase mb-2">
          Leaderboard
        </h1>
        <p className="text-zinc-400">Top GazeFlap players globally.</p>
      </header>

      <Card glow className="bg-white/5 border border-white/10 p-0 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-zinc-500 animate-pulse">Loading rankings...</div>
        ) : entries.length === 0 ? (
          <div className="p-10 text-center text-zinc-500">No players ranked yet. Play a game to join the leaderboard!</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 bg-black/20 text-zinc-400 text-sm uppercase tracking-wider">
                <th className="p-4 font-bold text-center w-16">Rank</th>
                <th className="p-4 font-bold">Player</th>
                <th className="p-4 font-bold text-center">Level</th>
                <th className="p-4 font-bold text-right">XP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {entries.map((entry, idx) => (
                <tr key={entry.username} className="hover:bg-white/5 transition-colors group">
                  <td className="p-4 text-center font-black text-xl">
                    {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : <span className="text-zinc-500">{idx + 1}</span>}
                  </td>
                  <td className="p-4 font-bold text-lg text-white group-hover:text-primary transition-colors">
                    {entry.username}
                  </td>
                  <td className="p-4 text-center">
                    <span className="inline-block bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                      Lvl {entry.level}
                    </span>
                  </td>
                  <td className="p-4 text-right font-bold text-cyan-400">
                    {entry.xp.toLocaleString()} XP
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
