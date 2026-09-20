import { expect, test, describe } from 'vitest';
import { ACHIEVEMENTS, levelFromXp, xpForLevel, getAchievementInfo } from './gamification';

describe('Gamification Logic', () => {
  test('Level calculation from XP', () => {
    // Level 1: 0 to 199
    expect(levelFromXp(0)).toBe(1);
    expect(levelFromXp(199)).toBe(1);
    
    // Level 2: 200+
    expect(levelFromXp(200)).toBe(2);
    
    // Check higher levels based on formula: N = (xp/200)^(1/1.6) + 1
    // N=3 -> xp = 200 * (2^1.6) ~ 606
    expect(levelFromXp(610)).toBe(3);
  });

  test('Next level XP calculation', () => {
    expect(xpForLevel(1)).toBe(0); // Need 0 to reach level 1 (you start there)
    expect(xpForLevel(2)).toBe(200); // Need 200 to reach level 2
    expect(xpForLevel(3)).toBeGreaterThan(200);
  });

  test('Achievements definition exists', () => {
    expect(ACHIEVEMENTS).toBeDefined();
    expect(ACHIEVEMENTS.length).toBeGreaterThan(0);
    
    const firstSession = getAchievementInfo("first_session");
    expect(firstSession.name).toBe("First Flight");
  });
});
