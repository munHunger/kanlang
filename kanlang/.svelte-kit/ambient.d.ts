
// this file is generated — do not edit it


/// <reference types="@sveltejs/kit" />

/**
 * Environment variables [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env`. Like [`$env/dynamic/private`](https://kit.svelte.dev/docs/modules#$env-dynamic-private), this module cannot be imported into client-side code. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://kit.svelte.dev/docs/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://kit.svelte.dev/docs/configuration#env) (if configured).
 * 
 * _Unlike_ [`$env/dynamic/private`](https://kit.svelte.dev/docs/modules#$env-dynamic-private), the values exported from this module are statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * ```ts
 * import { API_KEY } from '$env/static/private';
 * ```
 * 
 * Note that all environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * 
 * ```
 * MY_FEATURE_FLAG=""
 * ```
 * 
 * You can override `.env` values from the command line like so:
 * 
 * ```bash
 * MY_FEATURE_FLAG="enabled" npm run dev
 * ```
 */
declare module '$env/static/private' {
	export const ALACRITTY_LOG: string;
	export const ALACRITTY_SOCKET: string;
	export const ALACRITTY_WINDOW_ID: string;
	export const BROWSER: string;
	export const COLORTERM: string;
	export const DBUS_SESSION_BUS_ADDRESS: string;
	export const DEBUGINFOD_URLS: string;
	export const DESKTOP_SESSION: string;
	export const DISPLAY: string;
	export const EDITOR: string;
	export const GDMSESSION: string;
	export const GTK2_RC_FILES: string;
	export const GTK3_MODULES: string;
	export const GTK_MODULES: string;
	export const HOME: string;
	export const I3SOCK: string;
	export const LANG: string;
	export const LC_ADDRESS: string;
	export const LC_IDENTIFICATION: string;
	export const LC_MEASUREMENT: string;
	export const LC_MONETARY: string;
	export const LC_NAME: string;
	export const LC_NUMERIC: string;
	export const LC_PAPER: string;
	export const LC_TELEPHONE: string;
	export const LC_TIME: string;
	export const LOGNAME: string;
	export const MAIL: string;
	export const MOTD_SHOWN: string;
	export const PATH: string;
	export const PWD: string;
	export const QT_QPA_PLATFORMTHEME: string;
	export const SHELL: string;
	export const SHLVL: string;
	export const TERM: string;
	export const USER: string;
	export const WINDOWID: string;
	export const XAUTHORITY: string;
	export const XDG_CURRENT_DESKTOP: string;
	export const XDG_DATA_DIRS: string;
	export const XDG_GREETER_DATA_DIR: string;
	export const XDG_RUNTIME_DIR: string;
	export const XDG_SEAT: string;
	export const XDG_SEAT_PATH: string;
	export const XDG_SESSION_CLASS: string;
	export const XDG_SESSION_DESKTOP: string;
	export const XDG_SESSION_ID: string;
	export const XDG_SESSION_PATH: string;
	export const XDG_SESSION_TYPE: string;
	export const XDG_VTNR: string;
	export const _: string;
	export const OLDPWD: string;
	export const LESS_TERMCAP_mb: string;
	export const LESS_TERMCAP_md: string;
	export const LESS_TERMCAP_me: string;
	export const LESS_TERMCAP_se: string;
	export const LESS_TERMCAP_so: string;
	export const LESS_TERMCAP_ue: string;
	export const LESS_TERMCAP_us: string;
	export const LESS: string;
	export const LS_OPTIONS: string;
	export const LS_COLORS: string;
	export const P9K_SSH: string;
	export const _P9K_SSH_TTY: string;
	export const P9K_TTY: string;
	export const _P9K_TTY: string;
	export const NX_CLI_SET: string;
	export const NX_LOAD_DOT_ENV_FILES: string;
	export const NX_WORKSPACE_ROOT: string;
	export const NX_TERMINAL_OUTPUT_PATH: string;
	export const NX_STREAM_OUTPUT: string;
	export const NX_TASK_TARGET_PROJECT: string;
	export const NX_TASK_TARGET_TARGET: string;
	export const NX_TASK_TARGET_CONFIGURATION: string;
	export const NX_TASK_HASH: string;
	export const LERNA_PACKAGE_NAME: string;
	export const NODE_ENV: string;
}

