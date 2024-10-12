<script lang="ts">
	import { WavRecorder, WavStreamPlayer } from '$lib/realtime/wavtools/index.js';
	import { RealtimeClient } from '@openai/realtime-api-beta';
	import type { ItemType } from '@openai/realtime-api-beta/dist/lib/client';

	import { onDestroy, onMount } from 'svelte';

	export let turnDetection: 'server_vad' | 'none' = 'server_vad';
	export let apiKey: string = '';
	export let useRelayServer: boolean = false;
	export let relayServer: string = '';

	export let instructions: string = 'You are a great, upbeat friend. Speak fast.';

	export let voice: 'alloy' | 'echo' | 'shimmer' = 'shimmer';

	/**
	 * Type for all event logs
	 */
	interface RealtimeEvent {
		time: string;
		source: 'client' | 'server';
		count?: number;
		event: { [key: string]: any };
	}

	export let client: RealtimeClient | undefined = undefined;
	export let wavRecorder: WavRecorder = new WavRecorder({ sampleRate: 24000 });
	export let wavStreamPlayer: WavStreamPlayer = new WavStreamPlayer({ sampleRate: 24000 });

	let startTime = '';

	export let isConnected = false;
	export let isRecording = false;

	export let canPushToTalk = true;

	export let items: ItemType[] = [];
	export let realtimeEvents: RealtimeEvent[] = [];

	async function setupClient() {
		console.log('setting up client');

		client = new RealtimeClient(
			useRelayServer
				? { url: relayServer }
				: {
						apiKey,
						dangerouslyAllowAPIKeyInBrowser: true
					}
		);

		// Can set parameters ahead of connecting, either separately or all at once
		client.updateSession({ instructions });
		client.updateSession({ voice });
		client.updateSession({
			input_audio_transcription: { model: 'whisper-1' }
		});

		client.on('realtime.event', (realtimeEvent: RealtimeEvent) => {
			const lastEvent = realtimeEvents[realtimeEvents.length - 1];
			if (lastEvent?.event.type === realtimeEvent.event.type) {
				// if we receive multiple events in a row, aggregate them for display purposes
				lastEvent.count = (lastEvent.count || 0) + 1;
				realtimeEvents = realtimeEvents.slice(0, -1).concat(lastEvent);
			} else {
				realtimeEvents = realtimeEvents.concat(realtimeEvent);
			}
		});
		client.on('error', (event: any) => console.error(event));
		client.on('conversation.interrupted', async () => {
			console.log('conversation interrupted');
			const trackSampleOffset = await wavStreamPlayer.interrupt();
			if (trackSampleOffset?.trackId) {
				const { trackId, offset } = trackSampleOffset;
				await client?.cancelResponse(trackId, offset);
			}
		});
		client.on('conversation.updated', async ({ item, delta }: any) => {
			const newItems = client?.conversation.getItems();
			if (delta?.audio) {
				wavStreamPlayer.add16BitPCM(delta.audio, item.id);
			}
			if (item.status === 'completed' && item.formatted.audio?.length) {
				const wavFile = await WavRecorder.decode(item.formatted.audio, 24000, 24000);
				item.formatted.file = wavFile;
			}

			if (newItems) items = newItems;
		});
	}

	export async function startConversation(sendHello: boolean = true) {
		console.log('starting conversation');

		// Set state variables
		startTime = new Date().toISOString();

		isConnected = true;

		realtimeEvents = [];
		items = [];

		// Connect to microphone
		await wavRecorder.begin();

		// Connect to audio output
		await wavStreamPlayer.connect();

		// Connect to realtime API
		await client?.connect();

		if (sendHello) {
			console.log('sending user message');
			client?.sendUserMessageContent([
				{
					type: `input_text`,
					text: `Hello!`
					// text: `For testing purposes, I want you to list ten car brands. Number each item, e.g. "one (or whatever number you are on): the item name".`
				}
			]);
		}

		if (client?.getTurnDetectionType() === 'server_vad') {
			await wavRecorder.record((data) => client?.appendInputAudio(data.mono));
		}
	}

	export async function endConversation() {
		isConnected = false;
		realtimeEvents = [];
		items = [];

		try {
			client?.disconnect();

			await wavRecorder.end();

			await wavStreamPlayer.interrupt();
		} catch (e) {
			console.warn(e);
		}
	}

	/**
	 * In push-to-talk mode, start recording
	 * .appendInputAudio() for each sample
	 */
	export async function startRecording() {
		if (!canPushToTalk) {
			console.error('cannot start recording, if not in push-to-talk mode');
			return;
		}

		isRecording = true;

		const trackSampleOffset = await wavStreamPlayer.interrupt();
		if (trackSampleOffset?.trackId) {
			const { trackId, offset } = trackSampleOffset;
			await client?.cancelResponse(trackId, offset);
		}
		await wavRecorder.record((data) => client?.appendInputAudio(data.mono));
	}

	/**
	 * In push-to-talk mode, stop recording
	 */
	export const stopRecording = async () => {
		if (!canPushToTalk) {
			console.error('cannot stop recording, if not in push-to-talk mode');
			return;
		}

		isRecording = false;

		await wavRecorder.pause();
		client?.createResponse();
	};

	$: if (turnDetection && client) {
		changeTurnEndType(turnDetection);
	}

	const changeTurnEndType = async (value: 'none' | 'server_vad') => {
		console.log('setting turn detection to', value);
		if (value === 'none' && wavRecorder.getStatus() === 'recording') {
			await wavRecorder.pause();
		}
		client?.updateSession({
			turn_detection: value === 'none' ? null : { type: 'server_vad' }
		});
		if (value === 'server_vad' && client?.isConnected()) {
			await wavRecorder.record((data) => client?.appendInputAudio(data.mono));
		}

		canPushToTalk = value === 'none';
	};

	onMount(() => {
		if (useRelayServer && !relayServer) {
			relayServer = `ws://${window.location.host}/api/realtime`;
		}
		setupClient();
	});

	onDestroy(() => {
		endConversation();
	});
</script>
