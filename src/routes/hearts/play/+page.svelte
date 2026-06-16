<script lang="ts">
  import { hearts } from '$lib/state/hearts.svelte';
  import { getHeartsMaxPoints } from '$lib/types/hearts';
  import PlayerStepper from '$lib/components/PlayerStepper.svelte';
  import ScoreBadge from '$lib/components/ScoreBadge.svelte';
  import RaceChart from '$lib/components/RaceChart.svelte';
  import { Trophy, ArrowLeft, Plus, AlertCircle } from '@lucide/svelte';
  import { goto } from '$app/navigation';
  import CelebrationOverlay from '$lib/components/CelebrationOverlay.svelte';
  import Modal from '$lib/components/Modal.svelte';
  import { useWakeLock } from '$lib/utils/wakeLock';

  useWakeLock();

  if (!hearts.state) {
    if (typeof window !== 'undefined') goto('/hearts');
  }

  let roundScores = $state(hearts.state?.players.map(() => 0) || []);
  let moonShooterIndex = $state<number | null>(null);
  
  let showUndoModal = $state(false);
  let showNewGameModal = $state(false);

  const maxRoundPoints = $derived(hearts.state ? getHeartsMaxPoints(hearts.state.deckCount) : 26);
  const currentTotal = $derived(roundScores.reduce((a, b) => a + b, 0));

  function addRound() {
    if (hearts.submitRound(roundScores, moonShooterIndex)) {
      roundScores = hearts.state?.players.map(() => 0) || [];
      moonShooterIndex = null;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function undoRound() {
    hearts.undoLastRound();
    roundScores = hearts.state?.players.map(() => 0) || [];
    moonShooterIndex = null;
    showUndoModal = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetGame() {
    hearts.reset();
    showNewGameModal = false;
    goto('/hearts');
  }

  function toggleMoon(index: number) {
    moonShooterIndex = moonShooterIndex === index ? null : index;
  }

  function addPoints(index: number, points: number) {
    roundScores[index] = Math.min(maxRoundPoints, roundScores[index] + points);
  }

  const isRoundValid = $derived(moonShooterIndex !== null || currentTotal === maxRoundPoints);
</script>

{#if hearts.state}
  <div class="space-y-6 pb-12 animate-in fade-in duration-500">
    <header class="flex justify-between items-center -mx-6 px-6 py-4 bg-surface/50 sticky top-0 backdrop-blur-md z-40 border-b border-border">
      <button onclick={() => goto('/hearts')} class="text-text-secondary">
        <ArrowLeft size={24} />
      </button>
      <div class="text-center">
        <h2 class="text-title-md">Round {hearts.state.rounds.length + 1}</h2>
        <p class="text-label-sm text-text-secondary">Limit: {hearts.state.pointLimit} pts</p>
      </div>
      <button onclick={() => showNewGameModal = true} class="text-primary text-label-sm font-bold">
        NEW
      </button>
    </header>

    {#if hearts.state.status === 'completed'}
      <CelebrationOverlay />
      <section class="p-8 rounded-3xl bg-gold/10 border-2 border-gold text-center space-y-4 relative z-10">
        <Trophy size={48} class="text-gold mx-auto" />
        <h2 class="text-display-md">Winner!</h2>
        <p class="text-display-lg text-gold">{hearts.state.winnerName}</p>
        <button
          onclick={() => showNewGameModal = true}
          class="px-6 py-2 bg-gold text-background rounded-full font-bold"
        >
          New Game
        </button>
      </section>
    {:else}
      <section class="space-y-6">
        <div class="flex flex-col gap-4">
          <h3 class="text-title-lg">Who shot the moon?</h3>
          <div class="flex flex-wrap gap-2">
            {#each hearts.state.players as player, i}
              <button
                onclick={() => toggleMoon(i)}
                class="px-4 py-2 rounded-xl border text-label-sm font-bold transition-all"
                class:bg-hearts={moonShooterIndex === i}
                class:text-white={moonShooterIndex === i}
                class:border-hearts={moonShooterIndex === i}
                class:bg-surface={moonShooterIndex !== i}
                class:text-text-secondary={moonShooterIndex !== i}
                class:border-border={moonShooterIndex !== i}
              >
                {player.name}
              </button>
            {/each}
          </div>
        </div>

        {#if moonShooterIndex === null}
          <div class="space-y-4">
            <h3 class="text-title-lg flex justify-between">
              Enter Points
              <span class={currentTotal === maxRoundPoints ? 'text-success' : 'text-warning'}>
                {currentTotal} / {maxRoundPoints}
              </span>
            </h3>
            <div class="space-y-4">
              {#each hearts.state.players as player, i}
                <div class="p-5 rounded-2xl bg-surface border border-border flex items-center gap-6">
                  <div class="flex-1">
                    <span class="text-title-md font-bold">{player.name}</span>
                    <p class="text-label-sm text-text-secondary">Total: {player.totalScore}</p>
                  </div>
                  <div class="w-40">
                    <PlayerStepper bind:value={roundScores[i]} min={0} max={maxRoundPoints} />
                  </div>
                  <div class="grid grid-cols-2 gap-2">
                    {#each [1, 5, 10, 13] as points}
                      <button
                        onclick={() => addPoints(i, points)}
                        disabled={roundScores[i] >= maxRoundPoints}
                        class="rounded-lg border border-border bg-background px-3 py-2 text-label-sm font-bold text-text-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:border-primary/50 hover:text-primary"
                      >
                        +{points}
                      </button>
                    {/each}
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {:else}
          <div class="p-6 rounded-2xl bg-hearts/10 border border-hearts/30 flex items-start gap-4">
            <div class="p-2 bg-hearts text-white rounded-lg">
              <Trophy size={20} />
            </div>
            <div>
              <p class="text-title-md font-bold text-hearts">Moon Shot!</p>
              <p class="text-body-md">
                {hearts.state.players[moonShooterIndex].name} scores 0.
                Everyone else gets +{maxRoundPoints} pts.
              </p>
            </div>
          </div>
        {/if}

        <div class="space-y-3">
          {#if hearts.hasSubmittedRounds}
            <button
              onclick={() => showUndoModal = true}
              class="w-full p-4 bg-surface-variant hover:bg-surface border border-border rounded-2xl text-label-lg font-bold transition-colors"
            >
              Undo Last Round
            </button>
          {/if}

          <button
            onclick={addRound}
            disabled={!isRoundValid}
            class="w-full p-5 bg-hearts text-white rounded-2xl text-title-md font-bold transition-all active:scale-95 flex justify-center items-center gap-2 disabled:opacity-50"
          >
            <Plus size={24} /> Submit Round
          </button>
        </div>

        {#if !isRoundValid && moonShooterIndex === null}
          <p class="text-center text-warning text-label-sm flex items-center justify-center gap-1">
            <AlertCircle size={14} /> Points must add up to {maxRoundPoints}
          </p>
        {/if}
      </section>
    {/if}

    <section class="space-y-4 mt-8">
      <h3 class="text-title-lg">Standings (Lowest wins)</h3>
      <RaceChart players={hearts.state.players} sortMode="low-to-high" />
    </section>

    <section class="space-y-4 mt-8">
      <h3 class="text-title-lg">Score History</h3>
      <div class="overflow-x-auto -mx-6 px-6">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="text-label-sm text-text-secondary border-b border-border">
              <th class="py-3 pr-4 sticky left-0 bg-background z-10">Player</th>
              {#each hearts.state.rounds as round}
                <th class="py-3 px-4 text-center">R{round.roundNumber}</th>
              {/each}
              <th class="py-3 pl-4 text-right">Total</th>
            </tr>
          </thead>
          <tbody class="text-title-md">
            {#each hearts.state.players as player, i}
              <tr class="border-b border-border/50">
                <td class="py-4 pr-4 font-bold sticky left-0 bg-background z-10">{player.name}</td>
                {#each hearts.state.rounds as round}
                  <td class="py-4 px-4 text-center font-mono">
                    {#if round.moonShooterIndex === i}
                      <span class="text-hearts font-bold">🌙 0</span>
                    {:else}
                      {round.scores[i]}
                    {/if}
                  </td>
                {/each}
                <td class="py-4 pl-4 text-right font-mono text-hearts">{player.totalScore}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </section>
  </div>

  {#if showUndoModal}
    <Modal 
      title="Undo Last Round?"
      message="This will permanently remove the last round's scores."
      confirmLabel="Yes, Undo"
      type="danger"
      onConfirm={undoRound}
      onCancel={() => showUndoModal = false}
    />
  {/if}

  {#if showNewGameModal}
    <Modal 
      title="Start New Game?"
      message="Current game progress will be lost if you haven't finished."
      confirmLabel="Start New"
      onConfirm={resetGame}
      onCancel={() => showNewGameModal = false}
    />
  {/if}
{/if}
