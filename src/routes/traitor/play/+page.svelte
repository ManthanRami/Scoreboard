<script lang="ts">
  import { traitor } from '$lib/state/traitor.svelte';
  import { TraitorRole, type TraitorGameState } from '$lib/types/traitor';
  import { Trophy, ArrowLeft, Sun, Moon, Vote, UserMinus, Eye, EyeOff, ShieldCheck, Search } from '@lucide/svelte';
  import { goto } from '$app/navigation';
  import type { Component } from 'svelte';

  if (!traitor.state) {
    if (typeof window !== 'undefined') goto('/traitor');
  }

  let showRoles = $state(false);
  let mafiaTargetId = $state<string | null>(null);
  let doctorProtectId = $state<string | null>(null);
  let detectiveInvestigateId = $state<string | null>(null);

  const alivePlayers = $derived(traitor.state?.players.filter(p => p.isAlive) || []);
  const deadPlayers = $derived(traitor.state?.players.filter(p => !p.isAlive) || []);
  const aliveMafia = $derived(alivePlayers.filter(p => p.role === TraitorRole.Mafia).length);
  const aliveTown = $derived(alivePlayers.filter(p => p.role !== TraitorRole.Mafia).length);

  const phaseButtons = [
    ['day', Sun, 'Day'] as const,
    ['voting', Vote, 'Vote'] as const,
    ['night', Moon, 'Night'] as const
  ] satisfies Array<[TraitorGameState['phase'], Component, string]>;

  function handleNight() {
    const eliminatedId = traitor.executeNight(mafiaTargetId, doctorProtectId, detectiveInvestigateId);
    mafiaTargetId = null;
    doctorProtectId = null;
    detectiveInvestigateId = null;

    if (eliminatedId) {
      alert(`${traitor.state?.players.find(p => p.id === eliminatedId)?.name} was killed tonight!`);
    } else {
      alert('Nobody was killed tonight! The doctor might have saved someone.');
    }
  }

  function handleVote(id: string) {
    if (confirm(`Eliminate ${traitor.state?.players.find(p => p.id === id)?.name}?`)) {
      traitor.eliminatePlayer(id, 'vote');
    }
  }

  function undoLastAction() {
    if (confirm('Undo the last Traitor action?')) {
      traitor.undoLastAction();
    }
  }

  const detectiveResult = $derived(
    detectiveInvestigateId
      ? traitor.state?.players.find(p => p.id === detectiveInvestigateId)?.role === TraitorRole.Mafia
        ? 'Mafia 🔴'
        : 'Innocent 🏘'
      : null
  );
</script>

