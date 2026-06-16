import { removeCompletedGameFromHistory } from '$lib/history';
import { createLocalStorageState, saveToHistory } from './persistence.svelte';
import type { HeartsGameState, HeartsRound } from '$lib/types/hearts';
import { getHeartsMaxPoints } from '$lib/types/hearts';
import { generateUUID } from '$lib/utils/uuid';

const INITIAL_STATE: HeartsGameState | null = null;

class HeartsStore {
	private persisted = createLocalStorageState<HeartsGameState | null>('hearts_game', INITIAL_STATE);

	get state() { return this.persisted.value; }
	set state(v) { this.persisted.value = v; }

	get hasSubmittedRounds() {
		const state = this.state;
		return state !== null && state.rounds.length > 0;
	}

	startGame(playerNames: string[], deckCount: number, pointLimit: number) {
		this.state = {
			id: generateUUID(),
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			status: 'in_progress',
			players: playerNames.map(name => ({
				name,
				totalScore: 0
			})),
			deckCount,
			pointLimit,
			rounds: [],
			winnerName: null,
			lastSavedHistoryId: null
		};
	}

	submitRound(scores: number[], moonShooterIndex: number | null): boolean {
		if (!this.state) return false;
		if (scores.length !== this.state.players.length) return false;

		let roundScores = [...scores];
		if (moonShooterIndex !== null) {
			if (moonShooterIndex < 0 || moonShooterIndex >= this.state.players.length) return false;
			const penalty = getHeartsMaxPoints(this.state.deckCount);
			roundScores = this.state.players.map((_, i) => i === moonShooterIndex ? 0 : penalty);
		} else {
			const maxRoundPoints = getHeartsMaxPoints(this.state.deckCount);
			const total = roundScores.reduce((sum, score) => sum + score, 0);
			if (total !== maxRoundPoints || roundScores.some(score => score < 0)) return false;
		}

		const updatedPlayers = this.state.players.map((player, i) => ({
			...player,
			totalScore: player.totalScore + roundScores[i]
		}));

		const isGameOver = updatedPlayers.some(p => p.totalScore >= (this.state?.pointLimit ?? 100));
		const round: HeartsRound = {
			roundNumber: this.state.rounds.length + 1,
			scores: roundScores,
			moonShooterIndex
		};

		let historyId = this.state.lastSavedHistoryId;
		if (isGameOver) {
			historyId = saveToHistory({ 
				...this.state, 
				players: updatedPlayers,
				rounds: [...this.state.rounds, round],
				status: 'completed',
				winnerName: [...updatedPlayers].sort((a, b) => a.totalScore - b.totalScore)[0].name,
				gameType: 'hearts' 
			}).id;
		}

		this.state = {
			...this.state,
			players: updatedPlayers,
			rounds: [...this.state.rounds, round],
			status: isGameOver ? 'completed' : 'in_progress',
			updatedAt: new Date().toISOString(),
			winnerName: isGameOver ? [...updatedPlayers].sort((a, b) => a.totalScore - b.totalScore)[0].name : null,
			lastSavedHistoryId: historyId
		};

		return true;
	}

	undoLastRound(): boolean {
		if (!this.state || !this.hasSubmittedRounds) return false;

		const rounds = this.state.rounds.slice(0, -1);
		const players = this.state.players.map((player, playerIndex) => {
			const totalScore = rounds.reduce((sum, round) => sum + round.scores[playerIndex], 0);
			return {
				...player,
				totalScore
			};
		});

		const pointLimit = this.state?.pointLimit ?? 100;
		const isGameOver = players.some(player => player.totalScore >= pointLimit);
		const historyId = this.state.lastSavedHistoryId;

		this.state = {
			...this.state,
			players,
			rounds,
			status: isGameOver ? 'completed' : 'in_progress',
			updatedAt: new Date().toISOString(),
			winnerName: isGameOver ? [...players].sort((a, b) => a.totalScore - b.totalScore)[0].name : null,
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
}

export const hearts = new HeartsStore();
