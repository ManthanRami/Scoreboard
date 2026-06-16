import { browser } from '$app/environment';
import { saveCompletedGame, type CompletedGameInput } from '$lib/history';

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

	$effect.root(() => {
		$effect(() => {
			if (browser) {
				localStorage.setItem(key, JSON.stringify(state));
			}
		});
	});

	return {
		get value() { return state; },
		set value(v) {
			state = v;
		}
	};
}

export function saveToHistory(gameData: CompletedGameInput) {
	return saveCompletedGame(gameData);
}
