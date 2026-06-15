<script lang="ts">
  import './layout.css';
  import BottomNav from '$lib/components/BottomNav.svelte';
  import { pwaInfo } from 'virtual:pwa-info';
  import { onMount } from 'svelte';

  let { children } = $props();

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
  <header class="p-6 pb-2">
    <h1 class="text-display-md">Scoreboard Hub</h1>
  </header>

  <main class="px-6">
    {@render children()}
  </main>

  <BottomNav />
</div>
