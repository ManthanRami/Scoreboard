<script lang="ts">
  import { traitor } from '$lib/state/traitor.svelte';
  import { TraitorRole } from '$lib/types/traitor';
  import { goto } from '$app/navigation';
  import { Eye, EyeOff, CheckCircle2 } from '@lucide/svelte';
  import { onMount } from 'svelte';

  if (!traitor.state) {
    if (typeof window !== 'undefined') goto('/traitor');
  }

  let isHolding = $state(false);
  let wakeLock: any = null;

  onMount(() => {
    async function requestWakeLock() {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await (navigator as any).wakeLock.request('screen');
        }
      } catch (err) {
        const message = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
        console.error(message);
      }
    }
    requestWakeLock();
    return () => wakeLock?.release();
  });

  const currentPlayer = $derived(traitor.state?.players[traitor.state.roleRevealIndex]);

  function next() {
    isHolding = false;
    traitor.nextReveal();
    if (traitor.state?.roleRevealComplete) {
      goto('/traitor/play');
    }
  }

  const roleColors = {
    [TraitorRole.Mafia]: 'text-danger',
    [TraitorRole.Detective]: 'text-primary',
    [TraitorRole.Doctor]: 'text-success',
    [TraitorRole.Civilian]: 'text-text-secondary'
  };

  function handleHold(start: boolean) {
    if (start && !isHolding) {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(50);
      }
    }
    isHolding = start;
  }
</script>

{#if traitor.state && currentPlayer}
  <div class="h-[calc(100vh-12rem)] flex flex-col justify-center items-center space-y-12 animate-in fade-in duration-500">
    <div class="text-center space-y-2">
      <p class="text-label-lg text-text-secondary">Pass the phone to:</p>
      <h2 class="text-display-lg uppercase tracking-widest">{currentPlayer.name}</h2>
    </div>

    <div 
      class="relative w-full max-w-sm aspect-[3/4] rounded-[2rem] border-4 border-dashed border-border flex flex-col items-center justify-center p-8 transition-all duration-300"
      class:border-primary={isHolding}
      class:bg-surface={!isHolding}
      class:bg-surface-variant={isHolding}
      role="button"
      tabindex="0"
      aria-label="Hold to reveal role"
      onpointerdown={() => handleHold(true)}
      onpointerup={() => handleHold(false)}
      onpointerleave={() => handleHold(false)}
      onkeydown={(e) => { if (e.key === ' ' || e.key === 'Enter') handleHold(true) }}
      onkeyup={(e) => { if (e.key === ' ' || e.key === 'Enter') handleHold(false) }}
    >
      {#if !isHolding}
        <div class="text-center space-y-4">
          <div class="w-20 h-20 bg-background rounded-full flex items-center justify-center mx-auto">
            <EyeOff size={40} class="text-text-secondary" />
          </div>
          <p class="text-title-md font-bold">Press and hold to reveal role</p>
          <p class="text-body-md text-text-secondary">Keep private from others!</p>
        </div>
      {:else}
        <div class="text-center space-y-6 animate-in zoom-in duration-300">
          <div class="w-24 h-24 bg-background rounded-full flex items-center justify-center mx-auto border-2 border-primary">
            <Eye size={48} class="text-primary" />
          </div>
          <div class="space-y-2">
            <p class="text-label-lg uppercase tracking-widest opacity-70">Your Role is</p>
            <h3 class="text-display-md {roleColors[currentPlayer.role]}">{currentPlayer.role}</h3>
          </div>
          <p class="text-body-lg px-4 italic">
            {#if currentPlayer.role === TraitorRole.Mafia}
              Eliminate the town at night and stay hidden during the day.
            {:else if currentPlayer.role === TraitorRole.Detective}
              Investigate one player each night to see if they are Mafia.
            {:else if currentPlayer.role === TraitorRole.Doctor}
              Protect one player each night from elimination.
            {:else}
              Use your voice to find the Mafia and vote them out.
            {/if}
          </p>
        </div>
      {/if}
    </div>

    <button 
      onclick={next}
      class="w-full max-w-xs p-5 bg-surface-variant hover:bg-surface border border-border rounded-2xl text-title-md font-bold transition-all active:scale-95 flex justify-center items-center gap-2"
    >
      <CheckCircle2 size={24} /> Done — Pass Device
    </button>

    <div class="flex gap-2">
      {#each traitor.state.players as _, i}
        <div 
          class="w-2 h-2 rounded-full transition-colors"
          class:bg-primary={i === traitor.state.roleRevealIndex}
          class:bg-border={i !== traitor.state.roleRevealIndex}
        ></div>
      {/each}
    </div>
  </div>
{/if}

<style>
  /* Prevent context menu on long press */
  div {
    -webkit-touch-callout: none;
    user-select: none;
  }
</style>
