<script lang="ts">
  import { X } from '@lucide/svelte';
  import { fade, scale } from 'svelte/transition';

  let { 
    title, 
    message, 
    confirmLabel = 'Confirm', 
    cancelLabel = 'Cancel', 
    type = 'default',
    onConfirm, 
    onCancel 
  } = $props<{
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    type?: 'default' | 'danger';
    onConfirm: () => void;
    onCancel: () => void;
  }>();
</script>

<div 
  class="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
  transition:fade
>
  <div 
    class="bg-surface w-full max-w-md rounded-3xl border border-border p-6 shadow-2xl space-y-6"
    transition:scale={{ start: 0.95, duration: 200 }}
  >
    <div class="flex justify-between items-start">
      <h2 class="text-display-sm">{title}</h2>
      <button onclick={onCancel} class="text-text-secondary hover:text-text-primary transition-colors">
        <X size={24} />
      </button>
    </div>

    <p class="text-body-lg text-text-secondary">{message}</p>

    <div class="flex gap-3">
      <button 
        onclick={onCancel}
        class="flex-1 py-4 bg-surface-variant hover:bg-background border border-border rounded-2xl text-label-lg font-bold transition-colors"
      >
        {cancelLabel}
      </button>
      <button 
        onclick={onConfirm}
        class="flex-1 py-4 text-white rounded-2xl text-label-lg font-bold transition-all active:scale-95 {type === 'danger' ? 'bg-danger hover:opacity-90' : 'bg-primary hover:bg-primary-dark'}"
      >
        {confirmLabel}
      </button>
    </div>
  </div>
</div>
