# Scoreboard Hub: Project Instructions & Handover

## 🎯 Project Overview
Scoreboard Hub is a mobile-first PWA designed for tracking scores in social game nights (Kachuful, Hearts, Traitor). It prioritizes a zero-friction user experience with no required accounts or downloads.

## 🛠 Technical Stack
- **Framework:** SvelteKit + Svelte 5 (Runes: `$state`, `$derived`, `$props`).
- **Styling:** Tailwind CSS 4 (Vanilla CSS preference for complex animations).
- **Icons:** `@lucide/svelte`.
- **PWA:** `@vite-pwa/sveltekit` with offline support and Screen Wake Lock.
- **Persistence:** LocalStorage (Baseline) + Firebase (Upcoming).

## 📐 Architectural Mandates
1. **Local-First Baseline:** The app must remain functional offline. LocalStorage is the primary source of truth for the local user.
2. **Svelte 5 Runes:** Use Runes for all reactivity. Avoid legacy Svelte 4 syntax.
3. **No Effect Orphans:** Do not use `$effect` inside static `.svelte.ts` modules to avoid runtime errors. Trigger persistence via property setters.
4. **Mobile Utility:** Always request `navigator.wakeLock` on play screens to keep the scoreboard visible.
5. **Security:** Use `generateUUID()` from `$lib/utils/uuid` instead of `crypto.randomUUID()` to support non-HTTPS local network testing (Safari compatibility).

## 🎨 Design System: "Exaggerated Minimalism"
- **Color Palette:** Deep navy/black backgrounds with high-contrast primary accents.
- **Typography:** Large, readable numbers for scoreboard utility.
- **Tactile Feedback:** Use `navigator.vibrate(50)` for critical role reveals or eliminations.
- **Celebration:** Use `canvas-confetti` for game completion screens.

---

## 🚩 Handover Status (June 2026)

### Current State
- **Stable Branch:** `v1-stable-local` contains the complete offline-first version.
- **Development Branch:** `development` is ready for Phase 1 of the Future Roadmap.
- **Features Implemented:**
  - Kachuful (Standard & High Stakes scoring + Hook Rule validation).
  - Hearts (Penalty logic + Moon Shooting).
  - Traitor (Moderator-focused dashboard + Haptic role reveals).
  - Virality Strategy (QR Sharing, Image Recap generation, encoded Home Rules).

### Next Steps for Phase 1 (Multiplayer Sync)
1. Initialize Firebase Project and add `firebase` SDK.
2. Create a `sync.svelte.ts` service to manage Firestore connection.
3. Implement `/join/[roomCode]` route.
4. Mirror `kachuful.state` and `traitor.state` to Firestore documents.

### Unfinished Business
- Rule pages for Hearts and Traitor (currently only Kachuful is done in `/rules/`).
- Theme switcher logic is scaffolded but not implemented.
