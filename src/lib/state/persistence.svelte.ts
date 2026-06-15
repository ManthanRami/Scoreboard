import { browser } from '$app/environment';

export function createLocalStorageState<T>(key: string, initialValue: T) {
  let state = $state<T>(initialValue);

  if (browser) {
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        state = JSON.parse(saved);
      } catch (e) {
        console.error(`Failed to parse local storage for key "${key}":`, e);
      }
    }
  }

  return {
    get value() { return state; },
    set value(v) { 
      state = v; 
      if (browser) {
        localStorage.setItem(key, JSON.stringify(v));
      }
    }
  };
}

export function saveToHistory(gameData: any) {
  if (!browser) return;
  const history = JSON.parse(localStorage.getItem('game_history') || '[]');
  history.unshift({
    ...gameData,
    id: crypto.randomUUID(),
    completedAt: new Date().toISOString()
  });
  localStorage.setItem('game_history', JSON.stringify(history.slice(0, 50))); // Keep last 50
}
