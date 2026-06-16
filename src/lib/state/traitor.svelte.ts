import { removeCompletedGameFromHistory } from '$lib/history';
import { createLocalStorageState, saveToHistory } from './persistence.svelte';
import { type TraitorGameState, TraitorRole } from '$lib/types/traitor';

const INITIAL_STATE: TraitorGameState | null = null;

class TraitorStore {
	private persisted = createLocalStorageState<TraitorGameState | null>('traitor_game', INITIAL_STATE);
	private persistedUndoStack = createLocalStorageState<TraitorGameState[]>('traitor_undo_stack', []);

	get state() { return this.persisted.value; }
	set state(v) { this.persisted.value = v; }

	get undoStack() { return this.persistedUndoStack.value; }
	set undoStack(v) { this.persistedUndoStack.value = v; }

	get canUndo() {
		return this.undoStack.length > 0;
	}

	startGame(playerNames: string[], roleCounts: Record<TraitorRole, number>) {
		this.undoStack = [];

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
			roleRevealComplete: false,
			lastSavedHistoryId: null
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

	updateNightActions(actions: Partial<TraitorGameState['nightActions']>) {
		if (!this.state) return;
		this.state = {
			...this.state,
			nightActions: { ...this.state.nightActions, ...actions }
		};
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

	executeNight(): string | null {
		if (!this.state) return null;

		this.pushUndoSnapshot();

		const { mafiaTargetId, doctorProtectId } = this.state.nightActions;
		let eliminatedId: string | null = null;
		
		let updatedPlayers = [...this.state.players];

		if (mafiaTargetId && mafiaTargetId !== doctorProtectId) {
			const target = this.state.players.find(player => player.id === mafiaTargetId && player.isAlive);
			if (target) {
				eliminatedId = target.id;
				updatedPlayers = this.state.players.map(p =>
					p.id === eliminatedId
						? { ...p, isAlive: false, eliminatedBy: 'kill' as const, eliminatedRound: this.state!.currentRound, isProtected: false }
						: p
				);
			}
		}

		this.state = {
			...this.state,
			players: updatedPlayers,
			currentRound: this.state.currentRound + 1,
			phase: 'day',
			nightActions: { mafiaTargetId: null, doctorProtectId: null, detectiveInvestigateId: null }
		};

		this.checkWinner();
		return eliminatedId;
	}

	undoLastAction(): boolean {
		if (this.undoStack.length === 0) return false;

		const previousState = this.undoStack[this.undoStack.length - 1];
		this.undoStack = this.undoStack.slice(0, -1);
		
		if (!previousState) return false;

		const historyId = this.state?.lastSavedHistoryId;
		this.state = this.cloneState(previousState);

		if (historyId) {
			removeCompletedGameFromHistory(historyId);
		}

		return true;
	}

	reset() {
		this.undoStack = [];
		this.state = null;
	}

	private pushUndoSnapshot() {
		if (!this.state) return;
		this.undoStack = [...this.undoStack, this.cloneState(this.state)];
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
			const savedGame = saveToHistory({ ...this.state, winner, status, gameType: 'traitor' });
			this.state = { ...this.state, winner, status, lastSavedHistoryId: savedGame.id };
		}
	}
}

export const traitor = new TraitorStore();
