/**
 * @namespace: addons/core/commands/utils/kyth/blacklist/guild-list.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class GuildListCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('guild-list')
			.setDescription('List all blacklisted guilds');

	async execute(interaction) {
		const container = this.container;
		const { t, models, logger, helpers } = container;
		const { KythiaBlacklist } = models;
		const { createContainer } = helpers.discord;

		await interaction.deferReply();

		try {
			const entries = await KythiaBlacklist.getAllCache({
				where: { type: 'guild' },
			});

			if (entries.length === 0) {
				const components = await createContainer(interaction, {
					description: await t(
						interaction,
						'core.utils.kyth.blacklist.guild.list.empty',
					),
					color: 'Blurple',
				});
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}

			const noReason = await t(
				interaction,
				'core.utils.kyth.blacklist.no.reason',
			);
			const rows = await Promise.all(
				entries.map(async (entry) =>
					t(interaction, 'core.utils.kyth.blacklist.guild.list.row', {
						id: entry.targetId,
						reason: entry.reason || noReason,
					}),
				),
			);

			const description =
				(await t(interaction, 'core.utils.kyth.blacklist.guild.list.total', {
					count: entries.length,
				})) +
				'\n\n' +
				rows.join('\n\n');

			const components = await createContainer(interaction, {
				title: await t(
					interaction,
					'core.utils.kyth.blacklist.guild.list.title',
				),
				description,
				color: 'Blurple',
			});
			await interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
			logger.info(`Guild blacklist viewed by ${interaction.user.tag}`, {
				label: 'core',
			});
		} catch (error) {
			logger.error(
				`Failed to list blacklisted guilds: ${error.message || error}`,
				{
					label: 'core',
				},
			);
			const components = await createContainer(interaction, {
				description: await t(
					interaction,
					'core.utils.kyth.blacklist.guild.list.error',
					{ error: error.message },
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

exports.default = GuildListCommand;
