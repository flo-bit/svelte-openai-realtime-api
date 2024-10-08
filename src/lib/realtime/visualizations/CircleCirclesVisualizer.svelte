<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { WavRecorder, WavStreamPlayer } from '../wavtools';
	import { normalizeArray } from './wav_helper';

	let canvas: HTMLCanvasElement;
	let clientCtx: CanvasRenderingContext2D | null = null;
	let isLoaded = false;

	const emptyResult = { values: new Float32Array([0]) };

	export let wavInput: WavRecorder | WavStreamPlayer;

	export let color: string | undefined = undefined;
	export let startHue: number | undefined = undefined;
	export let endHue: number | undefined = undefined;

	export let minRadius: number = 0.15;
	export let maxRadius: number = 0.5;

	export let rotate = 1;

	export let detail = 50;

	export let varyBrightness = false;

	const drawCircularBars = (
		canvas: HTMLCanvasElement,
		ctx: CanvasRenderingContext2D,
		data: Float32Array
	) => {
		const centerX = canvas.width / 2;
		const centerY = canvas.height / 2;
		const points = normalizeArray(data, detail, true);
		const smaller = Math.min(canvas.width, canvas.height);

		const minCircleSize = (Math.PI * 2 * minRadius * smaller) / detail / 2;
		const maxCircleSize = (Math.PI * 2 * maxRadius * smaller) / detail / 2;

		const minCircleHeight = minRadius * smaller;
		const maxCircleHeight = (maxRadius - minRadius) * smaller;
		const hueRange = (endHue ?? 0) - (startHue ?? 0);

		if (color !== undefined) {
			ctx.fillStyle = color;
		}

		for (let i = 0; i < detail; i++) {
			const amplitude = points[i];
			const circleHeight = Math.max(minCircleHeight, amplitude * maxCircleHeight);
			const circleSize = minCircleSize + (maxCircleSize - minCircleSize) * amplitude;
			const angle = (i / detail) * Math.PI * 2 + rotate;

			// Save the current context state
			ctx.save();

			// Translate and rotate the context to position the roundRect
			ctx.translate(centerX, centerY);
			ctx.rotate(angle);

			if (startHue !== undefined && endHue !== undefined) {
				// t goes from 0 to 1, then back to 0 (startHue to endHue back to startHue)
				let t = (i / detail) * 2;
				if (t > 1) {
					t = 2 - t;
				}
				const hue = (startHue ?? 0) + t * hueRange;

				ctx.fillStyle = `hsl(${hue % 360}, 100%, ${varyBrightness ? 100 - Math.pow(amplitude, 0.3) * 50 : 50}%)`;
			}

			ctx.beginPath();
			ctx.ellipse(-circleSize / 2, circleHeight, circleSize / 2, circleSize / 2, 0, 0, Math.PI * 2);
			ctx.fill();
			ctx.translate(-centerX, -centerY);

			ctx.restore();
		}
	};

	const render = () => {
		if (!isLoaded) return;

		if (!canvas) {
			window.requestAnimationFrame(render);
			return;
		}

		clientCtx = clientCtx ?? canvas.getContext('2d');
		if (!clientCtx) {
			window.requestAnimationFrame(render);
			return;
		}
		clientCtx.clearRect(0, 0, canvas.width, canvas.height);

		let result = emptyResult;

		if (wavInput instanceof WavRecorder && wavInput.recording) {
			result = wavInput.getFrequencies('voice');
		} else if (wavInput instanceof WavStreamPlayer && wavInput.analyser) {
			result = wavInput.getFrequencies('voice');
		}

		drawCircularBars(canvas, clientCtx, result.values);

		window.requestAnimationFrame(render);
	};

	onMount(() => {
		isLoaded = true;

		// resize canvas to fit parent
		if (canvas) {
			canvas.width = canvas.offsetWidth * 2;
			canvas.height = canvas.offsetHeight * 2;
		}
		window.addEventListener('resize', () => {
			if (canvas) {
				canvas.width = canvas.offsetWidth * 2;
				canvas.height = canvas.offsetHeight * 2;
			}
		});

		render();
	});

	onDestroy(() => {
		isLoaded = false;
	});

	export let glow = 3;
</script>

<canvas bind:this={canvas} class="w-full h-full filter-blur-circle-circles"></canvas>

{#if glow}
	<svg width="0" height="0">
		<filter id="blur-and-scale-circle-circles" y="-50%" x="-50%" width="200%" height="200%">
			<feGaussianBlur in="SourceGraphic" stdDeviation={glow} result="blurred" />
			<feColorMatrix type="saturate" in="blurred" values="5" />
			<feComposite in="SourceGraphic" operator="over" />
		</filter>
	</svg>

	<style>
		.filter-blur-circle-circles {
			filter: url(#blur-and-scale-circle-circles);
		}
	</style>
{/if}
