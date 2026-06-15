<script lang="ts">
  import { onMount } from 'svelte';
  import { Trophy, Calendar, User, ArrowRight, Trash2 } from '@lucide/svelte';
  import { goto } from '$app/navigation';

  let history = $state<any[]>([]);

  onMount(() => {
    const saved = localStorage.getItem('game_history');
    if (saved) {
      history = JSON.parse(saved);
    }
  });

  function clearHistory() {
    if (confirm('Clear all game history?')) {
      localStorage.removeItem('game_history');
      history = [];
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  const gameColors: Record<string, string> = {
    kachuful: 'text-kachuful',
    hearts: 'text-hearts',
    traitor: 'text-traitor'
  };
</script>

<div class="space-y-8 animate-in fade-in duration-500">
  <div class="flex justify-between items-center">
    <h2 class="text-display-md">History</h2>
    {#if history.length > 0}
      <button onclick={clearHistory} class="text-danger p-2 hover:bg-danger/10 rounded-lg transition-colors">
        <Trash2 size={20} />
      </button>
    {/if}
  </div>

  {#if history.length === 0}
    <div class="p-12 rounded-3xl bg-surface/50 border border-dashed border-border flex flex-col items-center justify-center text-center space-y-4">
      <Calendar size={48} class="text-text-secondary opacity-30" />
      <p class="text-body-lg text-text-secondary">No completed games yet.</p>
      <button 
        onclick={() => goto('/')}
        class="text-primary font-bold"
      >
        Start your first game
      </button>
    </div>
  {:else}
    <div class="space-y-4">
      {#each history as game}
        <div class="p-6 rounded-2xl bg-surface border border-border space-y-4 relative overflow-hidden group">
          <div class="flex justify-between items-start">
            <div class="space-y-1">
              <h3 class="text-title-lg capitalize {gameColors[game.gameType]}">{game.gameType}</h3>
              <p class="text-label-sm text-text-secondary flex items-center gap-1">
                <Calendar size={12} /> {formatDate(game.completedAt)}
              </p>
            </div>
            {#if game.winnerName || game.winner}
              <div class="flex items-center gap-2 bg-gold/10 text-gold px-3 py-1 rounded-full text-label-sm font-bold border border-gold/20">
                <Trophy size={14} /> 
                {game.winnerName || (game.winner === 'town' ? 'Town Won' : 'Mafia Won')}
              </div>
            {/if}
          </div>

          <div class="flex items-center gap-4 text-body-md text-text-secondary">
            <span class="flex items-center gap-1"><User size={14} /> {game.players.length} Players</span>
            <span>•</span>
            <span>{game.gameType === 'traitor' ? `${game.currentRound} Rounds` : `${game.rounds?.length || game.players[0].rounds?.length || 0} Rounds`}</span>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
