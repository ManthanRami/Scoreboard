import { createLocalStorageState, saveToHistory } from './persistence.svelte';
import type { HeartsGameState, HeartsRound } from '$lib/types/hearts';
import { getHeartsMaxPoints } from '$lib/types/hearts';

const INITIAL_STATE: HeartsGameState | null = null;

class HeartsStore {
  private persisted = createLocalStorageState<HeartsGameState | null>('hearts_game', INITIAL_STATE);

  get state() { return this.persisted.value; }
  set state(v) { this.persisted.value = v; }

  startGame(playerNames: string[], deckCount: number, pointLimit: number) {
    this.state = {
      id: crypto.randomUUID(),
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
      winnerName: null
    };
  }

  submitRound(scores: number[], moonShooterIndex: number | null) {
    if (!this.state) return;

    let roundScores = [...scores];
    if (moonShooterIndex !== null) {
      const penalty = getHeartsMaxPoints(this.state.deckCount);
      roundScores = this.state.players.map((_, i) => i === moonShooterIndex ? 0 : penalty);
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

    // Re-assign to trigger persistence setter
    this.state = {
      ...this.state,
      players: updatedPlayers,
      rounds: [...this.state.rounds, round],
      status: isGameOver ? 'completed' : 'in_progress',
      updatedAt: new Date().toISOString(),
      winnerName: isGameOver ? [...updatedPlayers].sort((a, b) => a.totalScore - b.totalScore)[0].name : null
    };

    if (isGameOver) {
      saveToHistory({ ...this.state, gameType: 'hearts' });
    }
  }

  reset() {
    this.state = null;
  }
}

export const hearts = new HeartsStore();
