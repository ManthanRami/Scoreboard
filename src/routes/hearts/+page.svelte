<script lang="ts">
  import { hearts } from '$lib/state/hearts.svelte';
  import { getHeartsMaxPlayers } from '$lib/types/hearts';
  import { goto } from '$app/navigation';
  import PlayerStepper from '$lib/components/PlayerStepper.svelte';
  import PlayerNameInput from '$lib/components/PlayerNameInput.svelte';
  import { ArrowRight, Trash2, Info } from '@lucide/svelte';

  let playerCount = $state(4);
  let deckCount = $state(1);
  let pointLimit = $state(100);
  let playerNames = $state(['Rahul', 'Priya', 'Amit', 'Sara']);

  $effect(() => {
    const maxPlayers = getHeartsMaxPlayers(deckCount);
    if (playerCount > maxPlayers) playerCount = maxPlayers;

    if (playerNames.length < playerCount) {
      const diff = playerCount - playerNames.length;
      for (let i = 0; i < diff; i++) {
        playerNames.push(`Player ${playerNames.length + 1}`);
      }
    } else if (playerNames.length > playerCount) {
      playerNames = playerNames.slice(0, playerCount);
    }
  });

  function start() {
    hearts.startGame(playerNames, deckCount, pointLimit);
    goto('/hearts/play');
  }

  const maxPlayersForDecks = $derived(getHeartsMaxPlayers(deckCount));
</script>

<div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
  <div class="flex justify-between items-center">
    <h2 class="text-display-md">Hearts ♥</h2>
    {#if hearts.state}
      <button 
        onclick={() => goto('/hearts/play')}
        class="text-label-lg text-primary flex items-center gap-2"
      >
        Resume Game <ArrowRight size={16} />
      </button>
    {/if}
  </div>

  <section class="grid grid-cols-2 gap-4">
    <PlayerStepper bind:value={deckCount} min={1} max={3} label="Decks" />
    <PlayerStepper bind:value={playerCount} min={3} max={maxPlayersForDecks} label="Players" />
  </section>

  <section>
    <PlayerStepper bind:value={pointLimit} min={50} max={300} step={25} label="Point Limit" />
    <p class="text-body-md mt-2 text-center italic">Game ends when someone hits {pointLimit} pts</p>
  </section>

  <section class="space-y-4">
    <h3 class="text-title-lg">Players</h3>
    <div class="space-y-3">
      {#each playerNames as name, i}
        <PlayerNameInput bind:name={playerNames[i]} index={i} />
      {/each}
    </div>
  </section>

  <section class="p-6 rounded-2xl bg-surface-variant border border-border space-y-3">
    <div class="flex items-center gap-2 text-hearts">
      <Info size={18} />
      <h3 class="text-label-lg font-bold">Quick Rules</h3>
    </div>
    <ul class="text-body-md space-y-1 opacity-80 list-disc list-inside">
      <li>Lowest score wins.</li>
      <li>Each ♥ = 1 pt.</li>
      <li>Q♠ = 13 pts per deck.</li>
      <li>Shoot the moon to give everyone else max points!</li>
    </ul>
  </section>

  <button 
    onclick={start}
    class="w-full p-5 bg-hearts hover:opacity-90 text-white rounded-2xl text-title-md font-bold transition-all active:scale-95 flex justify-center items-center gap-2"
  >
    Start New Game <ArrowRight size={20} />
  </button>
  
  {#if hearts.state}
    <button 
      onclick={() => hearts.reset()}
      class="w-full p-4 text-danger text-label-lg flex justify-center items-center gap-2 hover:bg-danger/10 rounded-2xl transition-colors"
    >
      <Trash2 size={18} /> Clear Current Game
    </button>
  {/if}
</div>
