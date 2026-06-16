<div align="center">
  <img src="static/favicon.svg" alt="Scoreboard Hub Logo" width="120" height="120">
  
  # Scoreboard Hub
  
  **A beautiful, mobile-first PWA for tracking card and social deduction games.** <br>
  *No apps to download. No accounts required. Works entirely offline.*

  [![Svelte](https://img.shields.io/badge/svelte-%23f1413d.svg?style=for-the-badge&logo=svelte&logoColor=white)](https://svelte.dev/)
  [![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
</div>

---

## 🎮 The Games

Scoreboard Hub acts as a "Moderator Dashboard" for your game nights. Currently supporting:

### 🃏 Kachuful (Judgement / Oh Hell)
An up-and-down trick-taking card game with rotating trumps.
*   **Automatic Validation:** Enforces the "Hook Rule" (Dealer's bid cannot make total bids equal total tricks).
*   **Custom Home Rules:** Play with **Standard** scoring or toggle on **High Stakes** (Symmetric Double-Digit Scoring) where making a bid of 2 scores +22, and missing scores -22!
*   **Live Leaderboard:** Animated race chart shows who is currently winning.

### ♥️ Hearts
The classic evasion trick-taking game.
*   **Penalty Tracking:** Automatically calculates maximum round points based on the number of decks used (supports up to 3 decks / 10 players).
*   **Shoot the Moon:** One-tap button to register a Moon Shot, instantly scoring 0 for the shooter and max penalties for everyone else.

### 🎭 Traitor (Mafia / Werewolf)
A social deduction classic. No need for everyone to download an app!
*   **Pass-and-Play Reveal:** Hand the phone around. Players press and hold to securely reveal their role (Mafia, Detective, Doctor, Civilian). 
*   **Moderator Dashboard:** Track day/night phases, manage night actions (kills, saves, investigations), and instantly see when a win condition is met.

---

## ✨ Key Features

*   📱 **Mobile-First PWA:** Install it directly to your home screen (iOS & Android). It behaves exactly like a native app.
*   🔒 **Local-First & Private:** No cloud databases. Your game data is instantly persisted to your device's `LocalStorage`.
*   🌙 **Dark Theme:** Beautiful "Exaggerated Minimalism" design tailored for low-light environments (like a game night table).
*   🔋 **Screen Wake Lock:** Prevents your phone screen from turning off while a game is active.
*   🎉 **Celebrations:** Canvas-based confetti when a winner is crowned.
*   ↩️ **Forgiving:** Made a mistake? Use the custom undo modals to safely rollback the last round's scores.

---

## 🛠️ Tech Stack

Built with modern web technologies:
*   **Framework:** SvelteKit 2 + Svelte 5 (Runes)
*   **Styling:** Tailwind CSS 4
*   **Icons:** Lucide Svelte
*   **Persistence:** Custom LocalStorage Sync Engine
*   **Animations:** Canvas Confetti & Svelte Transitions

---

## 🚀 Getting Started

To run the project locally:

```bash
# 1. Clone the repository
git clone https://github.com/ManthanRami/Scoreboard.git

# 2. Navigate into the directory
cd Scoreboard

# 3. Install dependencies
npm install

# 4. Start the development server (available on your local network)
npm run dev -- --host
```

Open your browser to `http://localhost:5173` or access it via your phone on the same Wi-Fi network to test the mobile experience.

---

## 🏗️ Project Structure

*   `/src/routes`: SvelteKit pages (Home, Settings, History, and individual game flows).
*   `/src/lib/state`: Svelte 5 Store singletons (`kachuful.svelte.ts`, `hearts.svelte.ts`, etc.) governing game logic and persistence.
*   `/src/lib/components`: Reusable UI elements (Modals, Steppers, Score Badges).
*   `/src/lib/types`: TypeScript interfaces and pure logic helpers.

---
<div align="center">
  <i>Built for seamless game nights.</i>
</div>