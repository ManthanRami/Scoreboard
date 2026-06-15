<script lang="ts">
  import { kachuful } from '$lib/state/kachuful.svelte';
  import { goto } from '$app/navigation';
  import PlayerStepper from '$lib/components/PlayerStepper.svelte';
  import PlayerNameInput from '$lib/components/PlayerNameInput.svelte';
  import { ArrowRight, Trash2 } from '@lucide/svelte';

  let playerCount = $state(4);
  let deckCount = $state(1);
  let negativePenalty = $state(0);
  let playerNames = $state(['Rahul', 'Priya', 'Amit', 'Sara']);

  $effect(() => {
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
    kachuful.startGame(playerNames, deckCount, negativePenalty);
    goto('/kachuful/play');
  }

  const maxCards = $derived(Math.floor((52 * deckCount) / playerCount));
  const totalRounds = $derived(maxCards * 2 - 1);
</script>

<div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
  <div class="flex justify-between items-center">
    <h2 class="text-display-md">Kachuful</h2>
    {#if kachuful.state}
      <button 
        onclick={() => goto('/kachuful/play')}
        class="text-label-lg text-primary flex items-center gap-2"
      >
        Resume Game <ArrowRight size={16} />
      </button>
    {/if}
  </div>

  <section class="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <PlayerStepper bind:value={playerCount} min={2} max={10} label="Players" />
    <PlayerStepper bind:value={deckCount} min={1} max={3} label="Decks" />
    <PlayerStepper bind:value={negativePenalty} min={-20} max={0} step={5} label="Miss Penalty" />
  </section>

  <section class="space-y-4">
    <div class="flex justify-between items-center">
      <h3 class="text-title-lg">Players</h3>
    </div>
    <div class="space-y-3">
      {#each playerNames as name, i}
        <PlayerNameInput bind:name={playerNames[i]} index={i} />
      {/each}
    </div>
  </section>

  <section class="p-6 rounded-2xl bg-surface-variant border border-border">
    <h3 class="text-label-lg text-text-secondary mb-4">Game Summary</h3>
    <div class="grid grid-cols-2 gap-y-2 text-body-md">
      <span>Max cards/round:</span>
      <span class="text-right text-text-primary font-bold">{maxCards}</span>
      <span>Total rounds:</span>
      <span class="text-right text-text-primary font-bold">{totalRounds}</span>
      <span>Trump order:</span>
      <span class="text-right text-text-primary font-bold">♠ ♦ ♣ ♥</span>
    </div>
  </section>

  <button 
    onclick={start}
    class="w-full p-5 bg-primary hover:bg-primary-dark text-white rounded-2xl text-title-md font-bold transition-all active:scale-95 flex justify-center items-center gap-2"
  >
    Start New Game <ArrowRight size={20} />
  </button>
  
  {#if kachuful.state}
    <button 
      onclick={() => kachuful.reset()}
      class="w-full p-4 text-danger text-label-lg flex justify-center items-center gap-2 hover:bg-danger/10 rounded-2xl transition-colors"
    >
      <Trash2 size={18} /> Clear Current Game
    </button>
  {/if}
</div>
