/**
 * @namespace: addons/globalvoice/utils/VoiceClient.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const WebSocket = require('ws');
const { EventEmitter } = require('node:events');

class KythiaRelayClient extends EventEmitter {
	constructor(container, url, botName, apiKey) {
		super();
		this.container = container;
		this.url = url;
		this.botName = botName;
		this.apiKey = apiKey;
		this.ws = null;
		this.roomId = null;
		this.logger = container.logger;
	}

	connect() {
		const headers = {};
		if (this.apiKey) {
			headers.Authorization = `Bearer ${this.apiKey}`;
		}

		this.ws = new WebSocket(this.url, { headers });

		this.ws.on('open', () => {
			this.logger.info(`Relay Connected to Core at ${this.url}`, {
				label: 'globalvoice:VoiceClient',
			});
			this.emit('ready');
		});

		this.ws.on('message', (data, isBinary) => {
			if (isBinary) {
				this.emit('audio', data);
			} else {
				this.logger.info(`Relay Msg: ${data.toString()}`, {
					label: 'globalvoice:VoiceClient',
				});
			}
		});

		this.ws.on('error', (err) =>
			this.logger.error(`Relay Error: ${err.message || err}`, {
				label: 'globalvoice:VoiceClient',
			}),
		);
		this.ws.on('close', () => {
			this.logger.info('Relay Disconnected. Reconnecting...', {
				label: 'globalvoice:VoiceClient',
			});

			setTimeout(() => {
				this.connect();

				this.retryDelay = Math.min((this.retryDelay || 1000) * 2, 30000);
			}, this.retryDelay || 1000);
		});
	}

	join(roomId) {
		this.roomId = roomId;
		const payload = {
			op: 'join',
			d: { room_id: roomId },
		};
		this.sendJson(payload);
	}

	sendJson(data) {
		if (this.ws?.readyState === WebSocket.OPEN) {
			this.ws.send(JSON.stringify(data));
		}
	}

	broadcastAudio(buffer) {
		if (this.ws?.readyState === WebSocket.OPEN) {
			this.ws.send(buffer);
		}
	}
}

module.exports = KythiaRelayClient;
