import type { GameBase, Player } from './game';

export interface HeartsRound {
  roundNumber: number;
  scores: number[]; // Scores for each player in this round
  moonShooterIndex: number | null;
}

export interface HeartsGameState extends GameBase {
  players: Player[];
  deckCount: number;
  pointLimit: number;
  rounds: HeartsRound[];
  winnerName: string | null;
}

export function getHeartsMaxPoints(deckCount: number): number {
  return 26 * deckCount;
}

export function getHeartsMaxPlayers(deckCount: number): number {
  if (deckCount === 1) return 6;
  if (deckCount === 2) return 8;
  return 10;
}
