# sveltekit openai realtime api

this is a svelte component for using the openai realtime api (and mostly a direct port to svelte of the [openai-realtime-console](https://github.com/openai/openai-realtime-console) repository).

it allows you to easily use the openai realtime api in your svelte(kit) project.

work in progress, but it should be functional.

demos here (enter your own api key, as always be careful with stuff like that and e.g. use a 2$ limited api key): 

basic chat: https://flo-bit.dev/svelte-openai-realtime-api/

chat with visualizations: https://flo-bit.dev/svelte-openai-realtime-api/visualizations-chat


https://github.com/user-attachments/assets/67d94a6c-ee44-4834-a9dd-a628b4a4e093


## how to use

> [!WARNING]
> this is the setup for the client side only version of the realtime api, you will need to use a relay server to use this in production.
> see further down for more information on how to use a relay server.

1. copy the `src/lib/realtime/` folder from this repository into your sveltekit projects `src/lib/` folder

2. install the dependency:

```bash
$ npm i openai/openai-realtime-api-beta
```

3. import the `Realtime` component into your svelte file and use it e.g. like so:

```svelte
<script lang="ts">
	import Realtime from '$lib/realtime/Realtime.svelte';
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

## visualization

see `src/routes/visulizations-chat/+page.svelte` for an example of how to visualize the audio input and output. and `src/routes/visulizations-input/+page.svelte` for all currently available visualizations.

demo here: https://flo-bit.dev/svelte-openai-realtime-api/visualizations-input

## relay server

for production use, you will need to use a relay server to use the realtime api.

1. add `OPENAI_API_KEY` to your `.env` file

2. tell the Realtime component to use the relay server:

```svelte
<Realtime useRelayServer />
```

then you have two options:

### run the relay server with your sveltekit server

> [!WARNING]
> this currently only works in development mode, if you want to use this in production you will need to run the relay server independently.
> if you have any ideas on how to make this work in production, please let me know.

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

- [x] show waveforms
- [ ] add tests
- [ ] update main demo ui
- [ ] add more documentation
    - [ ] simple setup client side, server side
    - [ ] all props
- [ ] tool calling
- [ ] events
    - onConnect
    - onDisconnect
    - onError
    - onInterrupt
    - onRealtimeEvent
    - onConversationUpdate
    - speechStart
    - speechStop
- [ ] error handling
- [ ] pause/resume recording
- [ ] send text message
- [ ] update props
	- instructions
	- voice
	- vad settings

## license

MIT
