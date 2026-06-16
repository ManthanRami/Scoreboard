export interface GameBase {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: 'in_progress' | 'completed';
  lastSavedHistoryId?: string | null;
}

export interface Player {
  name: string;
  totalScore: number;
}
