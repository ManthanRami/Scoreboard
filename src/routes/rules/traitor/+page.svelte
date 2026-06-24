<script lang="ts">
  import { ArrowRight, ArrowLeft } from '@lucide/svelte';
  import { goto } from '$app/navigation';
</script>

<svelte:head>
  <title>Traitor Rules & Moderator Guide | Scoreboard Hub</title>
  <meta name="description" content="Learn how to moderate Traitor (Mafia/Werewolf), understand player roles, night/day phases, and win conditions." />
</svelte:head>

<div class="min-h-screen bg-background pb-24">
  <header class="p-6 pb-2 flex items-center gap-4 border-b border-border bg-surface/50 sticky top-0 backdrop-blur-md z-40">
    <button onclick={() => window.history.back()} class="text-text-secondary hover:text-traitor transition-colors" aria-label="Back">
      <ArrowLeft size={24} />
    </button>
    <h1 class="text-title-lg font-bold">Traitor Rules</h1>
  </header>

  <main class="max-w-2xl mx-auto px-6 py-8 space-y-12 animate-in fade-in duration-500">
    
    <!-- CTA Banner -->
    <div class="p-6 bg-traitor/10 border border-traitor/30 rounded-3xl text-center space-y-4 shadow-lg relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-traitor/10 to-transparent"></div>
      <div class="relative z-10">
        <h2 class="text-display-sm text-traitor">Ready to Moderate?</h2>
        <p class="text-body-lg text-text-primary">Run the game night seamlessly, automate night actions, and track active roles.</p>
        <button 
          onclick={() => goto('/traitor')}
          class="mt-4 px-8 py-4 bg-traitor text-white rounded-2xl font-bold text-label-lg active:scale-95 transition-all w-full flex items-center justify-center gap-2"
        >
          Start Scoreboard Free <ArrowRight size={20} />
        </button>
      </div>
    </div>

    <!-- Rule Content -->
    <article class="prose prose-invert prose-p:text-text-secondary prose-headings:text-text-primary">
      <h2 class="text-display-md">How to Play Traitor (Mafia)</h2>
      <p>Traitor (based on classic Mafia/Werewolf) is a social deduction game of informed minority vs. uninformed majority. One player acts as the Moderator using the phone, while everyone else plays in the room.</p>

      <h3>The Roles</h3>
      <p>Scoreboard Hub supports four primary roles:</p>
      <ul>
        <li><strong>Mafia 🔴 (The Traitors):</strong> The bad guys. They know who each other are and vote secretly each night to eliminate a member of the town.</li>
        <li><strong>Detective 🔵 (Town):</strong> An investigator who can check one player's alignment (Mafia or Town) each night.</li>
        <li><strong>Doctor 🟢 (Town):</strong> A protector who can choose one player (including themselves) to protect each night. If that player is targeted by the Mafia, they survive.</li>
        <li><strong>Civilian ⚪ (Town):</strong> The majority. They have no special night abilities and must rely on discussion, deduction, and day voting to root out the Mafia.</li>
      </ul>

      <h3>Recommended Distribution</h3>
      <p>Generally, you want about 1 Mafia player for every 3 to 4 players. Here are recommended setups:</p>
      <ul>
        <li><strong>5-7 Players:</strong> 1 Mafia, 1 Detective, 1 Doctor, 2-4 Civilians</li>
        <li><strong>8-11 Players:</strong> 2 Mafia, 1 Detective, 1 Doctor, 4-7 Civilians</li>
        <li><strong>12-15 Players:</strong> 3 Mafia, 1 Detective, 1 Doctor, 7-10 Civilians</li>
      </ul>

      <h3>Game Loop</h3>
      <p>The game alternate between <strong>Night</strong> and <strong>Day</strong> phases until a win condition is reached.</p>

      <h4>1. Role Reveal (Setup)</h4>
      <p>The Moderator configures the game and passes the phone. Each player holds down the screen to securely reveal their assigned role with subtle tactile feedback, then passes it to the next player. Once everyone knows their role, the game begins.</p>

      <h4>2. Night Phase (Eyes Closed)</h4>
      <p>Everyone closes their eyes. The Moderator calls each role in sequence (or manages the actions on the dashboard privately):</p>
      <ol>
        <li><strong>Mafia:</strong> Choose a player to eliminate.</li>
        <li><strong>Doctor:</strong> Choose a player to protect from elimination.</li>
        <li><strong>Detective:</strong> Choose a player to investigate. The Moderator shows the alignment results.</li>
      </ol>

      <h4>3. Day Phase (Discussion & Voting)</h4>
      <p>Everyone opens their eyes. The Moderator announces if anyone was eliminated during the night (if the Doctor protected the target, "nobody died").</p>
      <p>The group then discusses suspects. Any player can make a formal accusation. A vote is held, and if a majority agrees, that suspect is eliminated and their role is revealed.</p>

      <h3>Winning Conditions</h3>
      <ul>
        <li><strong>Town Wins:</strong> When all Mafia players have been successfully eliminated.</li>
        <li><strong>Mafia Wins:</strong> When the number of Mafia players equals or outnumbers the surviving Town players (Civilians + Detective + Doctor). At this point, the Mafia can force-vote all decisions.</li>
      </ul>
    </article>
  </main>
</div>
