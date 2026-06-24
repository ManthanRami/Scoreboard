<script lang="ts">
  import { onMount } from 'svelte';
  import { User, Download, Trash2, Smartphone, Moon, Sun, Code, Info, ArrowRight } from '@lucide/svelte';
  import Modal from '$lib/components/Modal.svelte';
  import Toast from '$lib/components/Toast.svelte';
  import { theme, type Theme } from '$lib/state/theme.svelte';

  let displayName = $state('Player One');
  let installPrompt: any = null;
  let showSavedToast = $state(false);
  let showInstallToast = $state(false);
  let showResetModal = $state(false);

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
    showSavedToast = true;
  }

  async function install() {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') installPrompt = null;
    } else {
      showInstallToast = true;
    }
  }

  function requestReset() {
    showResetModal = true;
  }

  function resetApp() {
    localStorage.clear();
    location.reload();
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
    <h3 class="text-label-lg text-text-secondary uppercase">Appearance</h3>
    <div class="p-6 rounded-2xl bg-surface border border-border space-y-4">
      <div class="flex items-center gap-3 mb-2">
        <div class="p-2 bg-primary/10 text-primary rounded-lg">
          {#if theme.current === 'light'}
            <Sun size={20} />
          {:else}
            <Moon size={20} />
          {/if}
        </div>
        <span class="text-title-md">App Theme</span>
      </div>

      <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {#each [
          { id: 'default', name: 'Deep Navy', bg: 'bg-[#0f0f1a]', accent: 'bg-[#6c63ff]', text: 'text-[#f0f0ff]' },
          { id: 'casino', name: 'Green Felt', bg: 'bg-[#0d2c16]', accent: 'bg-[#ffd700]', text: 'text-[#f0fff4]' },
          { id: 'cyberpunk', name: 'Cyberpunk', bg: 'bg-[#0c0813]', accent: 'bg-[#00f0ff]', text: 'text-[#ffe6ff]' },
          { id: 'light', name: 'Light Slate', bg: 'bg-[#f8fafc]', accent: 'bg-[#4f46e5]', text: 'text-[#0f172a]', border: 'border-slate-200' }
        ] as t}
          <button
            onclick={() => theme.setTheme(t.id as Theme)}
            class="p-4 rounded-xl border transition-all text-left flex flex-col justify-between h-24 relative overflow-hidden active:scale-95 {theme.current === t.id ? 'border-primary ring-2 ring-primary/20 scale-[1.02]' : 'border-border hover:border-text-secondary/30'}"
          >
            <!-- Miniature preview -->
            <div class="w-full h-8 rounded-md {t.bg} {t.border || 'border-border/30'} border flex items-center justify-between px-2 py-1">
              <span class="w-2 h-2 rounded-full {t.accent}"></span>
              <span class="text-[9px] font-bold {t.text}">12</span>
            </div>
            
            <div class="mt-2">
              <p class="text-label-sm font-bold truncate">{t.name}</p>
            </div>
          </button>
        {/each}
      </div>
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
        onclick={requestReset}
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

  {#if showSavedToast}
    <Toast
      message="Name saved!"
      type="success"
      onClose={() => showSavedToast = false}
    />
  {/if}

  {#if showInstallToast}
    <Toast
      message='To install: Tap the share button and "Add to Home Screen".'
      type="info"
      onClose={() => showInstallToast = false}
    />
  {/if}

  {#if showResetModal}
    <Modal
      title="Erase All Data?"
      message="This will permanently remove saved games, history, and settings from this browser."
      confirmLabel="Erase Data"
      type="danger"
      onConfirm={resetApp}
      onCancel={() => showResetModal = false}
    />
  {/if}
</div>


