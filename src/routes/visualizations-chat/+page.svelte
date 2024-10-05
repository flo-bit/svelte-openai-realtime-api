<script lang="ts">
	import Realtime from '$lib/realtime/Realtime.svelte';
	import CircleBarVisualizer from '$lib/realtime/visualizations/CircleBarVisualizer.svelte';
	import Modal from '$lib/ui/Modal.svelte';

	import { WavRecorder, WavStreamPlayer } from '$lib/realtime/wavtools';
	import DeformedCircleVisualizer from '$lib/realtime/visualizations/DeformedCircleVisualizer.svelte';
	import InnerGlowVisualizer from '$lib/realtime/visualizations/InnerGlowVisualizer.svelte';
	import CircleCirclesVisualizer from '$lib/realtime/visualizations/CircleCirclesVisualizer.svelte';
	import BarVisualizer from '$lib/realtime/visualizations/BarVisualizer.svelte';

	export let wavRecorder: WavRecorder;
	let wavStreamPlayer: WavStreamPlayer;

	let apiKey = '';

	let startConversation: () => Promise<void>;

	let visualizations = ['circle-bars', 'circle-circles', 'bars', 'deformed-circle', 'innerglow'];

	let current = 0;

	$: shownVisualizer = visualizations[current];
</script>

<button
	class="absolute inset-0 h-[100dvh] w-screen z-10 text-white flex items-end justify-center p-8 text-sm font-semibold"
	on:click={() => {
		current = (current + 1) % visualizations.length;
	}}
>
	<div>click anywhere to switch visualization</div>
</button>

{#if apiKey}
	<Realtime bind:startConversation bind:wavRecorder bind:wavStreamPlayer {apiKey} />
{/if}

{#if shownVisualizer === 'circle-bars'}
	<div
		class="absolute flex flex-col md:flex-row items-center justify-center h-[100dvh] w-screen gap-16"
	>
		<div class="h-64 w-96">
			<CircleBarVisualizer detail={128} wavInput={wavStreamPlayer} startHue={150} endHue={220} />
		</div>

		<div class="h-64 w-96">
			<CircleBarVisualizer detail={128} wavInput={wavRecorder} startHue={0} endHue={50} />
		</div>
	</div>
{:else if shownVisualizer === 'bars'}
	<div
		class="absolute flex flex-col md:flex-row items-center justify-center h-[100dvh] w-screen gap-16"
	>
		<div class="h-64 w-96 -scale-y-100 md:scale-y-100">
			<BarVisualizer barSpacing={8} wavInput={wavStreamPlayer} startHue={150} endHue={220} />
		</div>
		<div class="h-64 w-96">
			<BarVisualizer barSpacing={8} wavInput={wavRecorder} startHue={0} endHue={50} />
		</div>
	</div>
{:else if shownVisualizer === 'circle-circles'}
	<div
		class="absolute flex flex-col md:flex-row items-center justify-center h-[100dvh] w-screen gap-16"
	>
		<div class="h-64 w-96">
			<CircleCirclesVisualizer wavInput={wavStreamPlayer} startHue={150} endHue={220} />
		</div>
		<div class="h-64 w-96">
			<CircleCirclesVisualizer wavInput={wavRecorder} startHue={0} endHue={50} />
		</div>
	</div>
{:else if shownVisualizer === 'deformed-circle'}
	<div
		class="absolute flex flex-col md:flex-row items-center justify-center h-[100dvh] w-screen gap-16"
	>
		<div class="h-96 w-96">
			<DeformedCircleVisualizer wavInput={wavStreamPlayer} startHue={150} endHue={220} />
		</div>
		<div class="h-96 w-96">
			<DeformedCircleVisualizer wavInput={wavRecorder} startHue={0} endHue={50} />
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

<Modal
	onStart={() => {
		startConversation();
	}}
	bind:apiKey
/>
