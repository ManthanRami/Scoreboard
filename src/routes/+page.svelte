<script lang="ts">
  import GameCard from '$lib/components/GameCard.svelte';
  import { Spade, Heart, Drama } from '@lucide/svelte';

  const games = [
    {
      title: 'Kachuful',
      description: 'Up-and-down trick-taking card game with rotating trumps.',
      players: '2-10',
      path: '/kachuful',
      icon: Spade,
      colorClass: 'text-kachuful'
    },
    {
      title: 'Hearts',
      description: 'Avoid penalty cards and the Queen of Spades. Lowest score wins.',
      players: '3-10',
      path: '/hearts',
      icon: Heart,
      colorClass: 'text-hearts'
    },
    {
      title: 'Traitor',
      description: 'Social deduction game. Find the mafia before they eliminate the town.',
      players: '5-20',
      path: '/traitor',
      icon: Drama,
      colorClass: 'text-traitor'
    }
  ];
</script>

<div class="space-y-4">
  <div class="mb-8">
    <h2 class="text-display-md">Ready for game night?</h2>
  </div>

  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {#each games as game}
      <GameCard {...game} />
    {/each}
  </div>

  <section class="mt-12">
    <h2 class="text-title-lg">Recent Games</h2>
    <div class="p-8 rounded-2xl bg-surface/50 border border-dashed border-border flex flex-col items-center justify-center text-center">
      <p class="text-body-md">No recent games yet.</p>
      <p class="text-body-md">Start a new game to see it here.</p>
    </div>
  </section>
</div>
