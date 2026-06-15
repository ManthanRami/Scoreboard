import type { GameBase } from './game';

export enum TraitorRole {
  Mafia = 'Mafia',
  Detective = 'Detective',
  Doctor = 'Doctor',
  Civilian = 'Civilian',
}

export type GamePhase = 'day' | 'voting' | 'night';

export interface TraitorPlayer {
  id: string;
  name: string;
  role: TraitorRole;
  isAlive: boolean;
  isProtected: boolean;
  eliminatedBy: 'vote' | 'kill' | null;
  eliminatedRound: number | null;
}

export interface NightActions {
  mafiaTargetId: string | null;
  doctorProtectId: string | null;
  detectiveInvestigateId: string | null;
}

export interface TraitorGameState extends GameBase {
  players: TraitorPlayer[];
  currentRound: number;
  phase: GamePhase;
  winner: 'mafia' | 'town' | null;
  nightActions: NightActions;
  roleRevealIndex: number;
  roleRevealComplete: boolean;
}
