<script lang="ts">
  import GameCard from '$lib/components/GameCard.svelte';
  import ResumeDialog from '$lib/components/ResumeDialog.svelte';
  import { Spade, Heart, Drama } from '@lucide/svelte';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { Trophy, Calendar, User, ArrowRight } from '@lucide/svelte';
  import { loadGameHistory, formatCompletedDate, type CompletedGame } from '$lib/history';
  import { kachuful } from '$lib/state/kachuful.svelte';
  import { hearts } from '$lib/state/hearts.svelte';
  import { traitor } from '$lib/state/traitor.svelte';

  const games = [
    {
      id: 'kachuful',
      title: 'Kachuful',
      description: 'Up-and-down trick-taking card game with rotating trumps.',
      players: '2-10',
      path: '/kachuful',
      icon: Spade,
      colorClass: 'text-kachuful'
    },
    {
      id: 'hearts',
      title: 'Hearts',
      description: 'Avoid penalty cards and the Queen of Spades. Lowest score wins.',
      players: '3-10',
      path: '/hearts',
      icon: Heart,
      colorClass: 'text-hearts'
    },
    {
      id: 'traitor',
      title: 'Traitor',
      description: 'Social deduction game. Find the mafia before they eliminate the town.',
      players: '5-20',
      path: '/traitor',
      icon: Drama,
      colorClass: 'text-traitor'
    }
  ];

  let history = $state<CompletedGame[]>([]);
  
  // Dialog state
  let activeGameId = $state<string | null>(null);
  let dialogDetails = $state('');

  onMount(() => {
    history = loadGameHistory().slice(0, 3);
  });

  function handleGameClick(e: MouseEvent, gameId: string, defaultPath: string) {
    let details = '';
    
    if (gameId === 'kachuful' && kachuful.state && kachuful.state.status !== 'completed') {
      details = `${kachuful.state.players.length} players • Round ${kachuful.state.currentRound} of ${kachuful.state.totalRounds}`;
    } else if (gameId === 'hearts' && hearts.state && hearts.state.status !== 'completed') {
      details = `${hearts.state.players.length} players • Round ${hearts.state.rounds.length + 1}`;
    } else if (gameId === 'traitor' && traitor.state && traitor.state.status !== 'completed') {
      details = `${traitor.state.players.length} players • ${traitor.state.phase} Phase`;
    }

    if (details) {
      e.preventDefault();
      dialogDetails = details;
      activeGameId = gameId;
    }
  }

  function resumeGame() {
    if (activeGameId) {
      if (activeGameId === 'traitor' && !traitor.state?.roleRevealComplete) {
         goto(`/${activeGameId}/reveal`);
      } else {
         goto(`/${activeGameId}/play`);
      }
    }
    activeGameId = null;
  }

  function startNewGame() {
    if (activeGameId) {
      // The individual game setup routes (+page.svelte) handle clearing the old state 
      // when 'start' is called, but here we just navigate to setup.
      goto(`/${activeGameId}`);
    }
    activeGameId = null;
  }

  function roundCount(game: CompletedGame): number {
    if (game.gameType === 'traitor') return game.currentRound ?? 0;
    const firstPlayer = game.players[0];
    if (firstPlayer && 'rounds' in firstPlayer && Array.isArray(firstPlayer.rounds)) {
      return (firstPlayer.rounds as unknown[]).length;
    }
    return game.rounds?.length ?? 0;
  }

  function winnerLabel(game: CompletedGame): string {
    if (game.winnerName) return game.winnerName;
    if (game.winner === 'town') return 'Town Won';
    if (game.winner === 'mafia') return 'Mafia Won';
    return 'Completed';
  }

  const gameColors: Record<string, string> = {
    kachuful: 'text-kachuful',
    hearts: 'text-hearts',
    traitor: 'text-traitor'
  };
</script>

<div class="space-y-4">
  <div class="mb-8">
    <h2 class="text-title-lg text-text-secondary">Ready for game night?</h2>
  </div>

  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {#each games as game}
      <GameCard 
        {...game} 
        onclick={(e) => handleGameClick(e, game.id, game.path)}
      />
    {/each}
  </div>

  {#if activeGameId}
    <ResumeDialog 
      gameType={activeGameId}
      details={dialogDetails}
      onResume={resumeGame}
      onNewGame={startNewGame}
      onClose={() => activeGameId = null}
    />
  {/if}

  <section class="mt-12">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-title-lg">Recent Games</h2>
      {#if history.length > 0}
        <button onclick={() => goto('/history')} class="text-label-sm text-primary flex items-center gap-1">
          View all <ArrowRight size={14} />
        </button>
      {/if}
    </div>

    {#if history.length === 0}
      <div class="p-8 rounded-2xl bg-surface/50 border border-dashed border-border flex flex-col items-center justify-center text-center space-y-3">
        <Calendar size={44} class="text-text-secondary opacity-30" />
        <p class="text-body-md">No completed games yet.</p>
        <p class="text-body-md">Start a new game to see it here.</p>
      </div>
    {:else}
      <div class="space-y-4">
        {#each history as game}
          <button
            onclick={() => goto('/history')}
            class="w-full p-6 rounded-2xl bg-surface border border-border text-left hover:border-primary/50 transition-colors"
          >
            <div class="flex justify-between items-start gap-4">
              <div class="space-y-1">
                <h3 class="text-title-md capitalize {gameColors[game.gameType]}">{game.gameType}</h3>
                <p class="text-label-sm text-text-secondary flex items-center gap-1">
                  <Calendar size={12} /> {formatCompletedDate(game.completedAt)}
                </p>
              </div>
              <div class="bg-gold/10 text-gold px-3 py-1 rounded-full text-label-sm font-bold border border-gold/20 flex items-center gap-1">
                <Trophy size={14} /> {winnerLabel(game)}
              </div>
            </div>

            <div class="flex items-center gap-4 text-body-md text-text-secondary mt-4">
              <span class="flex items-center gap-1"><User size={14} /> {game.players.length} Players</span>
              <span>•</span>
              <span>{roundCount(game)} Rounds</span>
            </div>
          </button>
        {/each}
      </div>
    {/if}
  </section>
</div>
