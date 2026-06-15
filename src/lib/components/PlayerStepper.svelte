<script lang="ts">
  import { Plus, Minus } from '@lucide/svelte';

  let { 
    value = $bindable(), 
    min = 0, 
    max = 100, 
    label,
    step = 1
  } = $props<{
    value: number;
    min?: number;
    max?: number;
    label?: string;
    step?: number;
  }>();

  function decrement() {
    if (value > min) value -= step;
  }

  function increment() {
    if (value < max) value += step;
  }
</script>

<div class="flex flex-col gap-2">
  {#if label}
    <span class="text-label-sm text-text-secondary">{label}</span>
  {/if}
  <div class="flex items-center gap-4 bg-surface-variant p-2 rounded-xl border border-border">
    <button 
      onclick={decrement}
      disabled={value <= min}
      class="p-2 rounded-lg bg-surface hover:bg-background disabled:opacity-30 transition-colors"
      aria-label="Decrement"
    >
      <Minus size={20} />
    </button>
    
    <span class="flex-1 text-center text-title-lg font-mono">{value}</span>
    
    <button 
      onclick={increment}
      disabled={value >= max}
      class="p-2 rounded-lg bg-surface hover:bg-background disabled:opacity-30 transition-colors"
      aria-label="Increment"
    >
      <Plus size={20} />
    </button>
  </div>
</div>
