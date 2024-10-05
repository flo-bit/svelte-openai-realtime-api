<script lang="ts">
	import Realtime from '$lib/realtime/Realtime.svelte';
	import Switch from '$lib/ui/Switch.svelte';
	import Layout from '$lib/ui/Layout.svelte';
	import type { ItemType } from '@openai/realtime-api-beta/dist/lib/client';
	import { onMount } from 'svelte';

	let startConversation: () => Promise<void>;
	let endConversation: () => Promise<void>;

	let turnDetection: 'server_vad' | 'none' = 'server_vad';

	let items: ItemType[] = [];

	let isConnected = false;
	let isRecording = false;

	let startRecording: () => Promise<void>;
	let stopRecording: () => Promise<void>;

	let apiKey = '';

	onMount(() => {
		apiKey = localStorage.getItem('tmp::voice_api_key') || '';
	});
</script>

<Layout>
	<div slot="header" class="p-6 text-white text-sm font-semibold border-b border-white/15 w-full">
		<div class="max-w-5xl mx-auto flex justify-between">
			<div>svelte openai realtime api</div>

			<button
				on:click={() => {
					const apiKey = prompt('OpenAI API Key');
					if (apiKey !== null) {
						localStorage.clear();
						localStorage.setItem('tmp::voice_api_key', apiKey);
						window.location.reload();
					}
				}}
				class="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/15 rounded-full font-normal"
				>{apiKey ? 'change' : 'set'} api key</button
			>
		</div>
	</div>

	<div class="text-white p-6 mx-auto max-w-5xl">
		{#key items}
			{#each items as item, index}
				{#if item.formatted && index > 0}
					<div
						class="text-sm py-4 border-b border-white/5 {item.role === 'user'
							? 'text-amber-200'
							: ''}"
					>
						<span class="font-semibold">{item.role}:</span>
						{item.role === 'user'
							? item.formatted.transcript || '(empty)'
							: item.formatted.transcript || '(truncated)'}
					</div>
				{/if}
			{/each}
		{/key}
	</div>

	<div slot="footer" class="p-6 py-4 border-t border-white/15 w-full">
		<div class="items-center flex justify-between w-full max-w-5xl mx-auto">
			<div class="text-white text-sm font-semibold flex flex-col gap-3">
				<div>turn detection</div>
				<Switch options={['server_vad', 'none']} bind:selected={turnDetection} />
			</div>

			{#if turnDetection === 'none' && isConnected}
				<button
					type="button"
					on:pointerdown={() => {
						startRecording();
					}}
					on:pointerup={() => {
						stopRecording();
					}}
					class="rounded-full px-5 py-3 text-base font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 text-black bg-amber-500 hover:bg-amber-400 active:bg-amber-700"
					>press and hold</button
				>
			{/if}

			<button
				type="button"
				on:click={() => {
					if (!apiKey) {
						alert('Please set your OpenAI API Key first');
						return;
					}

					if (isConnected) {
						endConversation();
					} else {
						startConversation();
					}
				}}
				class="rounded-full px-5 py-3 text-base font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 {isConnected
					? 'text-amber-500 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20'
					: 'text-black bg-amber-500 hover:bg-amber-400'} {apiKey
					? ''
					: 'cursor-not-allowed opacity-50'}">{isConnected ? 'disconnect' : 'connect'}</button
			>
		</div>
	</div>
</Layout>

{#if apiKey}
	<Realtime
		bind:startConversation
		bind:endConversation
		bind:isConnected
		bind:isRecording
		bind:items
		bind:startRecording
		bind:stopRecording
		{turnDetection}
		{apiKey}
	/>
{/if}
