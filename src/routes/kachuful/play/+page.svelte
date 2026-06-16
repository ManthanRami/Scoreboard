<script lang="ts">
  import { kachuful } from '$lib/state/kachuful.svelte';
  import { getTrumpForRound, getCardsForRound, getDealerIndex } from '$lib/types/kachuful';
  import PlayerStepper from '$lib/components/PlayerStepper.svelte';
  import ScoreBadge from '$lib/components/ScoreBadge.svelte';
  import RaceChart from '$lib/components/RaceChart.svelte';
  import { Trophy, ArrowLeft, Plus, AlertCircle, Share2 } from '@lucide/svelte';
  import { goto } from '$app/navigation';
  import CelebrationOverlay from '$lib/components/CelebrationOverlay.svelte';
  import Modal from '$lib/components/Modal.svelte';
  import { useWakeLock } from '$lib/utils/wakeLock';
  import { shareElement } from '$lib/utils/share';

  useWakeLock();

  if (!kachuful.state) {
    if (typeof window !== 'undefined') goto('/kachuful');
  }

  let roundEntries = $state(kachuful.state?.players.map(() => ({ bid: 0, tricks: 0 })) || []);
  
  let showUndoModal = $state(false);
  let showNewGameModal = $state(false);
  let isSharing = $state(false);

  const currentTrump = $derived(kachuful.state ? getTrumpForRound(kachuful.state.currentRound) : null);
  const currentCards = $derived(kachuful.state ? getCardsForRound(kachuful.state.currentRound, kachuful.state.maxCards) : 0);
  const dealerIndex = $derived(kachuful.state ? getDealerIndex(kachuful.state.currentRound, kachuful.state.players.length) : -1);

  function addRound() {
    if (kachuful.submitRound(roundEntries)) {
      roundEntries = kachuful.state?.players.map(() => ({ bid: 0, tricks: 0 })) || [];
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  const totalBids = $derived(roundEntries.reduce((sum, entry) => sum + entry.bid, 0));
  const totalTricks = $derived(roundEntries.reduce((sum, entry) => sum + entry.tricks, 0));
  
  const isHookRuleViolated = $derived(totalBids === currentCards);
  const isRoundValid = $derived(
    totalTricks === currentCards && 
    !isHookRuleViolated &&
    roundEntries.every(e => e.bid <= currentCards && e.tricks <= currentCards)
  );

  function undoRound() {
    kachuful.undoLastRound();
    roundEntries = kachuful.state?.players.map(() => ({ bid: 0, tricks: 0 })) || [];
    showUndoModal = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetGame() {
    kachuful.reset();
    showNewGameModal = false;
    goto('/kachuful');
  }
</script>

{#if kachuful.state}
  <div class="space-y-6 pb-12 animate-in fade-in duration-500">
    <header class="flex justify-between items-center -mx-6 px-6 py-4 bg-surface/50 sticky top-0 backdrop-blur-md z-40 border-b border-border">
      <button onclick={() => goto('/kachuful')} class="text-text-secondary">
        <ArrowLeft size={24} />
      </button>
      <div class="text-center">
        <h2 class="text-title-md">Round {kachuful.state.currentRound} / {kachuful.state.totalRounds}</h2>
        <p class="text-label-sm text-text-secondary">Cards: {currentCards} • Trump: {currentTrump}</p>
      </div>
      <button onclick={() => showNewGameModal = true} class="text-primary text-label-sm font-bold">
        NEW
      </button>
    </header>

    {#if kachuful.state.status === 'completed'}
      <CelebrationOverlay />
      <section class="p-8 rounded-3xl bg-gold/10 border-2 border-gold text-center space-y-4 relative z-10">
        <Trophy size={48} class="text-gold mx-auto" />
        <h2 class="text-display-md">Winner!</h2>
        <p class="text-display-lg text-gold">{kachuful.state.winnerName}</p>
        <div class="flex flex-col gap-3 pt-4">
          <button
            onclick={async () => {
              isSharing = true;
              await shareElement('kachuful-standings', 'Kachuful Results', 'Check out the final scores!');
              isSharing = false;
            }}
            disabled={isSharing}
            class="w-full px-6 py-4 bg-primary text-white rounded-full font-bold flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            <Share2 size={20} />
            {isSharing ? 'Generating...' : 'Share Recap'}
          </button>
          <button
            onclick={() => showNewGameModal = true}
            class="w-full px-6 py-4 bg-surface-variant text-text-primary rounded-full font-bold hover:bg-background transition-colors border border-border"
          >
            New Game
          </button>
        </div>
      </section>
    {:else}
      <section class="space-y-6">
        <div class="flex justify-between items-end">
           <h3 class="text-title-lg">Enter Round {kachuful.state.currentRound}</h3>
           <div class="text-right">
             <p class="text-label-sm uppercase opacity-50">Total Bids</p>
             <p class="text-title-md font-mono {isHookRuleViolated ? 'text-danger' : 'text-success'}">{totalBids} / {currentCards}</p>
           </div>
        </div>
        
        <div class="space-y-8">
          {#each kachuful.state.players as player, i}
            <div 
              class="p-5 rounded-2xl bg-surface border transition-colors space-y-4"
              class:border-primary={i === dealerIndex}
              class:border-border={i !== dealerIndex}
            >
              <div class="flex justify-between items-center">
                <div class="flex items-center gap-2">
                   <span class="text-title-md font-bold">{player.name}</span>
                   {#if i === dealerIndex}
                     <span class="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full font-bold uppercase">Dealer</span>
                   {/if}
                </div>
                <span class="text-label-sm text-text-secondary">Total: {player.totalScore}</span>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <PlayerStepper bind:value={roundEntries[i].bid} min={0} max={currentCards} label="Bid" />
                <PlayerStepper bind:value={roundEntries[i].tricks} min={0} max={currentCards} label="Tricks" />
              </div>
              <div class="flex justify-end">
                {#if roundEntries[i].bid === roundEntries[i].tricks}
                  <ScoreBadge 
                    score="+{kachuful.state.scoringVariant === 'double-digit' ? (roundEntries[i].bid === 0 ? 10 : roundEntries[i].bid * 11) : (10 + roundEntries[i].bid)}" 
                    status="success" 
                  />
                {:else}
                  <ScoreBadge 
                    score={kachuful.state.scoringVariant === 'double-digit' ? (roundEntries[i].bid === 0 ? -5 : -(roundEntries[i].bid * 11)) : kachuful.state.negativePenalty} 
                    status="danger" 
                  />
                {/if}
              </div>
            </div>
          {/each}
        </div>

        <div class="space-y-3">
          {#if kachuful.hasSubmittedRounds}
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
            class="w-full p-5 bg-primary text-white rounded-2xl text-title-md font-bold transition-all active:scale-95 flex justify-center items-center gap-2 disabled:opacity-50"
          >
            <Plus size={24} /> Submit Round
          </button>
        </div>

        {#if isHookRuleViolated}
          <p class="text-center text-danger text-label-sm flex items-center justify-center gap-1 bg-danger/10 p-3 rounded-lg border border-danger/20">
            <AlertCircle size={14} /> <strong>Hook Rule:</strong> Total bids ({totalBids}) cannot equal tricks ({currentCards}). Dealer must change bid.
          </p>
        {:else if !isRoundValid && totalTricks !== currentCards}
          <p class="text-center text-warning text-label-sm flex items-center justify-center gap-1">
            Total tricks must equal {currentCards} for this round.
          </p>
        {/if}
      </section>
    {/if}

    <section id="kachuful-standings" class="space-y-4 mt-8 bg-background p-4 rounded-2xl">
      <h3 class="text-title-lg">Standings</h3>
      <RaceChart players={kachuful.state.players} sortMode="high-to-low" />
    </section>

    <section class="space-y-4 mt-8">
      <h3 class="text-title-lg">Score History</h3>
      <div class="overflow-x-auto -mx-6 px-6">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="text-label-sm text-text-secondary border-b border-border">
              <th class="py-3 pr-4 sticky left-0 bg-background z-10">Player</th>
              {#each Array(kachuful.state.players[0].rounds.length) as _, i}
                <th class="py-3 px-4 text-center">R{i + 1}</th>
              {/each}
              <th class="py-3 pl-4 text-right">Total</th>
            </tr>
          </thead>
          <tbody class="text-title-md">
            {#each kachuful.state.players as player}
              <tr class="border-b border-border/50">
                <td class="py-4 pr-4 font-bold sticky left-0 bg-background z-10">{player.name}</td>
                {#each player.rounds as round}
                  <td class="py-4 px-2 text-center">
                    <div class="flex flex-col items-center">
                      <span class={round.score > 0 ? 'text-success' : 'text-danger'}>
                        {round.score}
                      </span>
                      <span class="text-[10px] text-text-secondary opacity-50">{round.bid}/{round.tricks}</span>
                    </div>
                  </td>
                {/each}
                <td class="py-4 pl-4 text-right font-mono text-primary">{player.totalScore}</td>
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
