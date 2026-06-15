import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) => filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter({
				fallback: 'index.html'
			})
		}),
		SvelteKitPWA({
			registerType: 'autoUpdate',
			manifest: {
				name: 'Scoreboard Hub',
				short_name: 'Scoreboard',
				description: 'Mobile-first game scoreboard hub',
				theme_color: '#0f0f1a',
				background_color: '#0f0f1a',
				display: 'standalone',
				orientation: 'portrait',
				icons: [
					{
						src: 'favicon.svg',
						sizes: 'any',
						type: 'image/svg+xml',
						purpose: 'any maskable'
					}
				]
			}
		})
	]
});