{#if traitor.state}
  <div class="space-y-6 pb-24 animate-in fade-in duration-500">
    <header class="flex justify-between items-center -mx-6 px-6 py-4 bg-surface/50 sticky top-0 backdrop-blur-md z-40 border-b border-border">
      <button onclick={() => goto('/traitor')} class="text-text-secondary">
        <ArrowLeft size={24} />
      </button>
      <div class="text-center">
        <h2 class="text-title-md">Round {traitor.state.currentRound}</h2>
        <div class="flex items-center gap-2 justify-center">
          <span class="text-danger text-label-sm font-bold">Mafia: {aliveMafia}</span>
          <span class="text-text-secondary opacity-50">•</span>
          <span class="text-success text-label-sm font-bold">Town: {aliveTown}</span>
        </div>
      </div>
      <button onclick={() => showRoles = !showRoles} class="text-primary">
        {#if showRoles} <EyeOff size={24} /> {:else} <Eye size={24} /> {/if}
      </button>
    </header>

    {#if traitor.state.status === 'completed'}
      <section class="p-8 rounded-3xl bg-surface border-2 border-primary text-center space-y-6">
        <Trophy size={64} class="mx-auto {traitor.state.winner === 'mafia' ? 'text-danger' : 'text-success'}" />
        <div>
          <h2 class="text-display-md uppercase tracking-widest">
            {traitor.state.winner === 'mafia' ? 'Mafia Wins!' : 'Town Wins!'}
          </h2>
          <p class="text-body-lg text-text-secondary mt-2">The game has ended.</p>
        </div>

        <div class="space-y-3">
          {#each traitor.state.players as player}
            <div class="flex justify-between items-center p-3 bg-background rounded-xl">
              <span>{player.name}</span>
              <span class="text-label-sm font-bold {player.role === TraitorRole.Mafia ? 'text-danger' : 'text-success'}">
                {player.role}
              </span>
            </div>
          {/each}
        </div>

        <button
          onclick={() => traitor.reset()}
          class="w-full p-4 bg-primary text-white rounded-xl font-bold"
        >
          New Game
        </button>
      </section>
    {:else}
      <!-- Phase Selection -->
      <section class="grid grid-cols-3 gap-2 p-1 bg-surface-variant rounded-2xl border border-border">
        {#each phaseButtons as [phase, Icon, label]}
          <button
            onclick={() => traitor.setPhase(phase)}
            class="flex flex-col items-center gap-1 py-3 rounded-xl transition-all"
            class:bg-background={traitor.state.phase === phase}
            class:text-primary={traitor.state.phase === phase}
            class:shadow-lg={traitor.state.phase === phase}
            class:text-text-secondary={traitor.state.phase !== phase}
          >
            <Icon size={20} />
            <span class="text-[10px] font-bold uppercase">{label}</span>
          </button>
        {/each}
      </section>

      {#if traitor.canUndo}
        <button
          onclick={undoLastAction}
          class="w-full p-4 bg-surface-variant hover:bg-surface border border-border rounded-2xl text-label-lg font-bold transition-colors"
        >
          Undo Last Action
        </button>
      {/if}

      {#if traitor.state.phase === 'night'}
        <section class="p-6 rounded-2xl bg-surface border border-primary/30 space-y-6 animate-in slide-in-from-top-4">
          <h3 class="text-title-lg flex items-center gap-2 text-primary">
            <Moon size={24} /> Night Actions
          </h3>

          <div class="space-y-4">
            <div class="space-y-2">
              <label class="text-label-sm text-danger flex items-center gap-1"><UserMinus size={14}/> Mafia Kills</label>
              <select bind:value={mafiaTargetId} class="w-full bg-background border-border rounded-xl p-3 text-body-md focus:ring-primary">
                <option value={null}>Select Target</option>
                {#each alivePlayers as p}
                  <option value={p.id}>{p.name}</option>
                {/each}
              </select>
            </div>

            <div class="space-y-2">
              <label class="text-label-sm text-success flex items-center gap-1"><ShieldCheck size={14}/> Doctor Protects</label>
              <select bind:value={doctorProtectId} class="w-full bg-background border-border rounded-xl p-3 text-body-md focus:ring-primary">
                <option value={null}>Select Target</option>
                {#each alivePlayers as p}
                  <option value={p.id}>{p.name}</option>
                {/each}
              </select>
            </div>

            <div class="space-y-2">
              <label class="text-label-sm text-primary flex items-center gap-1"><Search size={14}/> Detective Checks</label>
              <select bind:value={detectiveInvestigateId} class="w-full bg-background border-border rounded-xl p-3 text-body-md focus:ring-primary">
                <option value={null}>Select Target</option>
                {#each alivePlayers as p}
                  <option value={p.id}>{p.name}</option>
                {/each}
              </select>
              {#if detectiveResult}
                <p class="text-title-md font-bold text-center mt-2 p-2 bg-primary/10 rounded-lg">Result: {detectiveResult}</p>
              {/if}
            </div>
          </div>

          <button
            onclick={handleNight}
            class="w-full p-4 bg-primary text-white rounded-xl font-bold active:scale-95 transition-transform"
          >
            Execute Night & End Phase
          </button>
        </section>
      {/if}

      <section class="space-y-4">
        <div class="flex justify-between items-center">
          <h3 class="text-title-lg">Players</h3>
          <span class="text-label-sm text-text-secondary">{alivePlayers.length} Alive</span>
        </div>

        <div class="grid grid-cols-2 gap-3">
          {#each traitor.state.players as player}
            <div
              class="p-4 rounded-2xl border transition-all relative overflow-hidden"
              class:bg-surface={player.isAlive}
              class:border-border={player.isAlive}
              class:opacity-50={!player.isAlive}
              class:bg-surface-variant={!player.isAlive}
            >
              <div class="flex justify-between items-start mb-2">
                <span class="text-title-md font-bold">{player.name}</span>
                {#if !player.isAlive}
                  <span class="text-[10px] uppercase font-bold text-danger bg-danger/10 px-2 py-0.5 rounded">Dead</span>
                {/if}
              </div>

              {#if showRoles || !player.isAlive}
                <p class="text-label-sm font-bold {player.role === TraitorRole.Mafia ? 'text-danger' : 'text-success'}">
                  {player.role}
                </p>
              {/if}

              {#if traitor.state.phase === 'voting' && player.isAlive}
                <button
                  onclick={() => handleVote(player.id)}
                  class="mt-4 w-full py-2 bg-danger/10 text-danger text-label-sm font-bold rounded-lg border border-danger/20"
                >
                  Eliminate
                </button>
              {/if}
            </div>
          {/each}
        </div>
      </section>
    {/if}
  </div>
{/if}
