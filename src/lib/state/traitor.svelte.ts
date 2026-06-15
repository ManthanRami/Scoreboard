import { removeCompletedGameFromHistory } from '$lib/history';
import { createLocalStorageState, saveToHistory } from './persistence.svelte';
import { type TraitorGameState, TraitorRole } from '$lib/types/traitor';

const INITIAL_STATE: TraitorGameState | null = null;

class TraitorStore {
	private persisted = createLocalStorageState<TraitorGameState | null>('traitor_game', INITIAL_STATE);
	private undoStack: TraitorGameState[] = [];
	private lastSavedHistoryId: string | null = null;

	get state() { return this.persisted.value; }
	set state(v) { this.persisted.value = v; }

	get canUndo() {
		return this.undoStack.length > 0;
	}

	startGame(playerNames: string[], roleCounts: Record<TraitorRole, number>) {
		this.undoStack = [];
		this.lastSavedHistoryId = null;

		const roles: TraitorRole[] = [];
		Object.entries(roleCounts).forEach(([role, count]) => {
			for (let i = 0; i < count; i++) roles.push(role as TraitorRole);
		});

		for (let i = roles.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[roles[i], roles[j]] = [roles[j], roles[i]];
		}

		this.state = {
			id: crypto.randomUUID(),
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			status: 'in_progress',
			players: playerNames.map((name, i) => ({
				id: crypto.randomUUID(),
				name,
				role: roles[i],
				isAlive: true,
				isProtected: false,
				eliminatedBy: null,
				eliminatedRound: null
			})),
			currentRound: 1,
			phase: 'day',
			winner: null,
			nightActions: {
				mafiaTargetId: null,
				doctorProtectId: null,
				detectiveInvestigateId: null
			},
			roleRevealIndex: 0,
			roleRevealComplete: false
		};
	}

	nextReveal() {
		if (!this.state) return;
		const nextIndex = this.state.roleRevealIndex < this.state.players.length - 1
			? this.state.roleRevealIndex + 1
			: this.state.roleRevealIndex;
		const complete = this.state.roleRevealIndex >= this.state.players.length - 1;

		this.state = {
			...this.state,
			roleRevealIndex: nextIndex,
			roleRevealComplete: complete
		};
	}

	setPhase(phase: 'day' | 'voting' | 'night') {
		if (!this.state) return false;
		this.state = { ...this.state, phase };
		return true;
	}

	eliminatePlayer(id: string, method: 'vote' | 'kill'): boolean {
		if (!this.state) return false;
		const player = this.state.players.find(player => player.id === id);
		if (!player?.isAlive) return false;

		this.pushUndoSnapshot();
		const updatedPlayers = this.state.players.map(p =>
			p.id === id
				? { ...p, isAlive: false, eliminatedBy: method, eliminatedRound: this.state!.currentRound }
				: p
		);
		this.state = { ...this.state, players: updatedPlayers };
		this.checkWinner();
		return true;
	}

	executeNight(mafiaTargetId: string | null, doctorProtectId: string | null, detectiveInvestigateId: string | null): string | null {
		if (!this.state) return null;

		this.pushUndoSnapshot();

		let eliminatedId: string | null = null;
		if (mafiaTargetId && mafiaTargetId !== doctorProtectId) {
			const target = this.state.players.find(player => player.id === mafiaTargetId && player.isAlive);
			if (target) {
				eliminatedId = target.id;
				const updatedPlayers = this.state.players.map(p =>
					p.id === eliminatedId
						? { ...p, isAlive: false, eliminatedBy: 'kill' as const, eliminatedRound: this.state!.currentRound, isProtected: false }
						: p
				);
				this.state = { ...this.state, players: updatedPlayers };
			}
		}

		this.state = {
			...this.state,
			currentRound: this.state.currentRound + 1,
			phase: 'day',
			nightActions: { mafiaTargetId: null, doctorProtectId: null, detectiveInvestigateId: null }
		};

		this.checkWinner();
		return eliminatedId;
	}

	undoLastAction(): boolean {
		if (this.undoStack.length === 0) return false;

		const previousState = this.undoStack.pop();
		if (!previousState) return false;

		this.state = this.cloneState(previousState);

		if (this.state.status !== 'completed' && this.lastSavedHistoryId) {
			removeCompletedGameFromHistory(this.lastSavedHistoryId);
			this.lastSavedHistoryId = null;
		}

		return true;
	}

	reset() {
		this.undoStack = [];
		this.lastSavedHistoryId = null;
		this.state = null;
	}

	private pushUndoSnapshot() {
		if (!this.state) return;
		this.undoStack.push(this.cloneState(this.state));
	}

	private cloneState(state: TraitorGameState): TraitorGameState {
		return JSON.parse(JSON.stringify(state)) as TraitorGameState;
	}

	private checkWinner() {
		if (!this.state) return;
		const aliveMafiaCount = this.state.players.filter(p => p.isAlive && p.role === TraitorRole.Mafia).length;
		const aliveTownCount = this.state.players.filter(p => p.isAlive && p.role !== TraitorRole.Mafia).length;

		let winner: 'mafia' | 'town' | null = null;
		let status: 'in_progress' | 'completed' = 'in_progress';

		if (aliveMafiaCount === 0) {
			winner = 'town';
			status = 'completed';
		} else if (aliveMafiaCount >= aliveTownCount) {
			winner = 'mafia';
			status = 'completed';
		}

		if (status === 'completed') {
			this.lastSavedHistoryId = saveToHistory({ ...this.state, winner, status, gameType: 'traitor' }).id;
			this.state = { ...this.state, winner, status };
		}
	}
}

export const traitor = new TraitorStore();
