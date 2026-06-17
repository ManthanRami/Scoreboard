<script lang="ts">
  import { ArrowRight, ArrowLeft } from '@lucide/svelte';
  import { goto } from '$app/navigation';
</script>

<svelte:head>
  <title>Kachuful Rules & Scoring Guide | Scoreboard Hub</title>
  <meta name="description" content="Learn the definitive rules for Kachuful (Judgement / Oh Hell), including the hook rule, trump order, and symmetric double-digit scoring variants." />
</svelte:head>

<div class="min-h-screen bg-background pb-24">
  <header class="p-6 pb-2 flex items-center gap-4 border-b border-border bg-surface/50 sticky top-0 backdrop-blur-md z-40">
    <button onclick={() => window.history.back()} class="text-text-secondary hover:text-primary transition-colors">
      <ArrowLeft size={24} />
    </button>
    <h1 class="text-title-lg font-bold">Kachuful Rules</h1>
  </header>

  <main class="max-w-2xl mx-auto px-6 py-8 space-y-12">
    
    <!-- CTA Banner -->
    <div class="p-6 bg-primary/10 border border-primary/30 rounded-3xl text-center space-y-4 shadow-lg relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"></div>
      <div class="relative z-10">
        <h2 class="text-display-sm text-primary">Tired of doing the math?</h2>
        <p class="text-body-lg text-text-primary">Track Kachuful scores automatically, validate bids, and avoid arguments.</p>
        <button 
          onclick={() => goto('/kachuful')}
          class="mt-4 px-8 py-4 bg-primary text-white rounded-2xl font-bold text-label-lg active:scale-95 transition-all w-full flex items-center justify-center gap-2"
        >
          Start Scoreboard Free <ArrowRight size={20} />
        </button>
      </div>
    </div>

    <!-- Rule Content -->
    <article class="prose prose-invert prose-p:text-text-secondary prose-headings:text-text-primary">
      <h2 class="text-display-md">How to Play Kachuful</h2>
      <p>Kachuful (also known as Judgement, Oh Hell, or Up the River) is an exact trick-taking card game where bidding perfectly is more important than having good cards.</p>

      <h3>Game Structure</h3>
      <ul>
        <li><strong>Players:</strong> Best with 3 to 7 players (can go up to 10 with multiple decks).</li>
        <li><strong>Rounds:</strong> The game starts with 1 card dealt to each player, increases by 1 card each round up to the maximum possible, and then decreases back down to 1 card.</li>
        <li><strong>Trump Order:</strong> Trumps rotate every round in a fixed order: ♠ Spades, ♦ Diamonds, ♣ Clubs, ♥ Hearts.</li>
      </ul>

      <h3>The "Hook" Rule (Crucial)</h3>
      <p>The total sum of bids made by all players in a round <strong>cannot equal</strong> the total number of tricks available. The dealer (who bids last) must adjust their bid so the sum is either over or under. This guarantees that at least one player will miss their bid every round.</p>

      <h3>Standard Scoring</h3>
      <ul>
        <li><strong>Make your bid:</strong> 10 points + your bid amount (e.g., bid 2, win 2 = 12 points).</li>
        <li><strong>Miss your bid:</strong> 0 points (or a set negative penalty, depending on your house rules).</li>
      </ul>

      <h3>"High Stakes" Variant (Double-Digit)</h3>
      <p>A popular, highly aggressive variant used by experienced groups:</p>
      <ul>
        <li><strong>Bid N > 0:</strong> Make it for +NN points (e.g. bid 2 = 22 pts). Miss it for -NN points.</li>
        <li><strong>Bid 0:</strong> Make it for +10 points. Miss it for -5 points.</li>
      </ul>
      
      <p><em>Scoreboard Hub supports both Standard and High Stakes variants automatically.</em></p>
    </article>
  </main>
</div>