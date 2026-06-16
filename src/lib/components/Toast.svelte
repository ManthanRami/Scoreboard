<script lang="ts">
  import { X } from '@lucide/svelte';
  import { fade, slide } from 'svelte/transition';

  let {
    message,
    type = 'default',
    duration = 2500,
    onClose
  } = $props<{
    message: string;
    type?: 'default' | 'success' | 'danger' | 'info';
    duration?: number;
    onClose: () => void;
  }>();

  $effect(() => {
    const timer = window.setTimeout(onClose, duration);
    return () => window.clearTimeout(timer);
  });
</script>

<div
  class="fixed bottom-6 left-1/2 z-[110] w-[min(92vw,28rem)] -translate-x-1/2"
  transition:slide={{ axis: 'y', duration: 200 }}
>
  <div
    class="rounded-2xl border p-4 shadow-2xl backdrop-blur-md {type === 'success' ? 'bg-success/15 border-success/30' : type === 'danger' ? 'bg-danger/15 border-danger/30' : type === 'info' ? 'bg-primary/15 border-primary/30' : 'bg-surface border-border'}"
    transition:fade
  >
    <div class="flex items-start gap-3">
      <p class="flex-1 text-body-md font-bold text-text-primary">{message}</p>
      <button onclick={onClose} class="text-text-secondary hover:text-text-primary">
        <X size={18} />
      </button>
    </div>
  </div>
</div>
