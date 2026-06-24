import { beforeEach, describe, expect, it } from 'vitest';
import { kachuful } from './kachuful.svelte';

describe('kachuful store', () => {
	beforeEach(() => {
		kachuful.reset();
	});

	it('rejects a round where total tricks do not match cards in play', () => {
		kachuful.startGame(['Asha', 'Ben'], 1, 0);

		expect(kachuful.submitRound([
			{ bid: 1, tricks: 1 },
			{ bid: 1, tricks: 2 }
		])).toBe(false);

		expect(kachuful.state?.currentRound).toBe(1);
		expect(kachuful.state?.players[0].rounds).toHaveLength(0);
	});

	it('submits a valid round and advances to the next round', () => {
		kachuful.startGame(['Asha', 'Ben'], 1, -5);

		expect(kachuful.submitRound([
			{ bid: 1, tricks: 1 },
			{ bid: 1, tricks: 0 }
		])).toBe(true);

		expect(kachuful.state?.currentRound).toBe(2);
		expect(kachuful.state?.players[0].totalScore).toBe(11);
		expect(kachuful.state?.players[1].totalScore).toBe(-5);
	});

	it('undoes the last submitted round', () => {
		kachuful.startGame(['Asha', 'Ben'], 1, 0);
		kachuful.submitRound([
			{ bid: 1, tricks: 1 },
			{ bid: 1, tricks: 0 }
		]);

		expect(kachuful.undoLastRound()).toBe(true);

		expect(kachuful.state?.currentRound).toBe(1);
		expect(kachuful.state?.players[0].totalScore).toBe(0);
		expect(kachuful.state?.players[0].rounds).toHaveLength(0);
	});

	it('scores double-digit (High Stakes) variant correctly including zero bids', () => {
		kachuful.startGame(['Asha', 'Ben'], 1, 0, 'double-digit');

		expect(kachuful.submitRound([
			{ bid: 0, tricks: 0 }, // Asha makes bid of 0 -> +5 points
			{ bid: 0, tricks: 1 }  // Ben misses bid of 0 -> -5 points
		])).toBe(true);

		expect(kachuful.state?.players[0].totalScore).toBe(5);
		expect(kachuful.state?.players[1].totalScore).toBe(-5);

		// Start another game with bids > 0
		kachuful.reset();
		kachuful.startGame(['Asha', 'Ben'], 2, 0, 'double-digit');
		
		expect(kachuful.submitRound([
			{ bid: 1, tricks: 1 }, // Asha makes bid of 1 -> +11 points
			{ bid: 1, tricks: 0 }  // Ben misses bid of 1 -> -11 points
		])).toBe(true);

		expect(kachuful.state?.players[0].totalScore).toBe(11);
		expect(kachuful.state?.players[1].totalScore).toBe(-11);
	});
});
