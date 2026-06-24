<script lang="ts">
  import './layout.css';
  import BottomNav from '$lib/components/BottomNav.svelte';
  import ShareAppModal from '$lib/components/ShareAppModal.svelte';
  import { theme } from '$lib/state/theme.svelte';
  import { pwaInfo } from 'virtual:pwa-info';
  import { onMount } from 'svelte';
  import { QrCode } from '@lucide/svelte';

  let { children } = $props();
  let showShareModal = $state(false);

  onMount(async () => {
    if (pwaInfo) {
      const { registerSW } = await import('virtual:pwa-register');
      registerSW({
        immediate: true,
        onRegistered(r) {
          console.log('SW Registered');
        },
        onRegisterError(error) {
          console.log('SW registration error', error);
        }
      });
    }
  });
</script>

<svelte:head>
  {@html pwaInfo?.webManifest?.linkTag}
  <title>Scoreboard Hub</title>
  <link rel="icon" href="/favicon.svg" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
</svelte:head>

<div class="min-h-screen pb-24">
  <header class="p-6 pb-2 flex justify-between items-center">
    <h1 class="text-display-md">Scoreboard Hub</h1>
    <button 
      onclick={() => showShareModal = true}
      class="p-2 bg-surface-variant hover:bg-background border border-border rounded-full text-text-secondary hover:text-primary transition-colors"
      aria-label="Share App"
    >
      <QrCode size={20} />
    </button>
  </header>

  <main class="px-6">
    {@render children()}
  </main>

  <BottomNav />
</div>

{#if showShareModal}
  <ShareAppModal onClose={() => showShareModal = false} />
{/if}
