// lib/gamification.ts

export const ACHIEVEMENTS = [
  { id: "first_session", name: "First Flight", description: "Complete your first session", icon: "🚀" },
  { id: "form_master", name: "Form Master", description: "Average form ≥ 90% in a session", icon: "📐" },
  { id: "rep_beast", name: "Rep Beast", description: "50+ valid reps in one session", icon: "🦍" },
  { id: "high_scorer", name: "High Scorer", description: "Game score ≥ 20", icon: "🏆" },
  { id: "streak_3", name: "On a Roll", description: "3-day streak", icon: "🔥" },
  { id: "streak_7", name: "Unstoppable", description: "7-day streak", icon: "☄️" },
  { id: "level_5", name: "Level 5", description: "Reach Level 5", icon: "⭐" },
];

export function getAchievementInfo(id: string) {
  return ACHIEVEMENTS.find(a => a.id === id) || { id, name: "Unknown", description: "", icon: "❓" };
}

export function levelFromXp(xp: number): number {
  if (xp < 200) return 1;
  return Math.floor(Math.pow(xp / 200.0, 1 / 1.6)) + 1;
}

export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.round(200 * Math.pow(level - 1, 1.6));
}

export function xpProgress(xp: number) {
  const currentLvl = levelFromXp(xp);
  const currentLvlXp = xpForLevel(currentLvl);
  const nextLvlXp = xpForLevel(currentLvl + 1);
  
  const xpIntoLevel = xp - currentLvlXp;
  const xpNeeded = nextLvlXp - currentLvlXp;
  
  const pct = Math.min(100, Math.max(0, (xpIntoLevel / xpNeeded) * 100));
  
  return {
    level: currentLvl,
    currentXp: xp,
    xpIntoLevel,
    xpNeeded,
    nextLvlXp,
    pct
  };
}
