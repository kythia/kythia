/**
 * @namespace: addons/core/commands/utils/kyth/leave.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { BaseCommand } = require('kythia-core');
class LeaveCommand extends BaseCommand {
	subcommand = true;
	slashCommand = (subcommand) =>
		subcommand
			.setName('leave')
			.setDescription('Force leave a specific guild by ID.')
			.addStringOption((option) =>
				option
					.setName('guild_id')
					.setDescription('The ID of the guild to leave')
					.setRequired(true)
					.setAutocomplete(true),
			)
			.addStringOption((option) =>
				option
					.setName('except')
					.setDescription(
						'Comma-separated guild IDs to additionally protect from being left (Optional).',
					),
			);
	async execute(interaction) {
		const container = this.container;
		const { t, kythiaConfig, helpers } = container;
		const { simpleContainer } = helpers.discord;
		const { client } = interaction;
		const guildId = interaction.options.getString('guild_id');
		const exceptRaw = interaction.options.getString('except') || '';
		const extraExcept = exceptRaw
			.split(',')
			.map((id) => id.trim())
			.filter(Boolean);
		const SAFE_GUILDS = [
			kythiaConfig.bot.mainGuildId,
			kythiaConfig.bot.devGuildId,
			...extraExcept,
		].filter(Boolean);
		if (SAFE_GUILDS.includes(guildId)) {
			const components = await simpleContainer(
				interaction,
				await t(interaction, 'core.commands.utils.kyth.leave.protected', {
					guildId,
				}),
				{
					color: 'Yellow',
				},
			);
			return interaction.reply({
				components,
				flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
			});
		}
		let guildName = 'Unknown Guild';
		let memberCount = 0;
		let found = false;
		if (client.shard) {
			const results = await client.shard.broadcastEval(
				async (c, context) => {
					const g = await c.container.helpers.discord.getGuildSafe(
						c,
						context.guildId,
					);
					if (g) {
						const gName = g.name;
						const mCount = g.memberCount;
						await g.leave();
						return {
							found: true,
							name: gName,
							members: mCount,
						};
					}
					return {
						found: false,
					};
				},
				{
					context: {
						guildId,
					},
				},
			);
			const successResult = results.find((r) => r.found);
			if (successResult) {
				found = true;
				guildName = successResult.name;
				memberCount = successResult.members;
			}
		} else {
			const guild = await container.helpers.discord.getGuildSafe(
				client,
				guildId,
			);
			if (guild) {
				found = true;
				guildName = guild.name;
				memberCount = guild.memberCount;
				await guild.leave();
			}
		}
		if (!found) {
			const components = await simpleContainer(
				interaction,
				await t(interaction, 'core.commands.utils.kyth.leave.not.found', {
					guildId,
				}),
				{
					color: 'Red',
				},
			);
			return interaction.reply({
				components,
				flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
			});
		}
		const totalServers = client.shard
			? (await client.shard.broadcastEval((c) => c.guilds.cache.size)).reduce(
					(acc, size) => acc + size,
					0,
				)
			: client.guilds.cache.size;
		const desc = await t(
			interaction,
			'core.commands.utils.kyth.leave.success',
			{
				guildName,
				guildId,
				memberCount,
				serverCount: totalServers,
			},
		);
		const components = await simpleContainer(interaction, desc);
		return interaction.reply({
			components,
			flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
		});
	}
}
exports.default = LeaveCommand;
