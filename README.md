# sveltekit openai realtime api

this is a sveltekit port of the [openai-realtime-console](https://github.com/openai/openai-realtime-console) repository.

it allows you to easily use the openai realtime api in your sveltekit project.

work in progress, but it should be functional.

## how to use

> [!WARNING]
> this is the setup for the client side only version of the realtime api, you will need to use a relay server to use this in production.
> see further down for more information on how to use a relay server.

1. copy the `src/lib/realtime/` folder from this repository into your sveltekit projects `src/lib/` folder

2. install the dependency:

```bash
$ npm i openai/openai-realtime-api-beta
```

2. import the `Realtime` component into your svelte file and use it e.g. like so:

```svelte
<script lang="ts">
	import Realtime from '$lib/realtime/realtime.svelte';
	import type { ItemType } from '@openai/realtime-api-beta/dist/lib/client';

	let startConversation: () => Promise<void>;
	let endConversation: () => Promise<void>;

	let turnDetection: 'server_vad' | 'none' = 'server_vad';

	let items: ItemType[] = [];

	let isConnected = false;
	let isRecording = false;

	let startRecording: () => Promise<void>;
	let stopRecording: () => Promise<void>;

	// set your api key here
	let apiKey = '';
</script>

{#if apiKey}
	<Realtime
		bind:startConversation
		bind:endConversation
		bind:isConnected
		bind:isRecording
		bind:startRecording
		bind:stopRecording
		bind:items
		{turnDetection}
		{apiKey}
	/>
{/if}
```

see `src/routes/+page.svelte` for a full example.

## relay server

for production use, you will need to use a relay server to use the realtime api.

1. add `OPENAI_API_KEY` to your `.env` file

2. tell the Realtime component to use the relay server:

```svelte
<Realtime useRelayServer />
```

then you have two options:

### run the relay server with your sveltekit server

change your `vite.config.ts` to this:

```ts
import { realtimeWebSocketServer } from './src/lib/realtime/realtime_server';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit(), realtimeWebSocketServer]
});
```

### run the relay server independently

- copy the `relay-server/` folder (identical to the code in the
  [openai-realtime-console](https://github.com/openai/openai-realtime-console) repository)
  from this repository into your project

- install the dependencies:

```bash
npm i dotenv openai/openai-realtime-api-beta
```

- run the relay server:

```bash
$ node relay-server/index.js
```

- add the relay server url to your Realtime component:

```
<Realtime useRelayServer relayServer="http://localhost:8081" />
```

## todos

- [ ] add tests
- [ ] add more documentation
- [ ] show waveforms
- [ ] tool calling
- [ ] update ui

## license

MIT
