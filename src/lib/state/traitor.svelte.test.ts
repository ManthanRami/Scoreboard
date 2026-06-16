import { beforeEach, describe, expect, it } from 'vitest';
import { traitor } from './traitor.svelte';
import { TraitorRole } from '$lib/types/traitor';

describe('traitor store', () => {
	beforeEach(() => {
		traitor.reset();
	});

	it('undoes a night kill', () => {
		traitor.startGame(['Mafia', 'Civilian'], {
			[TraitorRole.Mafia]: 1,
			[TraitorRole.Detective]: 0,
			[TraitorRole.Doctor]: 0,
			[TraitorRole.Civilian]: 1
		});

		const civilian = traitor.state?.players.find(player => player.role === TraitorRole.Civilian);
		expect(civilian).toBeDefined();

		traitor.updateNightActions({ mafiaTargetId: civilian!.id });
		traitor.executeNight();
		expect(traitor.state?.status).toBe('completed');
		expect(traitor.state?.winner).toBe('mafia');

		expect(traitor.undoLastAction()).toBe(true);

		expect(traitor.state?.status).toBe('in_progress');
		expect(traitor.state?.players.find(player => player.id === civilian!.id)?.isAlive).toBe(true);
		expect(traitor.canUndo).toBe(false);
	});

	it('undoes a vote elimination', () => {
		traitor.startGame(['Asha', 'Ben', 'Cara', 'Dev', 'Eva'], {
			[TraitorRole.Mafia]: 1,
			[TraitorRole.Detective]: 1,
			[TraitorRole.Doctor]: 1,
			[TraitorRole.Civilian]: 2
		});

		const target = traitor.state?.players[0];
		expect(target).toBeDefined();

		traitor.eliminatePlayer(target!.id, 'vote');

		expect(traitor.undoLastAction()).toBe(true);
		expect(traitor.state?.players.find(player => player.id === target!.id)?.isAlive).toBe(true);
	});
});
