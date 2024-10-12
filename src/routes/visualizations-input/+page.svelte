<script lang="ts">
	import BarVisualizer from '$lib/realtime/visualizations/BarVisualizer.svelte';
	import CircleBarVisualizer from '$lib/realtime/visualizations/CircleBarVisualizer.svelte';
	import CircleCirclesVisualizer from '$lib/realtime/visualizations/CircleCirclesVisualizer.svelte';
	import DeformedCircleVisualizer from '$lib/realtime/visualizations/DeformedCircleVisualizer.svelte';
	import IconVisualizer from '$lib/realtime/visualizations/IconVisualizer.svelte';
	import InnerGlowVisualizer from '$lib/realtime/visualizations/InnerGlowVisualizer.svelte';
	import { WavRecorder } from '$lib/realtime/wavtools';

	export let wavRecorder: WavRecorder = new WavRecorder({ sampleRate: 24000 });

	let recording = false;
</script>

<div class="mx-auto px-4 max-w-4xl w-full py-24">
	<button
		type="button"
		on:click={async () => {
			await wavRecorder.begin();

			wavRecorder.record();

			recording = true;
		}}
		class="rounded-full px-5 py-3 text-base font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 text-amber-500 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 {recording
			? 'cursor-not-allowed opacity-50'
			: ''}">start microphone</button
	>

	<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
		<div class="h-64 w-full rounded-xl border border-white/15 p-4">
			<CircleBarVisualizer wavInput={wavRecorder} startHue={0} endHue={50} rotate={2} />
		</div>
		<div class="h-64 w-full rounded-xl border border-white/15 p-4">
			<BarVisualizer barSpacing={8} wavInput={wavRecorder} startHue={0} endHue={50} />
		</div>
		<div class="h-64 w-full rounded-xl border border-white/15 p-4">
			<CircleCirclesVisualizer wavInput={wavRecorder} startHue={0} endHue={50} />
		</div>
		<div class="h-64 w-full rounded-xl border border-white/15 p-4">
			<DeformedCircleVisualizer wavInput={wavRecorder} startHue={0} endHue={50} />
		</div>
		<div class="h-64 w-full rounded-xl border border-white/15 overflow-hidden">
			<InnerGlowVisualizer wavInput={wavRecorder} startHue={0} endHue={50} />
		</div>
		<div
			class="h-64 w-full rounded-xl border border-white/15 overflow-hidden flex items-center justify-center gap-4"
		>
			<div class="size-12">
				<IconVisualizer wavInput={wavRecorder} />
			</div>
			<div class="size-12">
				<IconVisualizer wavInput={wavRecorder} icon="speaker" />
			</div>
		</div>
	</div>
</div>
