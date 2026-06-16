import type { GameBase, Player } from './game';

export enum TrumpSuit {
  Spades = '♠',
  Diamonds = '♦',
  Clubs = '♣',
  Hearts = '♥',
}

export interface KachufulPlayerRound {
  bid: number;
  tricks: number;
  score: number;
}

export interface KachufulPlayer extends Player {
  rounds: KachufulPlayerRound[];
}

export interface KachufulGameState extends GameBase {
  players: KachufulPlayer[];
  currentRound: number;
  deckCount: number;
  maxCards: number;
  totalRounds: number;
  winnerName: string | null;
  negativePenalty: number; // Default 0, can be set to -5, -10 etc.
}

export const TRUMP_ORDER = [
  TrumpSuit.Spades,
  TrumpSuit.Diamonds,
  TrumpSuit.Clubs,
  TrumpSuit.Hearts,
];

export function getTrumpForRound(round: number): TrumpSuit {
  return TRUMP_ORDER[(round - 1) % 4];
}

export function getCardsForRound(round: number, maxCards: number): number {
  if (round <= maxCards) return round;
  return maxCards * 2 - round;
}

export function getDealerIndex(round: number, playerCount: number): number {
  return (round - 1) % playerCount;
}
