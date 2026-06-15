import { createLocalStorageState, saveToHistory } from './persistence.svelte';
import type { KachufulGameState, KachufulPlayerRound } from '$lib/types/kachuful';

const INITIAL_STATE: KachufulGameState | null = null;

class KachufulStore {
  private persisted = createLocalStorageState<KachufulGameState | null>('kachuful_game', INITIAL_STATE);

  get state() { return this.persisted.value; }
  set state(v) { this.persisted.value = v; }

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
      negativePenalty
    };
  }

  submitRound(entries: { bid: number, tricks: number }[]) {
    if (!this.state) return;

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
    
    // Create new state object and re-assign to trigger persistence setter
    this.state = {
      ...this.state,
      players: updatedPlayers,
      currentRound: isGameOver ? this.state.currentRound : this.state.currentRound + 1,
      status: isGameOver ? 'completed' : 'in_progress',
      updatedAt: new Date().toISOString(),
      winnerName: isGameOver ? [...updatedPlayers].sort((a, b) => b.totalScore - a.totalScore)[0].name : null
    };

    if (isGameOver) {
      saveToHistory({ ...this.state, gameType: 'kachuful' });
    }
  }

  reset() {
    this.state = null;
  }
}

export const kachuful = new KachufulStore();
