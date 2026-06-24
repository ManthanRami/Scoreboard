<script lang="ts">
  import { ArrowRight, ArrowLeft } from '@lucide/svelte';
  import { goto } from '$app/navigation';
</script>

<svelte:head>
  <title>Hearts Rules & Scoring Guide | Scoreboard Hub</title>
  <meta name="description" content="Learn how to play Hearts, understand penalty points, shooting the moon, deck scaling for multiplayer, and scoring rules." />
</svelte:head>

<div class="min-h-screen bg-background pb-24">
  <header class="p-6 pb-2 flex items-center gap-4 border-b border-border bg-surface/50 sticky top-0 backdrop-blur-md z-40">
    <button onclick={() => window.history.back()} class="text-text-secondary hover:text-hearts transition-colors" aria-label="Back">
      <ArrowLeft size={24} />
    </button>
    <h1 class="text-title-lg font-bold">Hearts Rules</h1>
  </header>

  <main class="max-w-2xl mx-auto px-6 py-8 space-y-12 animate-in fade-in duration-500">
    
    <!-- CTA Banner -->
    <div class="p-6 bg-hearts/10 border border-hearts/30 rounded-3xl text-center space-y-4 shadow-lg relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-hearts/10 to-transparent"></div>
      <div class="relative z-10">
        <h2 class="text-display-sm text-hearts">Tired of doing the math?</h2>
        <p class="text-body-lg text-text-primary">Track Hearts scores effortlessly, handle Moon Shots, and view live charts.</p>
        <button 
          onclick={() => goto('/hearts')}
          class="mt-4 px-8 py-4 bg-hearts text-white rounded-2xl font-bold text-label-lg active:scale-95 transition-all w-full flex items-center justify-center gap-2"
        >
          Start Scoreboard Free <ArrowRight size={20} />
        </button>
      </div>
    </div>

    <!-- Rule Content -->
    <article class="prose prose-invert prose-p:text-text-secondary prose-headings:text-text-primary">
      <h2 class="text-display-md">How to Play Hearts</h2>
      <p>Hearts is a trick-taking card game of evasion. Unlike most trick-taking games where you want to win as many tricks as possible, in Hearts you want to <strong>avoid</strong> winning tricks that contain penalty cards.</p>

      <h3>The Objective</h3>
      <p>The goal is to finish the game with the <strong>lowest score</strong>. The game ends as soon as any player reaches or exceeds the point limit (default 100 points). At that moment, the player with the fewest points wins.</p>

      <h3>Players and Deck Scaling</h3>
      <p>Hearts is traditionally played with 4 players and 1 deck, but Scoreboard Hub adapts dynamically to support up to 10 players by scaling the number of decks:</p>
      
      <div class="overflow-x-auto my-6">
        <table class="w-full border-collapse border border-border">
          <thead>
            <tr class="bg-surface-variant">
              <th class="border border-border p-3 text-left">Decks</th>
              <th class="border border-border p-3 text-left">Players</th>
              <th class="border border-border p-3 text-left">Max Round Points</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="border border-border p-3"><strong>1 Deck</strong> (52 cards)</td>
              <td class="border border-border p-3">3 to 6 players</td>
              <td class="border border-border p-3 text-hearts font-bold">26 pts</td>
            </tr>
            <tr class="bg-surface/50">
              <td class="border border-border p-3"><strong>2 Decks</strong> (104 cards)</td>
              <td class="border border-border p-3">5 to 8 players</td>
              <td class="border border-border p-3 text-hearts font-bold">52 pts</td>
            </tr>
            <tr>
              <td class="border border-border p-3"><strong>3 Decks</strong> (156 cards)</td>
              <td class="border border-border p-3">7 to 10 players</td>
              <td class="border border-border p-3 text-hearts font-bold">78 pts</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>Scoring Rules</h3>
      <ul>
        <li>Each ♥ card won in a trick adds <strong>+1 point</strong> to your round score.</li>
        <li>The Queen of Spades (Q♠) adds <strong>+13 points</strong> (per deck in play).</li>
        <li>All other cards carry no value.</li>
      </ul>

      <h3>"Shoot the Moon" (High Risk, High Reward)</h3>
      <p>If you manage to collect <strong>ALL</strong> the penalty cards in a single round (every single Heart and every Queen of Spades in play):</p>
      <ul>
        <li>You score <strong>0 points</strong> for that round.</li>
        <li>Every other player is penalized with the maximum round points (e.g. <strong>+26 points</strong> per deck in play).</li>
      </ul>
      <p><em>Scoreboard Hub tracks this with a one-tap button, applying the correct scores to all players instantly depending on your deck count.</em></p>

      <h3>Rules of Play</h3>
      <ol class="space-y-2">
        <li><strong>First Trick:</strong> The player holding the 2 of Clubs leads the first trick (or the lowest club in play if cards were dealt out unequally). If playing with multiple decks, the first duplicate 2 of Clubs played leads.</li>
        <li><strong>Following Suit:</strong> Players must play a card of the suit led if they have one. If they don't, they may discard any other card.</li>
        <li><strong>No Penalties on First Trick:</strong> You cannot play a Heart or the Q♠ on the very first trick, even if you cannot follow suit.</li>
        <li><strong>Breaking Hearts:</strong> Hearts cannot be led until a Heart or the Q♠ has been played as a discard (known as "breaking hearts").</li>
      </ol>
    </article>
  </main>
</div>
