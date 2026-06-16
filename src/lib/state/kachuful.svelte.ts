import { removeCompletedGameFromHistory } from '$lib/history';
import { createLocalStorageState, saveToHistory } from './persistence.svelte';
import { getCardsForRound } from '$lib/types/kachuful';
import type { KachufulGameState, KachufulPlayerRound } from '$lib/types/kachuful';

const INITIAL_STATE: KachufulGameState | null = null;

class KachufulStore {
	private persisted = createLocalStorageState<KachufulGameState | null>('kachuful_game', INITIAL_STATE);

	get state() { return this.persisted.value; }
	set state(v) { this.persisted.value = v; }

	get hasSubmittedRounds() {
		return this.state?.players.some(player => player.rounds.length > 0) ?? false;
	}

	startGame(playerNames: string[], deckCount: number, negativePenalty: number = 0) {
		const maxCards = Math.floor((52 * deckCount) / playerNames.length);
		this.state = {
			id: crypto.randomUUID(),
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			status: 'in_progress',
			players: playerNames.map(name => ({
				name,
				totalScore: 0,
				rounds: []
			})),
			currentRound: 1,
			deckCount,
			maxCards,
			totalRounds: maxCards * 2 - 1,
			winnerName: null,
			negativePenalty,
			lastSavedHistoryId: null
		};
	}

	submitRound(entries: { bid: number, tricks: number }[]): boolean {
		if (!this.state) return false;
		if (entries.length !== this.state.players.length) return false;
		if (!this.isRoundValid(entries)) return false;

		const penalty = this.state.negativePenalty;
		const updatedPlayers = this.state.players.map((player, i) => {
			const { bid, tricks } = entries[i];
			const score = bid === tricks ? 10 + bid : penalty;
			const round: KachufulPlayerRound = { bid, tricks, score };

			return {
				...player,
				rounds: [...player.rounds, round],
				totalScore: player.totalScore + score
			};
		});

		const isGameOver = this.state.currentRound >= this.state.totalRounds;
		let historyId = this.state.lastSavedHistoryId;

		if (isGameOver) {
			historyId = saveToHistory({ 
				...this.state, 
				players: updatedPlayers,
				status: 'completed',
				winnerName: [...updatedPlayers].sort((a, b) => b.totalScore - a.totalScore)[0].name,
				gameType: 'kachuful' 
			}).id;
		}

		this.state = {
			...this.state,
			players: updatedPlayers,
			currentRound: isGameOver ? this.state.currentRound : this.state.currentRound + 1,
			status: isGameOver ? 'completed' : 'in_progress',
			updatedAt: new Date().toISOString(),
			winnerName: isGameOver ? [...updatedPlayers].sort((a, b) => b.totalScore - a.totalScore)[0].name : null,
			lastSavedHistoryId: historyId
		};

		return true;
	}

	undoLastRound(): boolean {
		if (!this.state || !this.hasSubmittedRounds) return false;

		const players = this.state.players.map(player => {
			const rounds = player.rounds.slice(0, -1);
			const totalScore = rounds.reduce((sum, round) => sum + round.score, 0);

			return {
				...player,
				rounds,
				totalScore
			};
		});

		const historyId = this.state.lastSavedHistoryId;

		this.state = {
			...this.state,
			players,
			currentRound: Math.max(1, this.state.currentRound - 1),
			status: 'in_progress',
			updatedAt: new Date().toISOString(),
			winnerName: null,
			lastSavedHistoryId: null
		};

		if (historyId) {
			removeCompletedGameFromHistory(historyId);
		}

		return true;
	}

	reset() {
		this.state = null;
	}

	private isRoundValid(entries: { bid: number, tricks: number }[]): boolean {
		if (!this.state) return false;

		const totalBids = entries.reduce((sum, entry) => sum + entry.bid, 0);
		const totalTricks = entries.reduce((sum, entry) => sum + entry.tricks, 0);

		const currentCards = getCardsForRound(this.state.currentRound, this.state.maxCards);

		return totalTricks === currentCards && totalBids !== currentCards && entries.every(entry =>
			entry.bid >= 0 &&
			entry.tricks >= 0 &&
			entry.bid <= currentCards &&
			entry.tricks <= currentCards
		);
	}
}

export const kachuful = new KachufulStore();
