declare module 'virtual:pwa-info' {
	export const pwaInfo: {
		webManifest?: {
			linkTag?: string;
		};
	};
}

declare module 'virtual:pwa-register' {
	export function registerSW(options?: {
		immediate?: boolean;
		onRegistered?: (registration?: ServiceWorkerRegistration) => void;
		onRegisterError?: (error: Error) => void;
	}): Promise<() => void>;
}
