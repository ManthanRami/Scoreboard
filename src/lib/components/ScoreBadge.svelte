<script lang="ts">
  let { 
    score, 
    status = 'default' 
  } = $props<{
    score: number | string;
    status?: 'success' | 'danger' | 'warning' | 'default' | 'gold';
  }>();

  const colors: Record<string, string> = {
    success: 'bg-success/20 text-success border-success/30',
    danger: 'bg-danger/20 text-danger border-danger/30',
    warning: 'bg-warning/20 text-warning border-warning/30',
    gold: 'bg-gold/20 text-gold border-gold/30',
    default: 'bg-surface-variant text-text-secondary border-border'
  };
</script>

<div class="px-3 py-1 rounded-lg border text-label-sm font-bold {colors[status]} transition-colors duration-300">
  {score}
</div>
