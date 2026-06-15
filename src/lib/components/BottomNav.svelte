<script lang="ts">
  import { House, History, Settings } from '@lucide/svelte';
  import { page } from '$app/stores';

  const items = [
    { label: 'Home', icon: House, path: '/' },
    { label: 'History', icon: History, path: '/history' },
    { label: 'Settings', icon: Settings, path: '/settings' }
  ];
</script>

<nav class="fixed bottom-0 left-0 right-0 bg-surface border-t border-border pb-safe pt-2 px-6 flex justify-between items-center z-50">
  {#each items as item}
    <a 
      href={item.path} 
      class="flex flex-col items-center gap-1 group transition-colors duration-200"
      class:text-primary={$page.url.pathname === item.path}
      class:text-text-secondary={$page.url.pathname !== item.path}
    >
      <item.icon size={24} class="group-hover:scale-110 transition-transform duration-200" />
      <span class="text-label-sm">{item.label}</span>
    </a>
  {/each}
</nav>

<style>
  .pb-safe {
    padding-bottom: env(safe-area-inset-bottom, 0.5rem);
  }
</style>
