<script lang="ts">
  import { Trophy } from '@lucide/svelte';

  let { 
    players 
  } = $props<{
    players: { name: string; totalScore: number }[];
  }>();

  const sortedPlayers = $derived([...players].sort((a, b) => b.totalScore - a.totalScore));
  const maxScore = $derived(Math.max(...players.map(p => p.totalScore), 1));
</script>

<div class="space-y-3">
  {#each sortedPlayers as player, i}
    <div class="space-y-1">
      <div class="flex justify-between text-label-sm px-1">
        <span class="flex items-center gap-1">
          {#if i === 0 && player.totalScore > 0}
            <Trophy size={14} class="text-gold" />
          {/if}
          {player.name}
        </span>
        <span class="font-mono">{player.totalScore}</span>
      </div>
      <div class="h-3 w-full bg-surface-variant rounded-full overflow-hidden border border-border/50">
        <div 
          class="h-full rounded-full transition-all duration-700 ease-out"
          class:bg-gold={i === 0 && player.totalScore > 0}
          class:bg-primary={i !== 0 || player.totalScore === 0}
          style:width="{(player.totalScore / maxScore) * 100}%"
        ></div>
      </div>
    </div>
  {/each}
</div>
