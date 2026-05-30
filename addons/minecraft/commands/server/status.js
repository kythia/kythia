/**
 * @namespace: addons/minecraft/commands/server/status.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	MessageFlags,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
	ContainerBuilder,
	SeparatorBuilder,
	TextDisplayBuilder,
	SeparatorSpacingSize,
} = require('discord.js');
const axios = require('axios');

const HOST_REGEX = /^[a-zA-Z0-9._-]+(:\d{1,5})?$/;

/**
 * Parse host string into { host, port } — port defaults to 25565 for Java.
 */
function parseAddress(raw) {
	const parts = raw.split(':');
	const host = parts[0];
	const port = parts[1] ? parseInt(parts[1], 10) : 25565;
	return { host, port };
}

/**
 * Fetch server status from mcsrvstat.us API v3.
 * @param {string} host
 * @param {number} port
 * @param {'java'|'bedrock'} type
 */
async function fetchServerStatus(host, port, type = 'java') {
	const endpoint = type === 'bedrock' ? 'bedrock/3' : '3';
	const url = `https://api.mcsrvstat.us/${endpoint}/${host}:${port}`;
	const res = await axios.get(url, { timeout: 10_000 });
	return res.data;
}

/**
 * Build the components array for the server status display.
 */
async function buildStatusComponents(
	interaction,
	data,
	host,
	port,
	type,
	t,
	accentColor,
) {
	const isOnline = data.online ?? false;
	const statusEmoji = isOnline ? '🟢' : '🔴';

	const address = `\`${host}:${port}\``;
	const typeLabel =
		type === 'bedrock'
			? await t(interaction, 'minecraft.server.status.type.bedrock')
			: await t(interaction, 'minecraft.server.status.type.java');

	const version =
		isOnline && data.version
			? `\`${data.version}\``
			: await t(interaction, 'minecraft.server.status.unknown');
	const onlinePlayers = isOnline ? (data.players?.online ?? 0) : 0;
	const maxPlayers = isOnline ? (data.players?.max ?? 0) : 0;

	const motd =
		isOnline && data.motd?.clean?.join('\n')
			? `> ${data.motd.clean.join('\n> ')}`
			: null;

	const now = Math.floor(Date.now() / 1000);
	const lastUpdated = await t(
		interaction,
		'minecraft.server.status.last_updated',
		{
			timestamp: `<t:${now}:R>`,
		},
	);

	let bodyText =
		`### ${await t(interaction, 'minecraft.server.status.info_header')}\n` +
		`${await t(interaction, 'minecraft.server.status.field.ip')} ${address}\n` +
		`${await t(interaction, 'minecraft.server.status.field.type')} ${typeLabel}\n` +
		`${await t(interaction, 'minecraft.server.status.field.version')} ${version}\n\n` +
		`### ${await t(interaction, 'minecraft.server.status.players_header')}\n` +
		`${await t(interaction, 'minecraft.server.status.field.online')} \`${onlinePlayers}/${maxPlayers}\``;

	if (motd) {
		bodyText += `\n\n### ${await t(interaction, 'minecraft.server.status.motd_header')}\n${motd}`;
	}

	bodyText += `\n\n${lastUpdated}`;

	// Encode address into customId: mc-r:<type>:<host>:<port>
	const customId = `mc-r:${type}:${host}:${port}`;

	const refreshButton = new ButtonBuilder()
		.setCustomId(customId)
		.setLabel(await t(interaction, 'minecraft.server.status.button.refresh'))
		.setStyle(ButtonStyle.Secondary)
		.setEmoji('🔄');

	const title = `## ${statusEmoji} ${await t(interaction, 'minecraft.server.status.title')}`;

	const serverContainer = new ContainerBuilder()
		.setAccentColor(accentColor)
		.addTextDisplayComponents(new TextDisplayBuilder().setContent(title))
		.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(true),
		)
		.addTextDisplayComponents(new TextDisplayBuilder().setContent(bodyText))
		.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(true),
		)
		.addActionRowComponents(new ActionRowBuilder().addComponents(refreshButton))
		.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(true),
		)
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				await t(interaction, 'common.container.footer', {
					username: interaction.client.user.username,
				}),
			),
		);

	return [serverContainer];
}

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('status')
			.setDescription('Check the status of a Minecraft server')
			.addStringOption((option) =>
				option
					.setName('host')
					.setDescription(
						'Server IP or hostname (e.g. mc.hypixel.net or play.server.net:25565)',
					)
					.setRequired(true),
			)
			.addStringOption((option) =>
				option
					.setName('type')
					.setDescription('Server type (default: Java)')
					.setRequired(false)
					.addChoices(
						{ name: '☕ Java Edition', value: 'java' },
						{ name: '🪨 Bedrock Edition', value: 'bedrock' },
					),
			),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t, kythiaConfig, helpers } = container;

		const rawHost = interaction.options.getString('host').trim();
		const type = interaction.options.getString('type') ?? 'java';

		if (!HOST_REGEX.test(rawHost)) {
			return interaction.reply({
				content: await t(interaction, 'minecraft.server.errors.invalid_host'),
				flags: MessageFlags.Ephemeral,
			});
		}

		await interaction.deferReply();

		const { host, port } = parseAddress(rawHost);
		const accentColor = helpers.color.convertColor(kythiaConfig.bot.color, {
			from: 'hex',
			to: 'decimal',
		});

		let data;
		try {
			data = await fetchServerStatus(host, port, type);
		} catch {
			return interaction.editReply({
				content: await t(interaction, 'minecraft.server.errors.fetch_failed'),
			});
		}

		const components = await buildStatusComponents(
			interaction,
			data,
			host,
			port,
			type,
			t,
			accentColor,
		);

		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	},

	// Export helpers so the button handler can reuse them
	buildStatusComponents,
	fetchServerStatus,
	parseAddress,
};
