import { beforeEach, describe, expect, it } from 'vitest';
import { hearts } from './hearts.svelte';

describe('hearts store', () => {
	beforeEach(() => {
		hearts.reset();
	});

	it('rejects point entries that do not add up to the round total', () => {
		hearts.startGame(['Asha', 'Ben', 'Cara'], 1, 100);

		expect(hearts.submitRound([10, 10, 0], null)).toBe(false);
		expect(hearts.state?.rounds).toHaveLength(0);
	});

	it('submits a normal round', () => {
		hearts.startGame(['Asha', 'Ben', 'Cara'], 1, 100);

		expect(hearts.submitRound([13, 13, 0], null)).toBe(true);

		expect(hearts.state?.rounds).toHaveLength(1);
		expect(hearts.state?.players.map(player => player.totalScore)).toEqual([13, 13, 0]);
	});

	it('applies moon shooter scoring', () => {
		hearts.startGame(['Asha', 'Ben', 'Cara'], 1, 100);

		expect(hearts.submitRound([0, 0, 0], 1)).toBe(true);

		expect(hearts.state?.players.map(player => player.totalScore)).toEqual([26, 0, 26]);
		expect(hearts.state?.rounds[0].moonShooterIndex).toBe(1);
	});

	it('undoes the last submitted round', () => {
		hearts.startGame(['Asha', 'Ben', 'Cara'], 1, 100);
		hearts.submitRound([13, 13, 0], null);

		expect(hearts.undoLastRound()).toBe(true);

		expect(hearts.state?.rounds).toHaveLength(0);
		expect(hearts.state?.players.map(player => player.totalScore)).toEqual([0, 0, 0]);
	});
});
