# Codebase Analysis Report

*Date: June 15, 2026*

This report details the findings of an architectural and code quality analysis of the Scoreboard Hub SvelteKit project. While the Svelte 5 (Runes) implementation is modern and structurally sound, several critical bugs, architectural gaps, and UX inconsistencies were identified.

## 🚨 Critical Issues

1. **Unrendered Resume Dialog:**
   - **Location:** `src/routes/+page.svelte`
   - **Issue:** The `ResumeDialog` component is imported, and its underlying state and logic (`handleGameClick`, `activeGameId`) are fully implemented. However, the component itself is **never rendered** in the template, and the `onclick` handler is not attached to the `GameCard` components. The resume flow from the home screen is broken.

2. **Lost History Sync on Refresh:**
   - **Location:** `src/lib/state/*.svelte.ts` (Game Stores)
   - **Issue:** The `lastSavedHistoryId` variable is stored in memory within the class instance. If a game is completed (saving it to history) and the user refreshes the page, `lastSavedHistoryId` is reset to `null`. If the user then clicks "Undo Last Action/Round", the app cannot remove the game from the history list because the ID reference is lost.

3. **Traitor Night Actions Not Persisted:**
   - **Location:** `src/routes/traitor/play/+page.svelte`
   - **Issue:** The selections for the Mafia kill, Doctor protect, and Detective check are stored in local component `$state` rather than the persisted store. If the moderator accidentally refreshes the browser during the night phase, all current selections are lost and must be re-entered.

## 🏗️ Architectural Improvements

1. **Deep Persistence Reactivity:**
   - **Location:** `src/lib/state/persistence.svelte.ts`
   - **Opportunity:** The current implementation relies on manually re-assigning the entire state object to trigger the persistence setter (e.g., `this.state = { ...this.state, players: updated }`). Leveraging Svelte 5's `$effect` to deep-watch the state proxy would automatically persist any nested mutations, significantly cleaning up the store logic and preventing missed saves.

2. **Over-reliance on Native Alerts:**
   - **Location:** Project-wide
   - **Opportunity:** The app heavily uses `window.confirm` and `window.alert` (e.g., confirming new games, undoing actions, showing Traitor night results). These block the main thread and degrade the native "mobile-first" feel. They should be replaced with custom, styled Svelte modals or toast notifications.

3. **PWA Asset Robustness:**
   - **Location:** `vite.config.ts`
   - **Opportunity:** The PWA configuration currently only specifies an SVG icon (`favicon.svg`). While modern, older Android devices and certain iOS versions handle PNG maskable icons much better for reliable home screen installation. Including PNG fallbacks in the manifest is recommended.

## ✨ Game Logic & UX Polish

1. **Missing Kachuful "Hook" Rule:**
   - **Location:** `src/routes/kachuful/play/+page.svelte`
   - **Issue:** Standard Kachuful rules dictate that the dealer (the last person to bid) **cannot** bid a number that causes the total sum of all bids to exactly equal the total number of tricks available. This "hook" ensures the game is always over-bid or under-bid. This validation logic is currently missing.

2. **RaceChart Tie-Breaker UI:**
   - **Location:** `src/lib/components/RaceChart.svelte`
   - **Issue:** The Trophy icon and gold styling are awarded strictly to the first element in the sorted array (`i === 0`). If two or more players are tied for first place, only one arbitrarily receives the winner styling. The logic should check if a player's score equals the `maxScore`.

3. **Detective Privacy Leak:**
   - **Location:** `src/routes/traitor/play/+page.svelte`
   - **Issue:** In the Traitor dashboard, the Detective's investigation result ("Mafia 🔴" or "Innocent 🏘") is rendered directly on the screen. Since players are sitting around a table, a stray glance at the moderator's screen could spoil the game. The result should be obscured behind a "Hold to reveal" interaction.
