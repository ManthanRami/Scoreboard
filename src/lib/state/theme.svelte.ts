import { browser } from '$app/environment';

export type Theme = 'default' | 'casino' | 'cyberpunk' | 'light';

class ThemeStore {
	current = $state<Theme>('default');

	constructor() {
		if (browser) {
			const saved = localStorage.getItem('app_theme') as Theme;
			if (saved && ['default', 'casino', 'cyberpunk', 'light'].includes(saved)) {
				this.current = saved;
			}
			this.applyTheme(this.current);
		}
	}

	setTheme(theme: Theme) {
		this.current = theme;
		if (browser) {
			localStorage.setItem('app_theme', theme);
			this.applyTheme(theme);
		}
	}

	private applyTheme(theme: Theme) {
		if (!browser) return;
		const root = document.documentElement;
		// Remove existing themes
		root.classList.remove('theme-casino', 'theme-cyberpunk', 'theme-light');
		// Add new theme class if not default
		if (theme !== 'default') {
			root.classList.add(`theme-${theme}`);
		}
	}
}

export const theme = new ThemeStore();
