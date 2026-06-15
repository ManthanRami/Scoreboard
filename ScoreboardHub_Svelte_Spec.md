# Scoreboard Hub — Svelte Web Spec (Mobile-First PWA)

> A unified mobile-first web app for tracking card and social deduction games.
> Platform: SvelteKit (mobile-first responsive web / installable PWA) | Auth: Phone / Email | Storage: Cloud
> Development environment: openSUSE Tumbleweed

---

## Table of Contents

1. [App Concept & Potential](#1-app-concept--potential)
2. [Architecture](#2-architecture)
3. [Tech Stack Details](#3-tech-stack-details)
4. [Detailed UI/UX Design](#4-detailed-uiux-design)
5. [Game Rules Reference](#5-game-rules-reference)
6. [Engineering Instructions](#6-engineering-instructions)

---

## 1. App Concept & Potential

### What It Is
Scoreboard Hub is a personal game-night companion app. A single person (score keeper / moderator) opens the app in a mobile browser — or as an installed Progressive Web App (PWA) on their phone or tablet — and tracks scores, rounds, and game state for a group sitting around a table. No second device, no real-time sync, no accounts for other players — just clean, fast scorekeeping with cloud backup per logged-in user.

### Why It Has Potential
- **Fragmented market**: Every card game has its own app. Nobody has built a clean unified hub.
- **Recurring use case**: Game nights happen weekly for millions of families and friend groups.
- **Traitor/Mafia gap**: Existing Mafia apps are either clunky or require all players to download something. A moderator-only dashboard is genuinely novel.
- **Zero install friction**: A mobile-first web app works instantly on any phone via a link, and can be "Added to Home Screen" as a PWA — no app store review, no platform-specific builds, instant updates for everyone on every visit.
- **One codebase, every screen**: The same SvelteKit app scales from a phone in portrait mode at the table up to a tablet propped up as a shared "moderator screen," or a laptop browser for setup.

### Monetization Placeholder
- Free tier with ads (placeholder ad slot component in code, wire up an ad network later — e.g. a web-compatible ad provider)
- Future: Premium tier — advanced stats, export, themes, custom games

---

## 2. Architecture

### High-Level Overview

```
┌───────────────────────────────────────────────────┐
│              SvelteKit App (Browser / PWA)         │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐      │
│  │  Mobile  │   │  Tablet  │   │ Desktop  │      │
│  │ Browser  │   │ Browser  │   │ Browser  │      │
│  │ (primary)│   │          │   │          │      │
│  └──────────┘   └──────────┘   └──────────┘      │
│         │              │              │           │
│         └──────┬───────┴──────────────┘           │
│                │                                  │
│         ┌──────▼──────┐                           │
│         │  App Layer  │                           │
│         │  (Svelte 5  │                           │
│         │   runes —   │                           │
│         │  $state /   │                           │
│         │  $derived)  │                           │
│         └──────┬──────┘                           │
└────────────────│────────────────────────────────────┘
                 │
         ┌───────▼────────┐
         │   Firebase     │
         │ ┌────────────┐ │
         │ │    Auth    │ │  ← Phone OTP / Email+Password (Web SDK)
         │ ├────────────┤ │
         │ │ Firestore  │ │  ← Game history, user data
         │ ├────────────┤ │
         │ │  Storage   │ │  ← Future: export files, avatars
         │ └────────────┘ │
         └────────────────┘
```

> Built as a Progressive Web App: same build is "installable" on Android, iOS (via Add to Home Screen), and desktop Chrome/Edge — no separate native binaries.

### Data Flow

```
User Action (tap / click)
    │
    ▼
Svelte Component (UI Layer, .svelte)
    │
    ▼
Reactive Game Store (Svelte 5 runes, .svelte.ts)
    │
    ▼
Service Module (Firebase wrapper, plain .ts)
    │
    ▼
Firestore / Auth (Firebase Web SDK)
```

### Firestore Data Model

The Firestore schema is framework-agnostic and unchanged from the original design:

```
users/
  {userId}/
    profile:
      displayName: string
      email: string | null
      phone: string | null
      createdAt: timestamp

    games/
      {gameId}/
        type: "kachuful" | "hearts" | "traitor"
        createdAt: timestamp
        updatedAt: timestamp
        status: "in_progress" | "completed"
        state: { ... }        ← Full game state snapshot (JSON)

    stats/
      kachuful:
        gamesPlayed: number
        gamesCompleted: number
      hearts:
        gamesPlayed: number
        gamesCompleted: number
      traitor:
        gamesPlayed: number
        mafiaWins: number
        townWins: number
```

### State Management Strategy

- **Svelte 5 runes** (`$state`, `$derived`, `$effect`) inside plain `.svelte.ts` modules — no external state library needed
- Each game exposes a singleton **class-based store** (e.g. `kachuful.svelte.ts`) with reactive `state` and methods like `startGame()`, `submitRound()`
- Game state auto-saves to Firestore on every change (debounced 2 seconds via `setTimeout` inside the store)
- On app load (in the root `+layout.svelte`), check Firestore for any `in_progress` game and offer a resume prompt
- Derived UI values (e.g. current trump suit, leaderboard order, win/loss banners) are computed with `$derived` so templates stay simple

### Navigation (SvelteKit file-based routing)

```
/                          → Home (Game Hub)
/auth                      → Login / Register
/kachuful                  → Kachuful setup
/kachuful/play             → Kachuful scoreboard
/hearts                    → Hearts setup
/hearts/play               → Hearts scoreboard
/traitor                   → Traitor setup
/traitor/reveal            → Role reveal (pass-and-play)
/traitor/play              → Moderator dashboard
/history                   → Game history list
/history/[gameId]          → Game detail / recap
/settings                  → Account, preferences, sign out
```

- Routing is handled entirely by SvelteKit's file-based `+page.svelte` convention — no router library needed.
- Built with `@sveltejs/adapter-static` so the whole app ships as static files (HTML/JS/CSS) servable from Firebase Hosting or any static host, with all logic running client-side against Firebase.
- A root `+layout.svelte` performs the auth-guard redirect (mirrors the old `GoRouter` redirect logic) using `goto()` from `$app/navigation`.

### Mobile-First Design Principles

- Base styles are written for a ~360–430px viewport (typical phone in portrait); Tailwind's `sm:` / `md:` / `lg:` breakpoints progressively enhance for tablet/desktop.
- A **bottom navigation bar** is used instead of a top app bar for primary actions — thumb-reachable on a phone held at a table.
- Minimum tap target size of 44×44px for all interactive elements (steppers, buttons, role-reveal hold area).
- `viewport-fit=cover` + CSS `env(safe-area-inset-*)` so content isn't clipped by notches/home indicators on iOS.
- PWA manifest + service worker (via `vite-plugin-pwa`) cache the app shell for offline load and enable "Add to Home Screen."

---

## 3. Tech Stack Details

### Core

| Layer | Technology | Version | Reason |
|---|---|---|---|
| Framework | SvelteKit | 2.x | File-based routing, tiny runtime, ideal for a fast mobile-first SPA/PWA |
| UI Runtime | Svelte | 5.x | Runes-based reactivity (`$state`/`$derived`/`$effect`), compiles away — minimal JS shipped to mobile |
| Language | TypeScript | 5.x | Type-safe game models and scoring logic |
| Styling | Tailwind CSS | 3.x | Utility-first, mobile-first breakpoint system |
| Build Tool | Vite | 5.x | Built into SvelteKit; instant HMR, optimized bundles |
| PWA Tooling | `vite-plugin-pwa` | latest | Service worker, web app manifest, offline caching, install prompts |
| Adapter | `@sveltejs/adapter-static` | 3.x | Outputs a static site — deployable to Firebase Hosting, no Node server required |

### Backend & Auth

| Service | Technology | Reason |
|---|---|---|
| Authentication | Firebase Auth (Web SDK) | Phone OTP (via reCAPTCHA) + Email/Password, works in any browser |
| Database | Cloud Firestore (Web SDK) | Real-time listeners, built-in offline persistence (great for spotty venue Wi-Fi) |
| File Storage | Firebase Storage | Future avatars / exported recaps |
| Hosting | Firebase Hosting | One-command deploy of the static SvelteKit build, free tier covers personal use |

### NPM Packages

```jsonc
// package.json (excerpt)
{
  "dependencies": {
    "firebase": "^10.0.0"
  },
  "devDependencies": {
    "@sveltejs/kit": "^2.0.0",
    "@sveltejs/adapter-static": "^3.0.0",
    "svelte": "^5.0.0",
    "vite": "^5.0.0",
    "vite-plugin-pwa": "^0.20.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "typescript": "^5.4.0",
    "svelte-check": "^3.6.0",
    "@fontsource/inter": "^5.0.0"
  }
}
```

> No `uuid` package needed — modern browsers provide `crypto.randomUUID()` natively.

### Platform Configuration

- **Target viewport**: mobile-first, designed for 360–430px width, scaling gracefully up to tablet (≥768px) and desktop (≥1024px) via Tailwind breakpoints.
- **PWA manifest**: `display: "standalone"`, `theme_color` matching the dark navy palette, maskable icons for Android/iOS home screen install.
- **Browser support**: evergreen mobile browsers first (Chrome/Safari on Android & iOS), then desktop Chrome/Firefox/Edge/Safari.
- **Firebase project**: a single **Web app** registration is sufficient — no separate Android app target is required.
- **Service Worker caching**: app shell (HTML/CSS/JS + fonts) precached for offline load; Firestore's own offline persistence handles data caching.

### Development Environment — openSUSE Tumbleweed

All development happens on **openSUSE Tumbleweed** (rolling release, `zypper` package manager). Setup notes:

```bash
# Node.js (Tumbleweed ships fairly recent versions; pin via nvm/fnm if needed)
sudo zypper install nodejs20 npm20 git

# Recommended: a Node version manager, since Tumbleweed updates Node frequently
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install --lts

# Package manager (pnpm recommended for SvelteKit projects)
npm install -g pnpm

# Firebase CLI (for emulators, deploy, FlutterFire-equivalent project config)
npm install -g firebase-tools

# Browsers for testing — Tumbleweed ships current Firefox by default;
# install Chromium for Chrome DevTools mobile device emulation
sudo zypper install chromium

# Svelte language server support in editors (VS Code, Zed, Neovim, etc.)
npm install -g svelte-language-server
```

**Local network testing on a real phone:**

```bash
# Run the Vite dev server bound to all interfaces
pnpm dev --host

# Open the firewall for the dev server port (default 5173) so a phone
# on the same Wi-Fi can reach http://<your-tumbleweed-ip>:5173
sudo firewall-cmd --add-port=5173/tcp --zone=public          # temporary
sudo firewall-cmd --permanent --add-port=5173/tcp --zone=public
sudo firewall-cmd --reload
```

This lets the moderator's phone load the dev build directly from the Tumbleweed machine during development — useful for testing touch gestures (press-and-hold role reveal, steppers) on real hardware rather than the desktop browser emulator.

---

## 4. Detailed UI/UX Design

### Design System

#### Color Palette (CSS custom properties / Tailwind theme)

```css
/* src/app.css — exposed as Tailwind theme colors */
:root {
  /* Dark theme (default) */
  --color-primary: #6C63FF;        /* Purple — primary actions */
  --color-primary-dark: #4B44CC;
  --color-background: #0F0F1A;     /* Near-black navy */
  --color-surface: #1A1A2E;        /* Card backgrounds */
  --color-surface-variant: #252540;/* Elevated cards */
  --color-border: #2E2E50;         /* Subtle borders */
  --color-text-primary: #F0F0FF;
  --color-text-secondary: #9090B0;

  /* Accent — per game */
  --color-kachuful-accent: #6C63FF; /* Purple/blue */
  --color-hearts-accent: #E84393;   /* Hot pink / red */
  --color-traitor-accent: #FF6B35;  /* Burnt orange */

  /* Status */
  --color-success: #4CAF50;
  --color-warning: #FFC107;
  --color-danger: #E53935;
  --color-gold: #FFD700;            /* Winner highlight */
}
```

```js
// tailwind.config.js (excerpt)
export default {
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        'primary-dark': 'var(--color-primary-dark)',
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        'surface-variant': 'var(--color-surface-variant)',
        border: 'var(--color-border)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        kachuful: 'var(--color-kachuful-accent)',
        hearts: 'var(--color-hearts-accent)',
        traitor: 'var(--color-traitor-accent)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        danger: 'var(--color-danger)',
        gold: 'var(--color-gold)',
      }
    }
  }
}
```

#### Typography

```css
/* Font: Inter via @fontsource/inter, loaded once in src/app.css */
/* Tailwind text size + weight utility mapping */
.text-display-lg   { @apply text-[28px] font-bold text-text-primary; }
.text-display-md   { @apply text-[22px] font-bold text-text-primary; }
.text-title-lg     { @apply text-[18px] font-semibold; }
.text-title-md     { @apply text-base font-medium; }            /* 16px */
.text-body-lg      { @apply text-[15px] font-normal text-text-primary; }
.text-body-md      { @apply text-[13px] font-normal text-text-secondary; }
.text-label-lg     { @apply text-sm font-medium; }               /* Buttons */
.text-label-sm     { @apply text-[11px] font-medium; }            /* Badges, chips */
```

#### Spacing & Shape

- Base unit: 8px (Tailwind's default `4px` scale maps cleanly — use `2`-step increments)
- Card border radius: `rounded-2xl` (16px)
- Button border radius: `rounded-xl` (12px)
- Input border radius: `rounded-lg` (10px)
- Chip border radius: `rounded-lg` (8px)

---

### Screen-by-Screen Design

The screen flows and wireframes below describe the **same UX** as the original spec — they are framework-agnostic — but each is implemented as a SvelteKit route (`+page.svelte`) with Tailwind classes and Svelte transitions instead of Flutter widgets/animations.

#### Screen 1 — Splash / Auth Check (`/`)

- On first load, the PWA shows its **manifest splash** (background color + icon) while the app shell loads.
- The root `+layout.svelte` checks Firebase Auth state on mount: if logged in → render Home; if not → `goto('/auth')`.
- A brief (≈300ms) fade-in (`transition:fade`) replaces the 1.5s native splash animation.

---

#### Screen 2 — Auth Screen (`/auth`)

**Layout:** Centered card on a dark gradient background (`bg-gradient-to-b from-background to-surface`)

**Phone Auth flow:**
1. Tab toggle: `Phone Number` | `Email`
2. Phone path:
   - Country code `<select>` + phone number `<input type="tel">`
   - "Send OTP" button → calls Firebase `signInWithPhoneNumber` with an invisible `RecaptchaVerifier`
   - 6-digit OTP `<input>` (numeric keypad via `inputmode="numeric"`, auto-focus, auto-submit on 6 digits)
   - Success → `goto('/')`
3. Email path:
   - Email + Password `<input>`s
   - "Login" / "Create Account" tab-switched buttons

**UX details:**
- OTP screen has a 60-second countdown with a "Resend" link (disabled until countdown ends)
- Error messages render inline below inputs (`<p class="text-danger text-body-md">`), never in modal dialogs
- "Continue as Guest" option stores game state in `localStorage`/IndexedDB only (no Firestore sync) with an "upgrade" banner shown later

---

#### Screen 3 — Home / Game Hub (`/`)

**Layout:** Scrollable column, bottom nav bar fixed to viewport bottom

```
┌─────────────────────────────────┐
│  Scoreboard Hub          👤   │  ← Top bar: title + avatar/profile
├─────────────────────────────────┤
│                                 │
│   Good evening, [Name] 👋       │
│   Ready for game night?         │
│                                 │
│  ┌─────────────┐ ┌───────────┐  │
│  │  🃏         │ │  ♥        │  │
│  │  Kachuful   │ │  Hearts   │  │
│  │  2-10 players│ │ 3-10 players│ │
│  │  [Play →]   │ │  [Play →] │  │
│  └─────────────┘ └───────────┘  │
│  ┌─────────────────────────────┐│
│  │  🎭  Traitor (Mafia)        ││
│  │  5-20 players · Social      ││
│  │                   [Play →]  ││
│  └─────────────────────────────┘│
│                                 │
│  ── Recent Games ──             │
│  [Hearts · 4 players · 2h ago]  │
│  [Kachuful · 6 players · Tue]   │
│                                 │
├─────────────────────────────────┤
│  🏠 Home   📜 History  ⚙ Settings │  ← Bottom nav (mobile)
└─────────────────────────────────┘
```

**Game cards (`GameCard.svelte`):**
- Kachuful: purple gradient (`from-kachuful to-primary-dark`), card/spade icon
- Hearts: pink/red gradient, heart icon
- Traitor: orange gradient, mask icon
- Each card shows player count range and a one-line description
- Tap → `goto('/<game>')`, or open `ResumeDialog.svelte` if an `in_progress` game exists for that type

**Resume dialog (`ResumeDialog.svelte`, bottom sheet via `transition:slide`):**
```
You have an unfinished Hearts game
4 players · Round 5 of ~12
[Resume]   [Start New]
```

---

#### Screen 4 — Kachuful Setup (`/kachuful`)

**Step 1 — Configuration**
```
← Back                    Kachuful

Players
[−]  [  4  ]  [+]       (2–10)

Decks
[−]  [  1  ]  [+]       (1–3)

──────────────────────────
Player Names

1.  [Rahul        ] [×]
2.  [Priya        ] [×]
3.  [Amit         ] [×]
4.  [Sara         ] [×]
    [+ Add Player ]

──────────────────────────
Game Summary
  Max cards/round:   10
  Total rounds:      19
  Trump order:  ♠ ♦ ♣ ♥

          [Start Game →]
```

**UX details:**
- `PlayerStepper.svelte` (+/− buttons) auto-adds/removes `PlayerNameInput.svelte` rows
- Names pre-filled with "Player 1", "Player 2", etc. (editable inputs)
- Long-press / drag handle on each name row reorders players (Svelte's `use:` action wrapping the [Pointer Events API](https://developer.mozilla.org/) for touch-friendly drag-reorder) — changes dealer order
- "Start Game" `<button disabled>` until all names are non-empty (`$derived` validation)

---

#### Screen 5 — Kachuful Scoreboard (`/kachuful/play`)

**Header (sticky top bar):**
```
← Hub       Kachuful       [New Game]

Round 3 / 19          Cards: 3         Trump: ♦
```

**Score entry area (horizontal-scroll snap container on mobile):**
```
┌────────────────────────────────────┐
│  Rahul           Total: 23 pts     │
│  Bid: [1]   Tricks: [1]    ✓       │
├────────────────────────────────────┤
│  Priya           Total: 10 pts     │
│  Bid: [2]   Tricks: [0]            │
├────────────────────────────────────┤
│  Amit            Total: 15 pts     │
│  Bid: [0]   Tricks: [0]    ✓       │
└────────────────────────────────────┘

            [Add Round →]
```

- Bid and tricks use `PlayerStepper.svelte` (0 to current card count)
- ✓ (`text-success`) = bid matches tricks (will score); ✗ (`text-danger`) = mismatch (scores 0) — computed via `$derived`
- "Add Round" `<button disabled>` until all bids/tricks are filled
- Score auto-calculates: match = `10 + bid`, miss = `0` (see `calculateKachufulScore` below)

**Score history table** (horizontal `overflow-x-auto`, sticky first column via `position: sticky; left: 0`):
```
Player  │ R1(10pts) │ R2(11pts) │ R3 │ Total
─────────────────────────────────────────────
Rahul   │  ✓ 11    │  ✗  0    │ -- │  11
Priya   │  ✓ 10    │  ✓ 12    │ -- │  22
Amit    │  ✗  0    │  ✓ 10    │ -- │  10
```

Each cell uses `ScoreBadge.svelte`: green badge = made, grey = missed, with bid/tricks fraction shown below the badge.

**Race to Top bar chart (`RaceChart.svelte`):**
- Horizontal `<div>` bars with `width` bound via `$derived` and animated through Svelte's `tweened`/`animate:` transitions, sorted by score descending
- Leader bar uses `bg-gold` + 🏆 icon

---

#### Screen 6 — Hearts Setup (`/hearts`)

Same layout pattern as Kachuful setup with:

**Deck count selector (chosen first — drives player limit):**
```
Decks
[−]  [  1  ]  [+]     (1–3)

  1 deck  → supports 3–6 players
  2 decks → supports 5–8 players
  3 decks → supports 7–10 players
```

**Player count selector (range updates based on deck count):**
```
Players
[−]  [  4  ]  [+]      (min–max for selected decks)
```

- If the user tries to add more players than the current deck count supports, the `+` button on `PlayerStepper.svelte` is disabled and an inline hint appears:
  `"Add another deck to support more players"`
- If the user reduces decks below what the current player count needs, show an inline warning:
  `"⚠ 7 players needs at least 2 decks"`

**Other fields:**
- Point limit: `<input type="range" min="50" max="300">` (default 100), shown as `"Game ends when someone hits [X] pts"`
- Player name inputs (same `PlayerNameInput.svelte` pattern as Kachuful)
- Info chip: `"Lowest score wins · Q♠ = 13 pts per deck · Shoot the moon to flip scores"`

---

#### Screen 7 — Hearts Scoreboard (`/hearts/play`)

**Header:**
```
← Hub       Hearts ♥        [New Game]

Round 6          Point limit: 100 pts
```

**Moon Shooter selector (top of entry area, horizontal chip row):**
```
Did anyone shoot the moon?
[No one]  [Rahul]  [Priya]  [Amit]  [Sara]

↳ If someone selected:
  ⚠️  Rahul shot the moon!
      Rahul scores 0. Everyone else +26 pts.
```

**Score entry (only shown if no moon shooter):**
```
♥ Rahul    [  4  ]   Running: 42 pts  🟢
♥ Priya    [  8  ]   Running: 61 pts  🟡
♥ Amit     [  0  ]   Running: 28 pts  🟢
♥ Sara     [ 14  ]   Running: 88 pts  🔴
            Max this round: 26 pts
```

- Color coding via `ScoreBadge.svelte` variants: green (<60%), yellow (60–80%), red (>80% of limit) — computed with `$derived` against `pointLimit`
- Input validates: total round points cannot exceed `26 × deckCount`
- Inline warning (`text-warning`) if the entered totals don't add up

---

#### Screen 8 — Traitor (Mafia) Setup (`/traitor`)

**Step 1 — Players**
```
← Back              Traitor

Players:  [−]  [ 8 ]  [+]     (5–20)

1.  [Rahul        ]
2.  [Priya        ]
... (dynamic list)
8.  [Deepak       ]

[+ Add Player]
```

**Step 2 — Role Configuration**
```
Role Distribution (8 players)

🔴 Mafia        [−]  [ 2 ]  [+]
🔵 Detective    [−]  [ 1 ]  [+]
🟢 Doctor       [−]  [ 1 ]  [+]
⚪ Civilians    Auto:  4

⚠️  Recommended: Mafia ≤ ⅓ of players

         [Shuffle & Assign Roles →]
```

Validation rules (enforced via `$derived` flags driving disabled state):
- Mafia count must be less than (total − mafia)
- At least 1 civilian always
- Role counts must sum to the player count

**Step 3 — Role Reveal (`/traitor/reveal`, pass-and-play)**

Full screen, dark background, centered card, **Screen Wake Lock** active.

```
┌───────────────────────────────┐
│                               │
│   📱 Pass the phone to:       │
│                               │
│         R A H U L             │
│                               │
│   Press and hold to see       │
│   your secret role            │
│                               │
│        [👁 Hold to Reveal]    │
│                               │
│         Player 1 of 8         │
└───────────────────────────────┘
```

On press-and-hold (role visible only while held — implemented with `pointerdown`/`pointerup`/`pointercancel` handlers for cross-device touch + mouse support):

```
┌───────────────────────────────┐
│                               │
│          🔴  MAFIA            │
│                               │
│   You are in the Mafia.       │
│   Stay hidden. Eliminate      │
│   the town at night.          │
│                               │
│   [Keep holding to read]      │
│                               │
│   [✓ Done — Pass Device]      │
│          (always visible)     │
│                               │
└───────────────────────────────┘
```

**Two-step interaction:**
1. Player holds down the reveal area (`pointerdown`) → role shown while `$state` flag `isHolding === true`
2. Player taps **"Done — Pass Device"** (always rendered, independent of hold state) → advances `roleRevealIndex`, hides role, transitions to next player's "Pass the phone" screen

This means:
- The player can hold as long as needed to read their role
- Releasing the hold (`pointerup`/`pointercancel`) without tapping "Done" simply sets `isHolding = false` — back to the "Pass the phone" screen, role hidden, can hold again
- Only tapping "Done" advances `roleRevealIndex` — a conscious confirmation
- Prevents accidental swipes/releases from skipping players

After the last player → `goto('/traitor/play')` (Moderator Dashboard).

**UX details:**
- `navigator.wakeLock.request('screen')` on mount, released on navigation away (with feature-detection fallback for unsupported browsers)
- The browser back gesture/button is intercepted (`beforeunload` / `popstate` guard) during the reveal sequence to prevent cheating
- "Done — Pass Device" sits below the role card, within thumb reach on a phone held in portrait
- Role text uses large (`text-display-md`/`text-display-lg`) type for one-glance readability while holding with one hand

---

#### Screen 9 — Traitor Moderator Dashboard (`/traitor/play`)

**Game Status Bar:**
```
Round 3  ·  🌞 Day Phase  ·  ⚔️ Mafia: 2  ·  🏘 Town: 5  ·  Total alive: 7
```

**Phase flow indicator (`PhaseIndicator.svelte`, horizontal stepper):**
```
[🌞 Day] → [🗳 Vote] → [🌙 Night] → [🌞 Day] → ...
                ↑ current phase highlighted
```

**Player Grid (2-column CSS grid, `grid-cols-2 gap-2`):**
```
┌────────────┐  ┌────────────┐
│ 🟢 ALIVE   │  │ 💀 DEAD    │
│ Rahul      │  │ Priya      │
│ [Role hidden]│  │ 🔴 Mafia   │
│ [Eliminate]│  │ Voted out  │
│            │  │ Round 2    │
└────────────┘  └────────────┘
```

- "Show Roles" toggle in the header reveals all roles (moderator-only `$state` flag, never persisted to other devices)
- Eliminated players are greyed out (`opacity-50`), showing role + elimination method (voted/killed)
- "Eliminate" button is only enabled during the Voting phase (`$derived` from `phase === 'voting'`)

**Night Actions Panel** (rendered only when `phase === 'night'`):
```
🌙 Night Actions

Mafia kills:     [Select player ▼]
Doctor protects: [Select player ▼]
Detective checks:[Select player ▼]

Investigation result will be shown to you privately.

            [Execute Night →]
```

After executing night:
- If the doctor protected the mafia's target: show "✅ Doctor saved [name]!" (toast/banner)
- Otherwise: show "[Name] was eliminated overnight"
- Detective result shown as a private toast: "🔍 [Name] is [Mafia / Innocent]"

**Win Condition detection (automatic, `$derived` from `traitorCheckWinner`):**
- Mafia ≥ remaining town → "🔴 Mafia Wins!" screen
- No mafia alive → "🏘 Town Wins!" screen

**Game Over Screen:**
```
🏘 Town Wins!

All Mafia have been eliminated.

Final Roles:
Rahul    —  🔴 Mafia    (Eliminated Round 3)
Priya    —  🔵 Detective (Survived)
Amit     —  🟢 Doctor   (Survived)
...

Rounds played: 4
Duration: ~35 min

[🎉 Celebration animation]

        [Play Again]   [Back to Hub]
```

`CelebrationOverlay.svelte` renders a lightweight `<canvas>`-based confetti particle effect on game end.

---

#### Screen 10 — Game History (`/history`)

```
← Back          History

Filter: [All ▼]  [This month ▼]

─────────────────────────────
♥ Hearts          2h ago
  4 players · 8 rounds completed
  Winner: Rahul (32 pts)         [View]

🃏 Kachuful       Yesterday
  6 players · 19 rounds
  Winner: Priya (187 pts)        [View]

🎭 Traitor        Tue
  10 players · 4 rounds
  Town won                       [View]
─────────────────────────────
```

**Game Detail / Recap (`/history/[gameId]`):**
- Final scores table
- Round-by-round history (collapsible accordions on mobile to save vertical space)
- Basic stat highlights (highest single-round score, closest game, etc.)

---

#### Screen 11 — Settings (`/settings`)

```
← Back          Settings

Account
  👤  Rahul Mehta
  📱  +91 98765 43210
  ✏️  Edit display name

Preferences
  🌙  Dark Mode          [Toggle]
  🔔  Sound effects      [Toggle]
  📲  Install App        [Add to Home Screen]

Data
  📤  Export game history (JSON)
  🗑️  Delete all my data

  [Sign Out]
```

- "Install App" surfaces the PWA install prompt (`beforeinstallprompt` event) on supported browsers, with a manual "Add to Home Screen" instruction fallback for iOS Safari (which doesn't fire that event).

---

### Shared Component Library (Svelte)

| Component | File | Description |
|---|---|---|
| `GameCard` | `GameCard.svelte` | Home screen game selection card with gradient and icon |
| `PlayerNameInput` | `PlayerNameInput.svelte` | Text input with drag handle and remove button |
| `ScoreBadge` | `ScoreBadge.svelte` | Colored pill showing score (green/grey/red) |
| `PlayerStepper` | `PlayerStepper.svelte` | +/− integer stepper with min/max props |
| `PhaseIndicator` | `PhaseIndicator.svelte` | Horizontal stepper for Traitor game phases |
| `RoleCard` | `RoleCard.svelte` | Full-screen press-and-hold role reveal card |
| `RaceChart` | `RaceChart.svelte` | Animated horizontal bar chart for score comparison |
| `CelebrationOverlay` | `CelebrationOverlay.svelte` | Canvas confetti effect on game win |
| `ResumeDialog` | `ResumeDialog.svelte` | Bottom sheet offering resume or new game |
| `AdBannerPlaceholder` | `AdBannerPlaceholder.svelte` | Grey placeholder slot where an ad will go |
| `BottomNav` | `BottomNav.svelte` | Mobile bottom navigation bar (Home / History / Settings) |

---

### Animations & Transitions

| Animation | Trigger | Implementation |
|---|---|---|
| Score update flash | New round added | `animate:flip` + a brief `bg-success/30` pulse via CSS transition |
| Card lift | Tap/hover on game card | CSS `transform: scale(1.02)` + `transition` on `:active`/`:hover` |
| Phase transition | Phase changes in Traitor | Svelte `transition:fade` / `transition:slide` between phase panels |
| Role reveal | Pointer hold | CSS `scale` + `filter: blur()` transition keyed on `isHolding` |
| Win celebration | Game ends | `<canvas>` particle system in `CelebrationOverlay.svelte` |
| Bar chart grow | Score chart renders/updates | Svelte `tweened` store driving bar `width` |
| Bottom sheet | Resume dialog opens | `transition:slide={{ axis: 'y' }}` |

---

## 5. Game Rules Reference

> Game rules are platform-agnostic and unchanged from the original specification.

### Kachuful

**Players:** 2–10 | **Decks:** 1–3

**Structure:**
- Rounds go up then down in card count: e.g. with 10 max cards → 10, 9, 8 … 1 … 8, 9, 10 = 19 total rounds
- Max cards per round = `floor(52 × decks / players)`
- Trump suit rotates each round in order: ♠ Spades → ♦ Diamonds → ♣ Clubs → ♥ Hearts → repeat

**Bidding rules:**
- Each player bids how many tricks they'll win (0 to cards in hand)
- The dealer (last to bid) **cannot** bid the number that would make total bids equal total tricks available (the "hook" rule — game must always be over- or under-bid)
- If 5+ players and someone bids 0 five rounds in a row, they must bid ≥1 on the 6th

**Scoring:**
- Exact bid matched → **10 + bid** points (e.g. bid 3 and win 3 = 13 points; bid 0 and win 0 = 10 points)
- Bid missed (over or under) → **0 points**

**Winning:** Highest cumulative score at end of all rounds

---

### Hearts

**Players:** 3–10 (scales with deck count) | **Decks:** 1–3

**Player / Deck capacity:**

| Decks | Comfortable player range | Max round penalty points |
|---|---|---|
| 1 deck (52 cards) | 3–6 players | 26 pts |
| 2 decks (104 cards) | 5–8 players | 52 pts |
| 3 decks (156 cards) | 7–10 players | 78 pts |

When using multiple decks, duplicate cards are included. Penalty cards scale proportionally: each deck adds 13 hearts + 1 Queen of Spades worth of penalty points. The app enforces the minimum deck count required for the selected player count and shows a warning if the player count is too high for the selected deck count.

**Structure:**
- Play continues until one player reaches or exceeds the point limit (default 100)
- At that point, the player with the **lowest** score wins

**Scoring per round:**
- Each ♥ card taken = **1 point** (penalty)
- Each Queen of Spades (Q♠) = **13 points** per deck in play
- Max points available per round = **26 × deck count**

**Shooting the Moon:**
- If one player takes **all hearts AND all Q♠ cards** in a single round:
  - That player scores **0** for the round
  - **All other players** score **+26 × decks** points each
- If the attempt fails (any single penalty card goes to another player), normal scoring applies
- The app tracks this via a "Did someone shoot the moon?" selector per round

**Breaking Hearts:**
- Hearts cannot be led until a heart has been played on a trick where a player couldn't follow suit

**Winning:** Lowest score when the point limit is hit

---

### Traitor (Mafia)

**Players:** 5–20 | **Roles:** Mafia, Detective, Doctor, Civilian

**Roles:**
- **Mafia 🔴** — Know each other. Each night, collectively choose one person to eliminate.
- **Detective 🔵** — Each night, secretly investigate one player; moderator tells them if that player is Mafia or not.
- **Doctor 🟢** — Each night, choose one player to protect (can protect themselves). If Mafia targets the protected player, they survive.
- **Civilian ⚪** — No night ability. Vote during day to eliminate suspects.

**Recommended ratio:** Roughly 1 Mafia per 3–4 players. 1 Detective, 1 Doctor regardless of group size.

**Game Flow:**

```
SETUP → ROLE REVEAL (pass device) → GAME STARTS NIGHT 1

NIGHT PHASE (eyes closed):
  1. Mafia: choose kill target
  2. Doctor: choose protect target
  3. Detective: choose investigate target
  → Moderator records all actions privately

DAY PHASE:
  1. Moderator announces: who was killed (or "nobody" if doctor saved)
  2. Open discussion: all surviving players debate
  3. Formal accusation: any player nominates a suspect
  4. Vote: majority vote eliminates the accused
  5. Eliminated player's role is revealed

CHECK WIN CONDITIONS:
  - If Mafia count ≥ Town count → Mafia wins
  - If no Mafia remain → Town wins
  - Otherwise → Next Night Phase
```

**Win conditions:**
- **Town wins:** All Mafia members are eliminated
- **Mafia wins:** Mafia players equal or outnumber the remaining town (at this point they can control all votes)

---

## 6. Engineering Instructions

### Project Setup (on openSUSE Tumbleweed)

```bash
# 0. System prerequisites (Tumbleweed)
sudo zypper install nodejs20 npm20 git chromium

# 1. Create SvelteKit project
npm create svelte@latest scoreboard-hub
# → Choose: Skeleton project, TypeScript syntax, ESLint + Prettier

cd scoreboard-hub
pnpm install   # (or npm install)

# 2. Add Tailwind CSS
npx svelte-add@latest tailwindcss
pnpm install

# 3. Add Firebase
pnpm add firebase

# 4. Add PWA support + static adapter
pnpm add -D vite-plugin-pwa @sveltejs/adapter-static

# 5. Add Inter font
pnpm add @fontsource/inter

# 6. Initialize Firebase project (login via browser on Tumbleweed)
firebase login
firebase init hosting
firebase init firestore
```

`svelte.config.js` excerpt (static adapter for a fully client-side PWA):

```js
import adapter from '@sveltejs/adapter-static';

export default {
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: 'index.html', // SPA fallback for client-side routing
      precompress: false
    })
  }
};
```

---

### Folder Structure

```
scoreboard-hub/
├── src/
│   ├── app.html
│   ├── app.css                       ← Tailwind + CSS custom properties
│   ├── app.d.ts
│   │
│   ├── lib/
│   │   ├── firebase/
│   │   │   ├── config.ts             ← Firebase app init
│   │   │   ├── auth.ts                ← Auth wrapper (OTP + Email)
│   │   │   └── firestore.ts           ← Game state save/load helpers
│   │   │
│   │   ├── state/                     ← Svelte 5 runes "stores"
│   │   │   ├── auth.svelte.ts
│   │   │   ├── kachuful.svelte.ts
│   │   │   ├── hearts.svelte.ts
│   │   │   ├── traitor.svelte.ts
│   │   │   └── theme.svelte.ts
│   │   │
│   │   ├── types/
│   │   │   ├── kachuful.ts
│   │   │   ├── hearts.ts
│   │   │   └── traitor.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── scoring.ts             ← Pure scoring functions (ported from Dart)
│   │   │   ├── dateFormatter.ts
│   │   │   └── validators.ts
│   │   │
│   │   └── components/
│   │       ├── GameCard.svelte
│   │       ├── PlayerNameInput.svelte
│   │       ├── ScoreBadge.svelte
│   │       ├── PlayerStepper.svelte
│   │       ├── PhaseIndicator.svelte
│   │       ├── RoleCard.svelte
│   │       ├── RaceChart.svelte
│   │       ├── CelebrationOverlay.svelte
│   │       ├── ResumeDialog.svelte
│   │       ├── AdBannerPlaceholder.svelte
│   │       └── BottomNav.svelte
│   │
│   └── routes/
│       ├── +layout.svelte             ← Auth guard, BottomNav, theme
│       ├── +page.svelte               ← Home
│       ├── auth/
│       │   └── +page.svelte
│       ├── kachuful/
│       │   ├── +page.svelte           ← Setup
│       │   └── play/
│       │       └── +page.svelte       ← Scoreboard
│       ├── hearts/
│       │   ├── +page.svelte
│       │   └── play/
│       │       └── +page.svelte
│       ├── traitor/
│       │   ├── +page.svelte           ← Setup
│       │   ├── reveal/
│       │   │   └── +page.svelte
│       │   └── play/
│       │       └── +page.svelte       ← Dashboard
│       ├── history/
│       │   ├── +page.svelte
│       │   └── [gameId]/
│       │       └── +page.svelte
│       └── settings/
│           └── +page.svelte
│
├── static/
│   ├── manifest.webmanifest           ← PWA manifest
│   └── icons/                         ← Maskable icons (192/512/etc.)
│
├── vite.config.ts                     ← vite-plugin-pwa config
├── svelte.config.js
├── tailwind.config.js
└── package.json
```

---

### Data Models (TypeScript)

```typescript
// src/lib/types/kachuful.ts

export enum TrumpSuit {
  Spades = 'spades',
  Diamonds = 'diamonds',
  Clubs = 'clubs',
  Hearts = 'hearts',
}

export interface KachufulPlayerRound {
  bid: number;
  tricks: number;
  score: number;   // 0 or (10 + bid)
}

export interface KachufulPlayer {
  name: string;
  totalScore: number;
  rounds: KachufulPlayerRound[];
}

export interface KachufulGameState {
  gameId: string;
  players: KachufulPlayer[];
  currentRound: number;     // 1-indexed
  deckCount: number;
  maxCards: number;          // max cards in a single round
  totalRounds: number;       // (maxCards * 2) - 1
  gameEnded: boolean;
  winnerId: string | null;
}

const TRUMP_ORDER: TrumpSuit[] = [
  TrumpSuit.Spades,
  TrumpSuit.Diamonds,
  TrumpSuit.Clubs,
  TrumpSuit.Hearts,
];

export function currentTrump(state: KachufulGameState): TrumpSuit {
  return TRUMP_ORDER[(state.currentRound - 1) % 4];
}

export function currentCards(state: KachufulGameState): number {
  // Ascending then descending: 1 → max → 1
  return state.currentRound <= state.maxCards
    ? state.currentRound
    : state.maxCards * 2 - state.currentRound;
}
```

```typescript
// src/lib/types/hearts.ts

export interface HeartsPlayer {
  name: string;
  totalScore: number;
}

export interface HeartsRound {
  roundNumber: number;
  moonShooterIndex: number | null;  // null = no moon shot
  rawScores: number[];               // scores before moon adjustment
}

export interface HeartsGameState {
  gameId: string;
  players: HeartsPlayer[];   // 3–10 players depending on deck count
  currentRound: number;
  deckCount: number;          // 1–3 decks; drives max players + max round points
  pointLimit: number;
  rounds: HeartsRound[];
  gameEnded: boolean;
  winnerId: string | null;    // Player with LOWEST score when limit hit
}

export function maxRoundPoints(state: HeartsGameState): number {
  return 26 * state.deckCount;   // 26 / 52 / 78
}

export function maxPlayers(deckCount: number): number {
  return deckCount === 1 ? 6 : deckCount === 2 ? 8 : 10;
}
```

```typescript
// src/lib/types/traitor.ts

export enum TraitorRole {
  Mafia = 'mafia',
  Detective = 'detective',
  Doctor = 'doctor',
  Civilian = 'civilian',
}

export type GamePhase = 'day' | 'voting' | 'night';

export interface TraitorPlayer {
  id: string;
  name: string;
  role: TraitorRole;
  isAlive: boolean;
  isProtected: boolean;
  eliminatedBy: 'vote' | 'kill' | null;
  eliminatedRound: number | null;
}

export interface NightActions {
  mafiaTargetId: string | null;
  doctorProtectId: string | null;
  detectiveInvestigateId: string | null;
}

export interface TraitorGameState {
  gameId: string;
  players: TraitorPlayer[];
  currentRound: number;
  phase: GamePhase;
  gameEnded: boolean;
  winner: 'mafia' | 'town' | null;
  nightActions: NightActions;
  roleRevealIndex: number;       // which player is currently revealing role
  roleRevealComplete: boolean;
}

export function alivePlayers(state: TraitorGameState): TraitorPlayer[] {
  return state.players.filter((p) => p.isAlive);
}

export function aliveMafia(state: TraitorGameState): number {
  return alivePlayers(state).filter((p) => p.role === TraitorRole.Mafia).length;
}

export function aliveTown(state: TraitorGameState): number {
  return alivePlayers(state).filter((p) => p.role !== TraitorRole.Mafia).length;
}
```

---

### Reactive State Modules (Svelte 5 Runes)

```typescript
// src/lib/state/kachuful.svelte.ts
import { browser } from '$app/environment';
import type { KachufulGameState, KachufulPlayerRound } from '$lib/types/kachuful';
import { calculateKachufulScore } from '$lib/utils/scoring';
import { loadInProgressGame, saveGameState } from '$lib/firebase/firestore';

class KachufulStore {
  state = $state<KachufulGameState | null>(null);
  private saveTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    if (browser) this.restore();
  }

  async restore() {
    const saved = await loadInProgressGame<KachufulGameState>('kachuful');
    if (saved) this.state = saved;
  }

  startGame(playerNames: string[], deckCount: number) {
    const maxCards = Math.floor((52 * deckCount) / playerNames.length);
    this.state = {
      gameId: crypto.randomUUID(),
      players: playerNames.map((name) => ({ name, totalScore: 0, rounds: [] })),
      currentRound: 1,
      deckCount,
      maxCards,
      totalRounds: maxCards * 2 - 1,
      gameEnded: false,
      winnerId: null,
    };
    this.scheduleSave();
  }

  submitRound(entries: { bid: number; tricks: number }[]) {
    if (!this.state) return;
    const rounds: KachufulPlayerRound[] = entries.map(({ bid, tricks }) => ({
      bid,
      tricks,
      score: calculateKachufulScore(bid, tricks),
    }));

    this.state.players.forEach((player, i) => {
      player.rounds.push(rounds[i]);
      player.totalScore += rounds[i].score;
    });

    if (this.state.currentRound >= this.state.totalRounds) {
      this.state.gameEnded = true;
      this.state.winnerId = [...this.state.players].sort(
        (a, b) => b.totalScore - a.totalScore
      )[0].name;
    } else {
      this.state.currentRound++;
    }

    this.scheduleSave();
  }

  private scheduleSave() {
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => {
      if (this.state) saveGameState('kachuful', this.state);
    }, 2000);
  }
}

export const kachuful = new KachufulStore();
```

`$derived` values are computed directly in components, e.g. inside `kachuful/play/+page.svelte`:

```svelte
<script lang="ts">
  import { kachuful } from '$lib/state/kachuful.svelte';
  import { currentTrump, currentCards } from '$lib/types/kachuful';

  const trump = $derived(kachuful.state ? currentTrump(kachuful.state) : null);
  const cards = $derived(kachuful.state ? currentCards(kachuful.state) : 0);
</script>
```

---

### Firebase Auth Implementation (Web SDK)

```typescript
// src/lib/firebase/auth.ts
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type ConfirmationResult,
  type User,
} from 'firebase/auth';
import { app } from './config';

export const auth = getAuth(app);

let confirmationResult: ConfirmationResult | null = null;

export async function sendOTP(phoneNumber: string, recaptchaContainerId: string) {
  const verifier = new RecaptchaVerifier(auth, recaptchaContainerId, { size: 'invisible' });
  confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, verifier);
}

export async function verifyOTP(code: string) {
  if (!confirmationResult) throw new Error('No OTP request in progress');
  return confirmationResult.confirm(code);
}

export const signInEmail = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

export const createEmailAccount = (email: string, password: string) =>
  createUserWithEmailAndPassword(auth, email, password);

export const signOut = () => firebaseSignOut(auth);

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
```

---

### Auth Guard (root layout)

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { onAuthChange } from '$lib/firebase/auth';
  import BottomNav from '$lib/components/BottomNav.svelte';

  let user = $state<import('firebase/auth').User | null>(null);
  let checked = $state(false);

  onMount(() => {
    return onAuthChange((u) => {
      user = u;
      checked = true;

      const isAuthRoute = $page.url.pathname === '/auth';
      if (!u && !isAuthRoute) goto('/auth');
      if (u && isAuthRoute) goto('/');
    });
  });
</script>

{#if checked}
  <slot />
  {#if user}
    <BottomNav />
  {/if}
{/if}
```

---

### Key Scoring Logic (TypeScript)

```typescript
// src/lib/utils/scoring.ts
import type { HeartsPlayer } from '$lib/types/hearts';
import type { TraitorGameState } from '$lib/types/traitor';
import { aliveMafia, aliveTown } from '$lib/types/traitor';

// Kachuful score calculation
export function calculateKachufulScore(bid: number, tricks: number): number {
  return bid === tricks ? 10 + bid : 0;
}

// Hearts: max round points for a given deck count
export function heartsMaxRoundPoints(deckCount: number): number {
  return 26 * deckCount; // 26, 52, or 78
}

// Hearts: minimum deck count required for a player count
export function heartsMinDecks(playerCount: number): number {
  if (playerCount <= 6) return 1;
  if (playerCount <= 8) return 2;
  return 3; // 9–10 players
}

// Hearts: max players supported by a deck count
export function heartsMaxPlayers(deckCount: number): number {
  if (deckCount === 1) return 6;
  if (deckCount === 2) return 8;
  return 10;
}

// Hearts: moon shot handling (scales with deck count)
export function applyMoonShot(
  shooterIndex: number,
  playerCount: number,
  deckCount: number
): number[] {
  const maxPoints = heartsMaxRoundPoints(deckCount);
  return Array.from({ length: playerCount }, (_, i) =>
    i === shooterIndex ? 0 : maxPoints
  );
}

// Hearts: detect game over — winner has the LOWEST score
export function heartsCheckWinner(
  players: HeartsPlayer[],
  pointLimit: number
): string | null {
  const anyOverLimit = players.some((p) => p.totalScore >= pointLimit);
  if (!anyOverLimit) return null;
  return [...players].sort((a, b) => a.totalScore - b.totalScore)[0].name;
}

// Traitor: check win conditions
export function traitorCheckWinner(state: TraitorGameState): 'mafia' | 'town' | null {
  if (aliveMafia(state) === 0) return 'town';
  if (aliveMafia(state) >= aliveTown(state)) return 'mafia';
  return null;
}
```

---

### Auto-Save Pattern (Debounced, Firestore)

```typescript
// src/lib/firebase/firestore.ts
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './config';
import { auth } from './auth';

export async function saveGameState<T>(
  type: 'kachuful' | 'hearts' | 'traitor',
  state: T & { gameId: string; gameEnded?: boolean }
) {
  const uid = auth.currentUser?.uid;
  if (!uid) return; // guest mode — caller falls back to localStorage

  await setDoc(
    doc(db, 'users', uid, 'games', state.gameId),
    {
      type,
      state,
      status: state.gameEnded ? 'completed' : 'in_progress',
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function loadInProgressGame<T>(
  type: 'kachuful' | 'hearts' | 'traitor'
): Promise<T | null> {
  const uid = auth.currentUser?.uid;
  if (!uid) return null;

  // In practice: query games collection where type == type && status == 'in_progress',
  // ordered by updatedAt desc, limit 1. Simplified here for brevity.
  const snap = await getDoc(doc(db, 'users', uid, 'games', 'latest-' + type));
  return snap.exists() ? (snap.data().state as T) : null;
}
```

Every game store's `scheduleSave()` (shown above for Kachuful; identical pattern for Hearts and Traitor) debounces writes with a 2-second `setTimeout`, exactly mirroring the original debounced auto-save design.

---

### PWA Configuration

```typescript
// vite.config.ts
import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    sveltekit(),
    SvelteKitPWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Scoreboard Hub',
        short_name: 'Scoreboard',
        description: 'Game-night scorekeeping for Kachuful, Hearts & Traitor',
        theme_color: '#0F0F1A',
        background_color: '#0F0F1A',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}']
      }
    })
  ]
});
```

---

### Implementation Order

Follow this order to ship a working MVP:

1. **Project setup** — SvelteKit project (static adapter), Tailwind, Firebase config, on Tumbleweed dev machine
2. **Core** — `app.css` theme tokens, Tailwind config, Inter font, base layout shell with bottom nav
3. **Auth feature** — Phone OTP + Email flows, `auth.svelte.ts` state, `+layout.svelte` redirect guard
4. **Home screen** — Game cards, recent games placeholder
5. **Shared components** — `PlayerNameInput`, `ScoreBadge`, `PlayerStepper`, `GameCard`, `BottomNav`
6. **Kachuful** — Types → `kachuful.svelte.ts` → Setup route → Scoreboard route → Firestore save
7. **Hearts** — Types → `hearts.svelte.ts` → Setup route → Scoreboard route → Moon logic
8. **Traitor** — Types → `traitor.svelte.ts` → Setup → Role reveal route (Wake Lock + press-and-hold) → Dashboard → Night actions → Win detection
9. **Game history** — Firestore query, history list, game detail route
10. **Settings** — Sign out, display name edit, data export, PWA install prompt
11. **Ad placeholders** — `AdBannerPlaceholder.svelte` on all game screens
12. **PWA polish** — manifest, service worker, offline fallback page, install banners
13. **Testing** — Manual test all game flows on Chromium + Firefox (desktop) and on a real phone over LAN (Tumbleweed dev server + firewall rule)

---

### Platform-Specific Notes

**Mobile Web (primary target):**
- Press-and-hold role reveal uses `pointerdown` / `pointerup` / `pointercancel` (not `mousedown`/`touchstart` separately) for unified mouse + touch handling
- `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">` plus `env(safe-area-inset-*)` padding for iOS notches/home indicators
- Disable pull-to-refresh where it would interfere with gestures: `overscroll-behavior-y: contain` on the root layout
- Use `inputmode="numeric"` and `<input type="tel">` for OTP and numeric steppers to bring up the correct mobile keyboard

**PWA / Installability:**
- `vite-plugin-pwa` generates the service worker and manifest; precache the app shell for offline loads
- Android Chrome: native install prompt via `beforeinstallprompt`
- iOS Safari: no install prompt event — show manual "Share → Add to Home Screen" instructions in Settings
- Firestore's built-in offline persistence (`enableIndexedDbPersistence`) handles data caching for spotty venue Wi-Fi

**Desktop/Tablet Web:**
- Tailwind `md:`/`lg:` breakpoints introduce a wider layout (e.g. two-column score entry, larger touch targets become optional)
- Full keyboard navigation: all interactive elements are focusable buttons/inputs with visible `:focus-visible` rings

**Wake Lock (Traitor role reveal):**
```typescript
let wakeLock: WakeLockSentinel | null = null;

async function requestWakeLock() {
  try {
    wakeLock = await navigator.wakeLock?.request('screen');
  } catch {
    // Unsupported or denied — degrade gracefully, screen may dim during reveal
  }
}

function releaseWakeLock() {
  wakeLock?.release();
  wakeLock = null;
}
```

**Development (openSUSE Tumbleweed):**
- `pnpm dev --host` + `firewall-cmd` port rule (see Section 3) for testing on a real phone over LAN
- `pnpm build && pnpm preview` to test the production static build locally before `firebase deploy`
- Keep Node.js pinned via `nvm`/`fnm` if a Tumbleweed `zypper dup` bumps the system Node version mid-project

---

### Firestore Security Rules

Unchanged — backend-agnostic:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null
                         && request.auth.uid == userId;
    }
  }
}
```

All user data is strictly scoped to their own UID. No user can read or write another user's data.

---

### Future Extensibility Hooks (Build These Now, Use Later)

- `GameRepository<T>` TypeScript interface — add new games without touching existing Firestore code
- `AdService` module with `showBanner()` / `showInterstitial()` stubs — wire up a web ad provider later
- `AnalyticsService` module with `logGameStarted()` / `logGameCompleted()` stubs — wire to Firebase Analytics (Web) later
- `ShareService` using the **Web Share API** (`navigator.share`) — generate and share a game recap image later
- `theme.svelte.ts` — dark/light mode store, respects `prefers-color-scheme`, only dark theme designed for now

---

*End of Specification — Scoreboard Hub (Svelte Web) v1.0*
