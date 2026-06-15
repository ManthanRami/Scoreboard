<script lang="ts">
  import type { Component } from 'svelte';

  let { 
    title, 
    description, 
    players, 
    path, 
    icon: IconComponent, 
    colorClass 
  } = $props<{
    title: string;
    description: string;
    players: string;
    path: string;
    icon: Component<any>;
    colorClass: string;
  }>();
</script>

<a 
  href={path}
  class="relative overflow-hidden p-6 rounded-2xl bg-surface border border-border group transition-all duration-300 active:scale-95 hover:border-primary/50"
>
  <div class="flex justify-between items-start mb-4">
    <div class="p-3 rounded-xl bg-background border border-border group-hover:border-primary/30 transition-colors">
      <IconComponent size={32} class={colorClass} />
    </div>
    <span class="text-label-sm text-text-secondary">{players} Players</span>
  </div>

  <h3 class="text-title-lg mb-1">{title}</h3>
  <p class="text-body-md line-clamp-2">{description}</p>

  <div class="absolute bottom-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
    <span class="text-primary text-label-lg">Play →</span>
  </div>
</a>
