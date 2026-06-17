<script lang="ts">
  import { X } from '@lucide/svelte';
  import { fade, scale } from 'svelte/transition';
  import QRCode from 'qrcode';
  import { onMount } from 'svelte';

  let { onClose, url } = $props<{ onClose: () => void, url?: string }>();
  let qrCodeDataUrl = $state<string>('');
  let currentUrl = $state<string>('');

  onMount(async () => {
    currentUrl = url || window.location.origin;
    try {
      qrCodeDataUrl = await QRCode.toDataURL(currentUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#F0F0FF',
          light: '#0F0F1A'
        }
      });
    } catch (err) {
      console.error(err);
    }
  });
</script>

<div 
  class="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
  transition:fade
>
  <div 
    class="bg-surface w-full max-w-sm rounded-3xl border border-border p-8 shadow-2xl space-y-6 text-center"
    transition:scale={{ start: 0.95, duration: 200 }}
  >
    <div class="flex justify-between items-start">
      <h2 class="text-display-sm text-left">Share App</h2>
      <button onclick={onClose} class="text-text-secondary hover:text-text-primary transition-colors">
        <X size={24} />
      </button>
    </div>

    <p class="text-body-lg text-text-secondary text-left">Point a camera at this QR code to instantly play without downloading an app.</p>

    <div class="flex justify-center p-4 bg-background rounded-2xl border border-border">
      {#if qrCodeDataUrl}
        <img src={qrCodeDataUrl} alt="QR Code" class="w-full max-w-[200px] h-auto rounded-lg" />
      {:else}
        <div class="w-[200px] h-[200px] animate-pulse bg-surface-variant rounded-lg"></div>
      {/if}
    </div>

    <p class="text-label-sm font-mono text-text-secondary truncate bg-background p-3 rounded-xl border border-border/50">
      {currentUrl}
    </p>

    <button 
      onclick={onClose}
      class="w-full py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl text-label-lg font-bold transition-all active:scale-95"
    >
      Done
    </button>
  </div>
</div>
