# Work log — Scoreboard improvements

## Goal
Implement recommended MVP hardening steps:
1. Fix `npm run check`
2. Fix `RaceChart` for Hearts
3. Wire home page recent games to history
4. Add confirm-before-new-game
5. Add Kachuful round validation
6. Add undo last round/action
7. Add tests for game logic
8. Defer Firebase/cloud sync until local-first MVP is stable

## Version control
- Initialized Git repository.
- Created clean initial commit: `ac15b82 Initial project snapshot`.
- Current working tree contains the improvement changes as uncommitted work.

## Verification
- `npm run check` — passed with 0 errors and 0 warnings.
- `npm run test` — passed: 3 test files, 9 tests.
- `npm run build` — passed; static build written to `build/`.

## Current changes to commit
- `package.json` / `package-lock.json`: add Vitest, Node types, `npm run test`
- `vite.config.ts`: add Vitest config
- `src/app.d.ts` / `src/virtual-pwa-modules.d.ts`: PWA virtual module declarations
- `src/lib/history.ts`: shared local history helpers
- `src/lib/state/persistence.svelte.ts`: typed persistence wrapper
- `src/lib/state/kachuful.svelte.ts`: validation + undo
- `src/lib/state/hearts.svelte.ts`: validation + undo
- `src/lib/state/traitor.svelte.ts`: undo stack + history cleanup
- `src/lib/components/RaceChart.svelte`: sort mode support
- `src/routes/+page.svelte`: show recent games
- `src/routes/history/+page.svelte`: use shared history helpers
- Setup pages: confirm before starting new game
- Play pages: undo buttons and Kachuful validation message
- Tests: Kachuful, Hearts, Traitor store tests
- `work.md`: this log

## Notes
- Firebase/cloud sync intentionally deferred.
- Next step: review `git status --short`, then commit these changes as one commit.
