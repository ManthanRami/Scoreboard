<script lang="ts">
  import { X, GripVertical } from '@lucide/svelte';

  let { 
    name = $bindable(), 
    index, 
    onRemove 
  } = $props<{
    name: string;
    index: number;
    onRemove?: () => void;
  }>();
</script>

<div class="flex items-center gap-3 p-3 bg-surface rounded-xl border border-border group">
  <div class="text-text-secondary cursor-grab active:cursor-grabbing">
    <GripVertical size={20} />
  </div>
  
  <div class="flex-1 flex flex-col">
    <span class="text-label-sm text-text-secondary">Player {index + 1}</span>
    <input 
      type="text" 
      bind:value={name}
      placeholder="Enter name"
      class="bg-transparent border-none p-0 text-title-md focus:ring-0 placeholder:text-text-secondary/50"
    />
  </div>

  {#if onRemove}
    <button 
      onclick={onRemove}
      class="p-2 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
    >
      <X size={20} />
    </button>
  {/if}
</div>
