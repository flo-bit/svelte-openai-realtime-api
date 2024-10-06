<script lang="ts">
	import Realtime from '$lib/realtime/Realtime.svelte';
	import CircleBarVisualizer from '$lib/realtime/visualizations/CircleBarVisualizer.svelte';
	import Modal from '$lib/ui/Modal.svelte';

	import { WavRecorder, WavStreamPlayer } from '$lib/realtime/wavtools';
	import DeformedCircleVisualizer from '$lib/realtime/visualizations/DeformedCircleVisualizer.svelte';
	import InnerGlowVisualizer from '$lib/realtime/visualizations/InnerGlowVisualizer.svelte';
	import CircleCirclesVisualizer from '$lib/realtime/visualizations/CircleCirclesVisualizer.svelte';
	import BarVisualizer from '$lib/realtime/visualizations/BarVisualizer.svelte';
	import type { ItemType } from '@openai/realtime-api-beta/dist/lib/client';

	export let wavRecorder: WavRecorder;
	let wavStreamPlayer: WavStreamPlayer;

	let apiKey = '';

	let startConversation: () => Promise<void>;

	let visualizations = ['circle-bars', 'circle-circles', 'bars', 'deformed-circle', 'innerglow'];

	let current = 0;

	$: shownVisualizer = visualizations[current];

	let items: ItemType[] = [];

	let lastAssistantText = '';
	let lastUserText = '';

	$: if (items && items.length > 0) {
		// last item with role "assistant"

		const lastAssistant = items
			.slice()
			.reverse()
			.find((item) => item.role === 'assistant');

		if (
			lastAssistant?.formatted.transcript &&
			lastAssistant.formatted.transcript !== lastAssistantText
		) {
			lastAssistantText = lastAssistant.formatted.transcript;
		}

		const lastUser = items
			.slice()
			.reverse()
			.find((item) => item.role === 'user');

		if (lastUser?.formatted.transcript && lastUser.formatted.transcript !== lastUserText) {
			lastUserText = lastUser.formatted.transcript;
		}
	}
</script>

<button
	class="absolute inset-0 h-[100dvh] w-screen z-10 text-white flex items-end justify-center p-4 text-sm font-semibold"
	on:click={() => {
		current = (current + 1) % visualizations.length;
	}}
>
	<div>click anywhere to switch visualization</div>
</button>

{#if apiKey}
	<Realtime bind:startConversation bind:items bind:wavRecorder bind:wavStreamPlayer {apiKey} />
{/if}

{#if shownVisualizer === 'circle-bars'}
	<div class="absolute flex items-center justify-center h-[100dvh] w-screen">
		<div class="h-96 w-96">
			<CircleBarVisualizer
				detail={128}
				wavInput={wavRecorder}
				startHue={0}
				endHue={50}
				varyBrightness
			/>
		</div>
	</div>

	<div class="absolute flex items-center justify-center h-[100dvh] w-screen">
		<div class="h-96 w-96">
			<CircleBarVisualizer
				detail={128}
				wavInput={wavStreamPlayer}
				startHue={150}
				endHue={220}
				varyBrightness
			/>
		</div>
	</div>
{:else if shownVisualizer === 'bars'}
	<div class="absolute flex items-center justify-center h-[100dvh] w-screen">
		<div class="h-64 w-96">
			<BarVisualizer barSpacing={8} wavInput={wavRecorder} startHue={0} endHue={50} />
		</div>
	</div>
	<div class="absolute flex items-center justify-center h-[100dvh] w-screen">
		<div class="h-64 w-96 -scale-y-100 md:scale-y-100">
			<BarVisualizer barSpacing={8} wavInput={wavStreamPlayer} startHue={150} endHue={220} />
		</div>
	</div>
{:else if shownVisualizer === 'circle-circles'}
	<div class="absolute flex items-center justify-center h-[100dvh] w-screen">
		<div class="h-96 w-96">
			<CircleCirclesVisualizer wavInput={wavRecorder} startHue={0} endHue={50} varyBrightness />
		</div>
	</div>
	<div class="absolute flex items-center justify-center h-[100dvh] w-screen">
		<div class="h-96 w-96">
			<CircleCirclesVisualizer
				wavInput={wavStreamPlayer}
				startHue={150}
				endHue={220}
				varyBrightness
			/>
		</div>
	</div>
{:else if shownVisualizer === 'deformed-circle'}
	<div class="absolute flex items-center justify-center h-[100dvh] w-screen">
		<div class="h-96 w-96">
			<DeformedCircleVisualizer wavInput={wavRecorder} startHue={0} endHue={50} />
		</div>
	</div>
	<div class="absolute flex items-center justify-center h-[100dvh] w-screen">
		<div class="h-96 w-96">
			<DeformedCircleVisualizer wavInput={wavStreamPlayer} startHue={150} endHue={220} />
		</div>
	</div>
{:else if shownVisualizer === 'innerglow'}
	<div class="absolute h-[100dvh] w-screen gap-16">
		<InnerGlowVisualizer
			wavInput={wavStreamPlayer}
			sideVisible={0}
			deformation={50}
			startHue={150}
			endHue={220}
		/>
	</div>

	<div class="absolute h-[100dvh] w-screen gap-16">
		<InnerGlowVisualizer
			wavInput={wavRecorder}
			sideVisible={0}
			deformation={50}
			startHue={0}
			endHue={50}
		/>
	</div>
{/if}

<div
	class="absolute flex flex-col items-center justify-between h-[100dvh] w-screen py-16 px-4 text-center"
>
	<div
		class="bg-gradient-to-r from-blue-400 via-cyan-400 to-green-400 inline-block text-transparent bg-clip-text font-semibold text-xl max-w-xl"
	>
		{lastAssistantText}
	</div>
	<div class="h-96 w-96"></div>
	<div
		class="bg-gradient-to-r from-red-400 to-amber-400 inline-block text-transparent bg-clip-text font-semibold text-xl max-w-xl"
	>
		{lastUserText}
	</div>
</div>

<Modal
	onStart={() => {
		startConversation();
	}}
	bind:apiKey
/>
