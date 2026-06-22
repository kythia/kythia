/**
 * @namespace: addons/core/commands/utils/kyth/blacklist/guild-remove.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { BaseCommand } = require('kythia-core');
class GuildRemoveCommand extends BaseCommand {
	subcommand = true;
	slashCommand = (subcommand) =>
		subcommand
			.setName('guild-remove')
			.setDescription('Remove a guild from the blacklist')
			.addStringOption((option) =>
				option
					.setName('guild_id')
					.setDescription('Guild ID to remove from blacklist')
					.setRequired(true),
			);
	async execute(interaction) {
		const container = this.container;
		const { t, models, logger, helpers } = container;
		const { KythiaBlacklist } = models;
		const { createContainer } = helpers.discord;
		await interaction.deferReply();
		const guildId = interaction.options.getString('guild_id');
		try {
			const existing = await KythiaBlacklist.getCache({
				where: {
					type: 'guild',
					targetId: guildId,
				},
			});
			if (!existing) {
				const components = await createContainer(interaction, {
					description: await t(
						interaction,
						'core.commands.utils.kyth.blacklist.guild-remove.guild.remove.not.found',
						{
							id: guildId,
						},
					),
					color: 'Red',
				});
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
			await KythiaBlacklist.destroy({
				where: {
					type: 'guild',
					targetId: guildId,
				},
			});
			const components = await createContainer(interaction, {
				title: await t(
					interaction,
					'core.commands.utils.kyth.blacklist.guild-remove.guild.remove.title',
				),
				description: await t(
					interaction,
					'core.commands.utils.kyth.blacklist.guild-remove.guild.remove.success',
					{
						id: guildId,
					},
				),
				color: 'Green',
			});
			await interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
			logger.info(
				`Guild ${guildId} removed from blacklist by ${interaction.user.tag}`,
				{
					label: 'core',
				},
			);
		} catch (error) {
			logger.error(
				`Failed to remove guild from blacklist: ${error.message || error}`,
				{
					label: 'core',
				},
			);
			const components = await createContainer(interaction, {
				description: await t(
					interaction,
					'core.commands.utils.kyth.blacklist.guild-remove.guild.remove.error',
					{
						error: error.message,
					},
				),
				color: 'Red',
			});
			await interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
	}
}
exports.default = GuildRemoveCommand;
