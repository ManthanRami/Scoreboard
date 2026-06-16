<script lang="ts">
  import { Trophy } from '@lucide/svelte';

  type RacePlayer = { name: string; totalScore: number };
  type SortMode = 'high-to-low' | 'low-to-high';

  let {
    players,
    sortMode = 'high-to-low'
  } = $props<{
    players: RacePlayer[];
    sortMode?: SortMode;
  }>();

  const sortedPlayers = $derived([...players].sort((a: RacePlayer, b: RacePlayer) =>
    sortMode === 'low-to-high' ? a.totalScore - b.totalScore : b.totalScore - a.totalScore
  ));
  const maxScore = $derived(Math.max(...players.map((player: RacePlayer) => player.totalScore), 1));
  const isLowScoreBetter = $derived(sortMode === 'low-to-high');
  const bestScore = $derived(isLowScoreBetter 
    ? Math.min(...players.map((p: RacePlayer) => p.totalScore))
    : Math.max(...players.map((p: RacePlayer) => p.totalScore))
  );

  function isLeader(score: number) {
    return score === bestScore && (isLowScoreBetter || score > 0);
  }
</script>

<div class="space-y-3">
  {#each sortedPlayers as player}
    <div class="space-y-1">
      <div class="flex justify-between text-label-sm px-1">
        <span class="flex items-center gap-1">
          {#if isLeader(player.totalScore)}
            <Trophy size={14} class="text-gold" />
          {/if}
          {player.name}
        </span>
        <span class="font-mono">{player.totalScore}</span>
      </div>
      <div class="h-3 w-full bg-surface-variant rounded-full overflow-hidden border border-border/50">
        <div
          class="h-full rounded-full transition-all duration-700 ease-out"
          class:bg-gold={isLeader(player.totalScore)}
          class:bg-primary={!isLeader(player.totalScore)}
          style:width="{isLowScoreBetter ? ((maxScore - player.totalScore + 1) / (maxScore + 1)) * 100 : (player.totalScore / maxScore) * 100}%"
        ></div>
      </div>
    </div>
  {/each}
</div>
