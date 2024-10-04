import { WebSocketServer } from 'ws';
import { RealtimeClient } from '@openai/realtime-api-beta';
import { loadEnv } from 'vite';

export const realtimeWebSocketServer = {
	name: 'realtimeWebSocketServer',
	configureServer(server) {
		console.log('Configuring WebSocket Server...');
		if (!server.httpServer) return;

		const wss = new WebSocketServer({ noServer: true });

		server.httpServer.on('upgrade', (request, socket, head) => {
			// if starts with /api/chat, then upgrade the connection
			if (request.url?.startsWith('/api/realtime')) {
				wss.handleUpgrade(request, socket, head, (ws) => {
					wss.emit('connection', ws, request);
				});
			}
		});

		wss.on('connection', async (ws) => {
			const env = loadEnv(process.env.NODE_ENV, process.cwd(), '');

			const apiKey = env.OPENAI_API_KEY ?? 'your-fallback-api-key';
			console.log(`Connecting with key "${apiKey.slice(0, 10)}..."`);

			const messageQueue = [];

			const client = new RealtimeClient({ apiKey });

			const messageHandler = (data) => {
				try {
					const event = JSON.parse(data);
					console.log(`Relaying "${event.type}" to OpenAI`);
					client.realtime.send(event.type, event);
				} catch (e) {
					console.error(e.message);
					console.log(`Error parsing event from client: ${data}`);
				}
			};

			client.realtime.on('server.*', (event) => {
				console.log(`Relaying "${event.type}" to Client`);
				ws.send(JSON.stringify(event));
			});

			client.realtime.on('close', () => ws.close());

			ws.on('message', (data) => {
				if (!client.isConnected()) {
					messageQueue.push(data);
				} else {
					messageHandler(data);
				}
			});

			ws.on('close', () => client.disconnect());

			try {
				console.log('Connecting to OpenAI...');
				await client.connect();
				console.log('Connected to OpenAI successfully!');
			} catch (e) {
				console.log(`Error connecting to OpenAI: ${e.message}`);
				ws.close();
			}
			while (messageQueue.length) {
				messageHandler(messageQueue.shift());
			}
		});
	}
};
