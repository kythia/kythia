/**
 * @namespace: addons/globalvoice/commands/connect.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	StreamType,
	EndBehaviorType,
	joinVoiceChannel,
	AudioPlayerStatus,
	createAudioPlayer,
	createAudioResource,
} = require('@discordjs/voice');

const { MessageFlags } = require('discord.js');

const { PassThrough } = require('node:stream');
const KythiaRelayClient = require('../utils/VoiceClient');

const nexusInstances = new Map();

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('connect')
			.setDescription('Connect to a global voice room or create a room')
			.addStringOption((option) =>
				option.setName('room').setDescription('Room ID').setRequired(true),
			),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t, helpers, kythiaConfig, logger } = container;
		const { simpleContainer } = helpers.discord;

		await interaction.deferReply();

		const channel = interaction.member.voice.channel;
		if (!channel) {
			const msg = await t(interaction, 'globalvoice.connect.not.in.vc');
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const roomId = interaction.options.getString('room');

		const connection = joinVoiceChannel({
			channelId: channel.id,
			guildId: channel.guild.id,
			adapterCreator: channel.guild.voiceAdapterCreator,
			selfDeaf: false,
			selfMute: false,
		});

		let nexus = nexusInstances.get(interaction.guildId);
		if (!nexus) {
			const apiUrl = kythiaConfig.addons.globalvoice.apiUrl;
			const apiKey = kythiaConfig.addons.globalvoice.apiKey;
			nexus = new KythiaRelayClient(container, apiUrl, 'Kythia', apiKey);

			nexus.connect();
			nexusInstances.set(interaction.guildId, nexus);
		}

		nexus.removeAllListeners('ready');
		nexus.removeAllListeners('audio');
		connection.receiver.speaking.removeAllListeners('start');

		nexus.on('ready', async () => {
			nexus.join(roomId);
			const msg = await t(interaction, 'globalvoice.connect.success', {
				roomId,
			});
			const components = await simpleContainer(interaction, msg, {
				color: 'Green',
			});
			await interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		});

		const speakingUsers = new Set();

		connection.receiver.speaking.on('start', (userId) => {
			if (speakingUsers.has(userId)) return;
			speakingUsers.add(userId);

			const audioStream = connection.receiver.subscribe(userId, {
				end: { behavior: EndBehaviorType.AfterSilence, duration: 100 },
			});

			audioStream.on('data', (chunk) => {
				nexus.broadcastAudio(chunk);
			});

			audioStream.on('end', () => {
				speakingUsers.delete(userId);
			});

			audioStream.on('error', (err) => {
				logger.error(`: ${err.message || err}`, {
					label: 'globalvoice:connect',
				});
				speakingUsers.delete(userId);
			});
		});

		const player = createAudioPlayer();
		connection.subscribe(player);

		let audioPassthrough = null;

		function playStream() {
			if (audioPassthrough) {
				audioPassthrough.destroy();
			}

			audioPassthrough = new PassThrough({ highWaterMark: 12 });

			audioPassthrough.on('error', (err) => {
				if (err.code === 'ERR_STREAM_DESTROYED') return;
				logger.error(`Error: ${err.message || err}`, {
					label: 'globalvoice:connect:stream error',
				});
			});

			const resource = createAudioResource(audioPassthrough, {
				inputType: StreamType.Opus,
			});

			try {
				player.play(resource);
			} catch (error) {
				logger.error(`Error: ${error.message || error}`, {
					label: 'globalvoice:connect:player play error',
				});

				setTimeout(playStream, 1000);
			}
		}

		playStream();

		player.on(AudioPlayerStatus.Idle, () => {
			playStream();
		});

		player.on('error', (error) => {
			logger.error(`Error: ${error.message || error}`, {
				label: 'globalvoice:connect:player error',
			});
			playStream();
		});

		nexus.on('audio', (buffer) => {
			if (
				audioPassthrough &&
				!audioPassthrough.destroyed &&
				audioPassthrough.writable
			) {
				audioPassthrough.write(buffer);
			}
		});

		process.on('warning', (e) => {
			if (e.name === 'TimeoutNegativeWarning') return;
		});

		if (nexus.ws?.readyState === 1) {
			nexus.join(roomId);
			const msg = await t(interaction, 'globalvoice.connect.success', {
				roomId,
			});
			const components = await simpleContainer(interaction, msg, {
				color: 'Green',
			});
			await interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
	},
};
