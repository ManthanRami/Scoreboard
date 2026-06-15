<script lang="ts">
  import { onMount } from 'svelte';
  import { User, Download, Trash2, Smartphone, Moon, Sun, Code, Info, ArrowRight } from '@lucide/svelte';

  let displayName = $state('Player One');
  let installPrompt: any = null;

  onMount(() => {
    const savedName = localStorage.getItem('player_name');
    if (savedName) displayName = savedName;

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      installPrompt = e;
    });
  });

  function saveName() {
    localStorage.setItem('player_name', displayName);
    alert('Name saved!');
  }

  async function install() {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') installPrompt = null;
    } else {
      alert('To install: Tap the share button and "Add to Home Screen"');
    }
  }

  function exportData() {
    const data = {
      history: JSON.parse(localStorage.getItem('game_history') || '[]'),
      name: displayName,
      settings: {}
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scoreboard_hub_data_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
</script>

<div class="space-y-8 animate-in fade-in duration-500">
  <h2 class="text-display-md">Settings</h2>

  <section class="space-y-4">
    <h3 class="text-label-lg text-text-secondary uppercase">Profile</h3>
    <div class="p-6 rounded-2xl bg-surface border border-border space-y-4">
      <div class="flex items-center gap-4">
        <div class="w-16 h-16 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
          <User size={32} />
        </div>
        <div class="flex-1">
          <input 
            type="text" 
            bind:value={displayName}
            class="w-full bg-background border-border rounded-xl p-2 text-title-md focus:ring-primary"
          />
          <p class="text-label-sm text-text-secondary mt-1">Visible in scoreboards</p>
        </div>
      </div>
      <button 
        onclick={saveName}
        class="w-full py-3 bg-surface-variant hover:bg-background border border-border rounded-xl text-label-lg transition-colors"
      >
        Save Changes
      </button>
    </div>
  </section>

  <section class="space-y-4">
    <h3 class="text-label-lg text-text-secondary uppercase">Application</h3>
    <div class="space-y-3">
      <button 
        onclick={install}
        class="w-full p-4 rounded-2xl bg-surface border border-border flex items-center justify-between hover:border-primary/50 transition-colors"
      >
        <div class="flex items-center gap-3">
          <div class="p-2 bg-primary/10 text-primary rounded-lg"><Smartphone size={20} /></div>
          <span class="text-title-md">Install App</span>
        </div>
        <ArrowRight size={18} class="text-text-secondary" />
      </button>

      <div class="w-full p-4 rounded-2xl bg-surface border border-border flex items-center justify-between opacity-50">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-text-secondary/10 text-text-secondary rounded-lg"><Moon size={20} /></div>
          <span class="text-title-md">Theme (Coming soon)</span>
        </div>
        <div class="w-12 h-6 bg-surface-variant rounded-full"></div>
      </div>
    </div>
  </section>

  <section class="space-y-4">
    <h3 class="text-label-lg text-text-secondary uppercase">Data</h3>
    <div class="space-y-3">
      <button 
        onclick={exportData}
        class="w-full p-4 rounded-2xl bg-surface border border-border flex items-center justify-between hover:border-success/50 transition-colors"
      >
        <div class="flex items-center gap-3">
          <div class="p-2 bg-success/10 text-success rounded-lg"><Download size={20} /></div>
          <span class="text-title-md">Export History</span>
        </div>
        <ArrowRight size={18} class="text-text-secondary" />
      </button>

      <button 
        onclick={() => { if(confirm('Erase all data?')) localStorage.clear(); location.reload(); }}
        class="w-full p-4 rounded-2xl bg-surface border border-border flex items-center justify-between hover:border-danger/50 transition-colors"
      >
        <div class="flex items-center gap-3">
          <div class="p-2 bg-danger/10 text-danger rounded-lg"><Trash2 size={20} /></div>
          <span class="text-title-md text-danger">Reset App</span>
        </div>
        <ArrowRight size={18} class="text-text-secondary" />
      </button>
    </div>
  </section>

  <section class="pt-8 text-center space-y-4">
    <div class="flex justify-center gap-6 text-text-secondary opacity-50">
      <Code size={24} />
      <Info size={24} />
    </div>
    <p class="text-label-sm text-text-secondary opacity-50">Scoreboard Hub v1.0.0 • Made with Svelte 5</p>
  </section>
</div>