/**
 * Similar to [`$env/static/private`](https://kit.svelte.dev/docs/modules#$env-static-private), except that it only includes environment variables that begin with [`config.kit.env.publicPrefix`](https://kit.svelte.dev/docs/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Values are replaced statically at build time.
 * 
 * ```ts
 * import { PUBLIC_BASE_URL } from '$env/static/public';
 * ```
 */
declare module '$env/static/public' {
	
}

/**
 * This module provides access to runtime environment variables, as defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/master/packages/adapter-node) (or running [`vite preview`](https://kit.svelte.dev/docs/cli)), this is equivalent to `process.env`. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://kit.svelte.dev/docs/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://kit.svelte.dev/docs/configuration#env) (if configured).
 * 
 * This module cannot be imported into client-side code.
 * 
 * ```ts
 * import { env } from '$env/dynamic/private';
 * console.log(env.DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 * 
 * > In `dev`, `$env/dynamic` always includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 */
declare module '$env/dynamic/private' {
	export const env: {
		ALACRITTY_LOG: string;
		ALACRITTY_SOCKET: string;
		ALACRITTY_WINDOW_ID: string;
		BROWSER: string;
		COLORTERM: string;
		DBUS_SESSION_BUS_ADDRESS: string;
		DEBUGINFOD_URLS: string;
		DESKTOP_SESSION: string;
		DISPLAY: string;
		EDITOR: string;
		GDMSESSION: string;
		GTK2_RC_FILES: string;
		GTK3_MODULES: string;
		GTK_MODULES: string;
		HOME: string;
		I3SOCK: string;
		LANG: string;
		LC_ADDRESS: string;
		LC_IDENTIFICATION: string;
		LC_MEASUREMENT: string;
		LC_MONETARY: string;
		LC_NAME: string;
		LC_NUMERIC: string;
		LC_PAPER: string;
		LC_TELEPHONE: string;
		LC_TIME: string;
		LOGNAME: string;
		MAIL: string;
		MOTD_SHOWN: string;
		PATH: string;
		PWD: string;
		QT_QPA_PLATFORMTHEME: string;
		SHELL: string;
		SHLVL: string;
		TERM: string;
		USER: string;
		WINDOWID: string;
		XAUTHORITY: string;
		XDG_CURRENT_DESKTOP: string;
		XDG_DATA_DIRS: string;
		XDG_GREETER_DATA_DIR: string;
		XDG_RUNTIME_DIR: string;
		XDG_SEAT: string;
		XDG_SEAT_PATH: string;
		XDG_SESSION_CLASS: string;
		XDG_SESSION_DESKTOP: string;
		XDG_SESSION_ID: string;
		XDG_SESSION_PATH: string;
		XDG_SESSION_TYPE: string;
		XDG_VTNR: string;
		_: string;
		OLDPWD: string;
		LESS_TERMCAP_mb: string;
		LESS_TERMCAP_md: string;
		LESS_TERMCAP_me: string;
		LESS_TERMCAP_se: string;
		LESS_TERMCAP_so: string;
		LESS_TERMCAP_ue: string;
		LESS_TERMCAP_us: string;
		LESS: string;
		LS_OPTIONS: string;
		LS_COLORS: string;
		P9K_SSH: string;
		_P9K_SSH_TTY: string;
		P9K_TTY: string;
		_P9K_TTY: string;
		NX_CLI_SET: string;
		NX_LOAD_DOT_ENV_FILES: string;
		NX_WORKSPACE_ROOT: string;
		NX_TERMINAL_OUTPUT_PATH: string;
		NX_STREAM_OUTPUT: string;
		NX_TASK_TARGET_PROJECT: string;
		NX_TASK_TARGET_TARGET: string;
		NX_TASK_TARGET_CONFIGURATION: string;
		NX_TASK_HASH: string;
		LERNA_PACKAGE_NAME: string;
		NODE_ENV: string;
		[key: `PUBLIC_${string}`]: undefined;
		[key: `${string}`]: string | undefined;
	}
}

/**
 * Similar to [`$env/dynamic/private`](https://kit.svelte.dev/docs/modules#$env-dynamic-private), but only includes variables that begin with [`config.kit.env.publicPrefix`](https://kit.svelte.dev/docs/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Note that public dynamic environment variables must all be sent from the server to the client, causing larger network requests — when possible, use `$env/static/public` instead.
 * 
 * ```ts
 * import { env } from '$env/dynamic/public';
 * console.log(env.PUBLIC_DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 */
declare module '$env/dynamic/public' {
	export const env: {
		[key: `PUBLIC_${string}`]: string | undefined;
	}
}
