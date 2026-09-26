# GazeFlap — UI/UX & Game Design Specification

**Version:** 1.0

---

# 1. Design Vision

GazeFlap should feel like a futuristic fitness game rather than a traditional workout tracker.

### Visual direction

- Dark-first interface
- Black/near-black background
- Purple/indigo accents
- White typography
- Glassmorphism
- Subtle neon glow
- Clean HUD elements
- Smooth motion
- Minimal clutter during gameplay

### Design personality

**Futuristic + Competitive + Fitness + Playful**

---

# 2. Design Principles

### 1. Game first

During gameplay, the user should immediately understand:

- Where the bird is
- What to avoid
- Current score
- Current reps
- Whether tracking is working

### 2. Feedback without distraction

CV feedback should be visible but never block the game.

### 3. Confidence

The UI should clearly communicate when tracking is uncertain.

### 4. Progressive disclosure

Do not show advanced analytics during the first interaction.

### 5. Privacy transparency

Camera usage should always be obvious.

---

# 3. Brand System

## Name

**GazeFlap**

## Tagline

> Your eyes control the game. Your body controls the challenge.

## Suggested visual language

Use:

- Rounded cards
- Thin borders
- Soft shadows/glows
- Large numerical metrics
- HUD-style labels
- Micro-animations

---

# 4. Application Structure

```text
/
├── Landing
├── Login
├── Register
├── Dashboard
├── Challenges
│   ├── Eye Flap
│   ├── Push-Up Challenge
│   ├── GazeFlap Challenge
│   └── Endurance Mode
├── Session
├── Results
├── Achievements
├── Leaderboard
├── Profile
└── Settings
```

---

# 5. Landing Page

## Hero

```text
EYE
FIT

Your eyes control the game.
Your body controls the challenge.

[ START CHALLENGE ]
[ EXPLORE MODES ]
```

### Supporting visual

Animated bird/game scene in the background.

Optional small webcam/CV visualization showing:

```text
Gaze: CENTER
Pose: DETECTED
Camera: READY
```

---

# 6. Dashboard Design

### Header

```text
GazeFlap                     🔔     Profile
```

### Welcome card

```text
Welcome back 👋

Ready for today's challenge?

[ START WORKOUT ]
```

### Quick statistics

```text
Workouts       Best Score       Total Reps
    18             3421             426
```

### Progress

Line/bar charts for:

- Performance
- Valid reps
- Form
- Endurance

### Recent sessions

Each session card:

```text
GazeFlap Challenge
32 reps • 08:42
Score: 2481
Form: 87%
```

---

# 7. Challenge Selection

Use large cards.

```text
┌──────────────────┐
│ 👀 EYE FLAP      │
│ Control the bird │
│                  │
│ [ PLAY ]         │
└──────────────────┘

┌──────────────────┐
│ 💪 PUSH-UP       │
│ Test your form   │
│                  │
│ [ START ]        │
└──────────────────┘

┌──────────────────┐
│ 🔥 GazeFlap        │
│ Game + Workout   │
│                  │
│ [ CHALLENGE ]    │
└──────────────────┘
```

---

# 8. Camera Setup Screen

Before starting:

```text
┌──────────────────────────────────┐
│          CAMERA SETUP             │
│                                  │
│          [ CAMERA FEED ]         │
│                                  │
│   ✓ Face detected                │
│   ✓ Lighting acceptable          │
│   ✓ Position acceptable          │
│                                  │
│      [ CALIBRATE ]               │
└──────────────────────────────────┘
```

If tracking is bad:

```text
⚠ Move slightly farther from camera
⚠ Improve lighting
```

---

# 9. Eye Calibration UX

Show one target at a time.

```text
        ●

       LOOK HERE
```

Sequence:

```text
CENTER
↓
UP
↓
DOWN
↓
CENTER
```

At completion:

```text
✓ Calibration Complete

Control sensitivity: GOOD

[ START GAME ]
```

---

# 10. Main Gameplay HUD

The gameplay screen should remain clean.

```text
┌─────────────────────────────────────────────┐
│ SCORE 482            REPS 17/30     ❤️ 82% │
│                                             │
│                 🐦                          │
│                                             │
│      ███                         ███        │
│      ███                         ███        │
│      ███                         ███        │
│                                             │
│                                             │
│  GAZE: UP          FORM: GOOD              │
└─────────────────────────────────────────────┘
```

### HUD metrics

Primary:

- Score
- Reps
- Game level

Secondary:

- Gaze state
- Form status
- Tracking confidence
- Estimated fatigue

---

