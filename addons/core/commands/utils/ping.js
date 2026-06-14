/**
 * @namespace: addons/core/commands/utils/ping.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	MessageFlags,
	SeparatorBuilder,
	ContainerBuilder,
	TextDisplayBuilder,
	SlashCommandBuilder,
	SeparatorSpacingSize,
} = require('discord.js');

const { BaseCommand } = require('kythia-core');

// Helpers extracted to addons/core/helpers/ping.js

class PingCommand extends BaseCommand {
	slashCommand = new SlashCommandBuilder()
		.setName('ping')
		.setDescription(
			"🔍 Checks the bot's, Discord API's, database and cache/redis connection speed.",
		);

	aliases = ['p', 'pong', '🏓'];

	async execute(interaction) {
		const container = this.container;
		const { t, kythiaConfig, helpers } = container;
		const { convertColor } = helpers.color;

		const start = Date.now();
		await interaction.deferReply();

		const deferTime = Date.now() - start;
		const timestampDiff = Math.max(
			0,
			Date.now() - interaction.createdTimestamp,
		);

		// If deferTime > 5ms, it's a real REST API call (Slash Command). We use this to bypass Discord's interaction queue delay.
		// If < 5ms, it was mocked locally (Prefix Command), so we use the standard timestamp diff.
		const botLatency = deferTime > 5 ? deferTime : timestampDiff;

		const apiLatency = Math.round(interaction.client.ws.ping);

		const [lavalinkNodes, dbPingInfo, redisNodes] = await Promise.all([
			helpers.core.ping.getLavalinkNodesPings(interaction.client),
			helpers.core.ping.getDbPing(container),
			helpers.core.ping.getRedisPings(container),
		]);

		const embedContainer = new ContainerBuilder().setAccentColor(
			convertColor(kythiaConfig.bot.color, { from: 'hex', to: 'decimal' }),
		);

		embedContainer.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				await t(interaction, 'core.utils.ping.embed.title'),
			),
		);
		embedContainer.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(true),
		);

		embedContainer.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				`**${await t(interaction, 'core.utils.ping.field.bot.latency')}**\n\`\`\`${botLatency}ms\`\`\``,
			),
		);
		embedContainer.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				`**${await t(interaction, 'core.utils.ping.field.api.latency')}**\n\`\`\`${apiLatency}ms\`\`\``,
			),
		);
		embedContainer.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				`**Shard**\n\`\`\`#${interaction.guild?.shardId ?? 0}\`\`\``,
			),
		);
		embedContainer.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				`**${await t(interaction, 'core.utils.ping.field.db.latency')}**\n\`\`\`${
					dbPingInfo.status === 'connected'
						? `${dbPingInfo.ping}ms`
						: dbPingInfo.status === 'not_configured'
							? 'Not Configured'
							: dbPingInfo.status === 'error'
								? 'Error'
								: 'Unknown'
				}\`\`\`` +
					(dbPingInfo.status === 'error' && dbPingInfo.error
						? `\n\`\`\`Error: ${dbPingInfo.error}\`\`\``
						: ''),
			),
		);

		if (redisNodes.length > 0) {
			embedContainer.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					`**${await t(interaction, 'core.utils.ping.field.redis.nodes')}**`,
				),
			);
			for (const node of redisNodes) {
				let statusEmoji = '❓';
				let pingText = 'N/A';
				if (node.status === 'active') {
					statusEmoji = '`✅`';
					if (node.ping === -2) pingText = 'Ping Failed';
					else if (node.ping === -1) pingText = 'Pinging...';
					else pingText = `${node.ping}ms`;
				} else if (node.status === 'standby') {
					statusEmoji = '`⚪`';
					pingText = 'Standby';
				} else if (node.status === 'failed') {
					statusEmoji = '`❌`';
					pingText = 'Failed';
				}
				embedContainer.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						`${statusEmoji} **${node.name}**\n\`\`\`${pingText}\`\`\``,
					),
				);
			}
		}

		if (lavalinkNodes.length > 0) {
			embedContainer.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			);
			embedContainer.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					`**${await t(interaction, 'core.utils.ping.field.lavalink.nodes')}**`,
				),
			);
			for (const node of lavalinkNodes) {
				let statusEmoji = '❓';
				let pingText = 'N/A';
				if (node.status === 'operational') {
					statusEmoji = '`🟢`';
					pingText = `${node.ping}ms`;
				} else if (node.status === 'no_stats') {
					statusEmoji = '`🟡`';
					pingText = 'Stats OK, Ping Data Missing';
				} else if (node.status === 'disconnected') {
					statusEmoji = '`🔴`';
					pingText = 'Disconnected';
				} else if (node.status === 'error') {
					statusEmoji = '`❌`';
					pingText = 'Error';
				}
				const playersText =
					node.players > 0 ? ` (${node.players} players)` : '';
				embedContainer.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						`${statusEmoji} **${node.name}**\n\`\`\`${pingText}${playersText}\`\`\``,
					),
				);
			}
		}

		embedContainer.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(true),
		);
		embedContainer.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				await t(interaction, 'common.container.footer', {
					username: interaction.client.user.username,
				}),
			),
		);

		await interaction.editReply({
			components: [embedContainer],
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

exports.default = PingCommand;
