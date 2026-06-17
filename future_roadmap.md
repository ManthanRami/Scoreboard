# Scoreboard Hub: Future Roadmap

*This document outlines the phased expansion plan for Scoreboard Hub, moving from a robust local-first MVP to a synchronized, monetized, and comprehensive game night platform.*

---

## Phase 1: Real-Time Multiplayer Sync (Firebase)
*Transition from a single-device "Moderator" model to a synchronized multi-device experience.*

### Features
*   **Room Codes:** Generate a 4-6 character alphanumeric code (e.g., `XY7K`) when starting a game.
*   **Join Game Flow:** A new `/join` route where guest players enter the room code to access a read-only (or interactive) view of the scoreboard.
*   **Firestore Integration:** Implement the Firebase Web SDK. Sync the local Svelte 5 `$state` with Firestore documents in real-time using `onSnapshot`.
*   **Auth (Optional):** Implement anonymous Firebase Auth to track guest sessions without requiring email signups.

### Impact
*   Massively increases "Time on App" metrics as all players keep the app open, rather than just the moderator.

---

## Phase 2: Game Library Expansion
*Increase the Total Addressable Market (TAM) by supporting more popular game mechanics.*

### Features
*   **Spades / Bridge:** Implement trick-taking logic with partnership/team scoring mechanics.
*   **Rummy / Phase 10 / Uno:** Implement "negative point" accumulation logic where players tally remaining cards in hand.
*   **Generic Ledger:** A "Custom Game" mode offering a blank spreadsheet-style interface (N players, unlimited rounds, simple math operations) for unsupported games like Scrabble or Yahtzee.

### Impact
*   Captures users searching for specific game scorekeepers that currently fall outside the Kachuful/Hearts/Traitor niches.

---

## Phase 3: Advanced Player Analytics & "Elo"
*Increase long-term retention by gamifying the game night itself.*

### Features
*   **Persistent Profiles:** Upgrade the simple string-based `playerNames` to persistent ID-based profiles stored locally (or in Firebase).
*   **Stat Tracking:** Calculate lifetime win rates, average scores, and "nemesis" stats (e.g., "You lose most often when Rahul plays").
*   **Group Elo Rating:** Implement a casual, group-specific Elo system so regular friend groups can see who is statistically the best player over months of game nights.

### Impact
*   Creates strong lock-in. Groups will refuse to use paper or other apps because they don't want to miss tracking their lifetime stats.

---

## Phase 4: Monetization Integration
*Capitalize on the highly engaged, long-session user base.*

### Features
*   **Ad Network Integration:** Implement Google AdSense (or a privacy-centric alternative) for web PWAs.
*   **Strategic Placement:** Replace the `AdBannerPlaceholder.svelte` with live ad units at the bottom of the scoreboard screens.
*   **Premium Tier (Future):** Introduce a "Scoreboard Hub Pro" subscription (e.g., $1.99/mo) to remove ads and unlock advanced analytics or premium themes.

### Impact
*   Generates passive revenue leveraging the extremely high "Time on Page" typical of game scorekeeping apps (often 1-3 hours per session).

---

## Phase 5: Theming & Personalization
*Enhance the UI/UX with user-driven customization.*

### Features
*   **Theme Engine:** Expand the Tailwind CSS custom properties setup to support dynamic swapping of the color palette.
*   **Variants:** Implement predefined themes:
    *   *Classic Casino:* Green felt backgrounds, gold accents.
    *   *Cyberpunk:* Neon pink/blue, dark backgrounds.
    *   *Light Mode:* High contrast, paper-white backgrounds for bright environments.
*   **Custom Avatars:** Allow players to upload or select emoji/SVG avatars next to their names on the scoreboard.

### Impact
*   Enhances user delight and perceived app quality, encouraging word-of-mouth sharing.