# 11. Camera Overlay

A small camera preview can be placed in one corner.

```text
┌───────────────┐
│   CAMERA      │
│      👤       │
│   ● ●         │
│               │
│ TRACKING ✓    │
└───────────────┘
```

Allow a toggle:

**Show camera preview**

The actual CV pipeline can continue even when the preview is hidden.

---

# 12. Push-Up Visualization

When exercise tracking is active, show a simplified skeleton overlay.

```text
        ●
       / \
      ●   ●
       \ /
        ●
       / \
      ●   ●
```

Avoid making the visualization too busy.

Display:

```text
FORM: GOOD ✓
DEPTH: 88%
REP: 18
```

---

# 13. Feedback System

Use three levels.

### Positive

```text
✓ Perfect rep
```

### Warning

```text
⚠ Go slightly lower
```

### Tracking problem

```text
! Body not fully visible
```

Feedback should automatically disappear after a short period unless persistent.

---

# 14. Results Screen

The results screen is one of the most important pages.

```text
SESSION COMPLETE 🎉

┌─────────────────────────────┐
│        FINAL SCORE          │
│            2481             │
└─────────────────────────────┘

Push-ups          32
Valid reps        29
Form              87%
Eye control       93%
Endurance         84
Fatigue indicator 71
Duration          08:42

[ VIEW ANALYTICS ]
[ TRY AGAIN ]
[ DASHBOARD ]
```

---

# 15. Analytics Design

Break information into cards.

### Exercise

```text
32 Total
29 Valid
3 Invalid
```

### Form

```text
Average Form
█████████████████░░ 87%
```

### Fatigue

Show a timeline rather than a single number.

```text
Performance
100 ┤──────╮
 80 ┤      ╰────╮
 60 ┤           ╰──
    └──────────────
       Time →
```

Label it:

**Estimated performance/fatigue indicator**

---

# 16. AI Coach Design

```text
🤖 AI COACH

Great session! 💪

Your strongest area:
✓ Consistent form during the
  first 20 repetitions.

Focus next time:
⚠ Maintain range of motion
  when fatigue increases.

Suggested goal:
🎯 30 valid reps with >90%
   average form.
```

Keep AI output short and actionable.

---

# 17. Gamification Design

## Achievements

Cards should include:

```text
🏆 PERFECT FORM
20 valid reps in a row

████████████████████
UNLOCKED ✓
```

Locked achievement:

```text
🔒 ENDURANCE MASTER

Reach an endurance score of 90.

Progress: 74/90
```

---

# 18. Leaderboard

```text
WEEKLY LEADERBOARD

🥇 Player A       3421
🥈 Player B       3188
🥉 You            2976
4  Player D       2831
```

Do not make rankings the only measure of success.

---

# 19. Responsive Design

### Desktop

Use full gameplay canvas and side HUD.

### Tablet

Reduce secondary analytics.

### Mobile

For the first version, prioritize desktop/laptop because webcam placement and body visibility are easier to control.

A future mobile version can use the phone's front/rear camera with a redesigned exercise experience.

---

# 20. Animation Guidelines

Use motion for:

- Bird movement
- Score changes
- Achievement unlocks
- Rep counter
- Level transitions
- Results reveal

Avoid excessive animation during exercise tracking because it can distract the user.

---

# 21. Sound Design

Optional sounds:

- Game start
- Obstacle passed
- Valid rep
- Invalid rep
- Achievement
- Game over

Include:

```text
Sound: ON/OFF
```

---

# 22. Accessibility

Provide:

- Keyboard fallback for testing
- Clear text status
- High-contrast text
- Camera/tracking warnings
- Pause/stop button
- No color-only status communication

---

# 23. Error States

### Camera denied

```text
Camera access is required for
GazeFlap Challenge.

[ TRY AGAIN ]
```

### Face not detected

```text
Face not detected.

Please position your face
inside the camera area.
```

### Body not detected

```text
Full body/upper body not visible.

Adjust your camera position.
```

### Tracking lost

```text
Tracking paused.

Move back into frame.
```

---

# 24. Design Priority

### P0

- Gameplay HUD
- Camera setup
- Calibration
- Challenge selection
- Results
- Dashboard basics

### P1

- Analytics
- Achievements
- AI Coach
- Leaderboard

### P2

- Themes
- Advanced animation
- Social features
- Custom avatars

---

# 25. UX Golden Rule

**The user should never wonder:**

> “Is the camera working?”

> “Why didn't my rep count?”

> “Why did my bird move?”

> “What should I do next?”

Every important system state must be visible and understandable.
