<script lang="ts">
  import { traitor } from '$lib/state/traitor.svelte';
  import { TraitorRole } from '$lib/types/traitor';
  import { goto } from '$app/navigation';
  import PlayerStepper from '$lib/components/PlayerStepper.svelte';
  import PlayerNameInput from '$lib/components/PlayerNameInput.svelte';
  import Modal from '$lib/components/Modal.svelte';
  import { ArrowRight, Trash2, ShieldAlert, Info } from '@lucide/svelte';

  let playerCount = $state(8);
  let mafiaCount = $state(2);
  let detectiveCount = $state(1);
  let doctorCount = $state(1);
  let playerNames = $state(['Rahul', 'Priya', 'Amit', 'Sara', 'Deepak', 'Anjali', 'Vikram', 'Sonia']);
  let showOverwriteModal = $state(false);
  let showResetModal = $state(false);

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

  const civilianCount = $derived(playerCount - mafiaCount - detectiveCount - doctorCount);
  const isValid = $derived(civilianCount >= 1 && mafiaCount < (playerCount - mafiaCount));

  function start() {
    if (traitor.state) {
      showOverwriteModal = true;
      return;
    }

    startGame();
  }

  function startGame() {
    traitor.startGame(playerNames, {
      [TraitorRole.Mafia]: mafiaCount,
      [TraitorRole.Detective]: detectiveCount,
      [TraitorRole.Doctor]: doctorCount,
      [TraitorRole.Civilian]: civilianCount
    });
    goto('/traitor/reveal');
  }

  function resetGame() {
    traitor.reset();
    showResetModal = false;
  }

  function requestReset() {
    if (traitor.state) {
      showResetModal = true;
    }
  }
</script>

<div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
  <div class="flex justify-between items-center">
    <h2 class="text-display-md">Traitor</h2>
    {#if traitor.state}
      <button 
        onclick={() => goto('/traitor/play')}
        class="text-label-lg text-primary flex items-center gap-2"
      >
        Resume Game <ArrowRight size={16} />
      </button>
    {/if}
  </div>

  <section class="space-y-6">
    <PlayerStepper bind:value={playerCount} min={5} max={20} label="Total Players" />
    
    <div class="grid grid-cols-1 gap-4 p-6 rounded-2xl bg-surface-variant border border-border">
      <h3 class="text-label-lg text-text-secondary uppercase">Role Distribution</h3>
      <PlayerStepper bind:value={mafiaCount} min={1} max={Math.floor(playerCount/2)} label="Mafia 🔴" />
      <PlayerStepper bind:value={detectiveCount} min={0} max={2} label="Detective 🔵" />
      <PlayerStepper bind:value={doctorCount} min={0} max={2} label="Doctor 🟢" />
      
      <div class="flex justify-between items-center pt-2 border-t border-border mt-2">
        <span class="text-label-sm text-text-secondary">Civilians ⚪</span>
        <span class="text-title-md font-bold">{civilianCount}</span>
      </div>
    </div>

    {#if !isValid}
      <p class="text-danger text-label-sm flex items-center gap-1 bg-danger/10 p-3 rounded-lg">
        <ShieldAlert size={14} /> At least 1 civilian required & Mafia must be minority.
      </p>
    {/if}
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
    <div class="flex items-center gap-2 text-traitor">
      <Info size={18} />
      <h3 class="text-label-lg font-bold">Quick Rules</h3>
    </div>
    <ul class="text-body-md space-y-1 opacity-80 list-disc list-inside">
      <li>Moderator-run pass-and-play role reveal.</li>
      <li>Night Phase: Mafia kills, Detective investigates, Doctor protects.</li>
      <li>Day Phase: Discuss and vote to eliminate suspects.</li>
      <li>Mafia wins if they outnumber Town. Town wins if all Mafia die.</li>
    </ul>
    <a href="/rules/traitor" class="text-label-sm text-traitor hover:underline flex items-center gap-1 mt-2">
      Read complete moderator guide <ArrowRight size={12} />
    </a>
  </section>

  <button 
    onclick={start}
    disabled={!isValid}
    class="w-full p-5 bg-traitor hover:opacity-90 text-white rounded-2xl text-title-md font-bold transition-all active:scale-95 flex justify-center items-center gap-2 disabled:opacity-50"
  >
    Shuffle & Reveal Roles <ArrowRight size={20} />
  </button>
  
  {#if showOverwriteModal}
    <Modal
      title="Start New Traitor Game?"
      message="Your current Traitor game will be discarded."
      confirmLabel="Start New"
      type="danger"
      onConfirm={() => {
        showOverwriteModal = false;
        startGame();
      }}
      onCancel={() => showOverwriteModal = false}
    />
  {/if}

  {#if showResetModal}
    <Modal
      title="Clear Current Traitor Game?"
      message="This will permanently remove the current game."
      confirmLabel="Clear Game"
      type="danger"
      onConfirm={resetGame}
      onCancel={() => showResetModal = false}
    />
  {/if}
</div>
