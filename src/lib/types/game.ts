export interface GameBase {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: 'in_progress' | 'completed';
}

export interface Player {
  name: string;
  totalScore: number;
}
