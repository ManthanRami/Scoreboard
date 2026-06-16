<script lang="ts">
  import { Trophy, ArrowRight, Play, X } from '@lucide/svelte';

  let { 
    gameType, 
    details, 
    onResume, 
    onNewGame, 
    onClose 
  } = $props<{
    gameType: string;
    details: string;
    onResume: () => void;
    onNewGame: () => void;
    onClose: () => void;
  }>();

  const gameColors: Record<string, string> = {
    kachuful: 'bg-kachuful',
    hearts: 'bg-hearts',
    traitor: 'bg-traitor'
  };
</script>

<!-- Backdrop -->
<div 
  class="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 animate-in fade-in"
  onclick={onClose}
  role="presentation"
></div>

<!-- Bottom Sheet -->
<div class="fixed bottom-0 left-0 right-0 bg-surface rounded-t-3xl border-t border-border z-50 p-6 pb-safe animate-in slide-in-from-bottom-full duration-300 shadow-2xl">
  <div class="flex justify-between items-start mb-6">
    <div>
      <div class="flex items-center gap-2 mb-1">
        <div class="w-3 h-3 rounded-full {gameColors[gameType]} animate-pulse"></div>
        <h3 class="text-label-lg uppercase tracking-wider text-text-secondary">Game in Progress</h3>
      </div>
      <h2 class="text-display-md capitalize">{gameType}</h2>
      <p class="text-body-md mt-2">{details}</p>
    </div>
    <button onclick={onClose} class="p-2 bg-surface-variant rounded-full text-text-secondary hover:text-text-primary transition-colors">
      <X size={20} />
    </button>
  </div>

  <div class="space-y-3">
    <button 
      onclick={onResume}
      class="w-full p-4 bg-primary text-white rounded-2xl text-title-md font-bold transition-all active:scale-95 flex justify-center items-center gap-2"
    >
      <Play size={20} /> Resume Game
    </button>
    
    <button 
      onclick={onNewGame}
      class="w-full p-4 bg-surface-variant hover:bg-background border border-border rounded-2xl text-label-lg font-bold transition-colors active:scale-95 flex justify-center items-center gap-2 text-danger"
    >
      <ArrowRight size={18} /> Start New Game
    </button>
  </div>
</div>

<style>
  .pb-safe {
    padding-bottom: max(1.5rem, env(safe-area-inset-bottom, 1.5rem));
  }
</style>
