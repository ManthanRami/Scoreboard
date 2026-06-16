import type { GameBase } from '$lib/types/game';
import { generateUUID } from '$lib/utils/uuid';

export const HISTORY_KEY = 'game_history';

export type GameType = 'kachuful' | 'hearts' | 'traitor';
export type TraitorWinner = 'mafia' | 'town';

export interface CompletedGame extends Partial<GameBase> {
	id: string;
	gameType: GameType;
	completedAt: string;
	players: Array<{ name: string; totalScore?: number }>;
	winnerName?: string | null;
	winner?: TraitorWinner | null;
	rounds?: unknown[];
	currentRound?: number;
}

export type CompletedGameInput = Omit<CompletedGame, 'id' | 'completedAt'>;

export function loadGameHistory(): CompletedGame[] {
	if (typeof window === 'undefined') return [];

	try {
		const saved = localStorage.getItem(HISTORY_KEY);
		return saved ? JSON.parse(saved) : [];
	} catch (error) {
		console.error('Failed to load game history:', error);
		return [];
	}
}

export function saveCompletedGame(gameData: CompletedGameInput): CompletedGame {
	if (typeof window === 'undefined') {
		return {
			...gameData,
			id: generateUUID(),
			completedAt: new Date().toISOString()
		};
	}

	const history = loadGameHistory();
	const completedGame: CompletedGame = {
		...gameData,
		id: generateUUID(),
		completedAt: new Date().toISOString()
	};

	localStorage.setItem(HISTORY_KEY, JSON.stringify([completedGame, ...history].slice(0, 50)));
	return completedGame;
}

export function removeCompletedGameFromHistory(id: string): void {
	if (typeof window === 'undefined') return;

	const history = loadGameHistory().filter(game => game.id !== id);
	localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function clearGameHistory(): void {
	if (typeof window === 'undefined') return;
	localStorage.removeItem(HISTORY_KEY);
}

export function formatCompletedDate(dateStr: string): string {
	return new Date(dateStr).toLocaleDateString(undefined, {
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});
}
