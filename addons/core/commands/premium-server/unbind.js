/**
 * @namespace: addons/core/commands/premium-server/unbind.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class UnbindCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('unbind')
			.setDescription('Unbind your Premium tier from a server.')
			.addStringOption((option) =>
				option
					.setName('server_id')
					.setDescription(
						'The ID of the server (leave empty to unbind current server)',
					)
					.setRequired(false),
			);

	async execute(interaction) {
		const container = this.container;
		const { helpers, models, translator } = container;
		const { simpleContainer } = helpers.discord;
		const { PremiumServerBind } = models;
		const t = translator.t.bind(translator);

		const targetGuildId =
			interaction.options.getString('server_id') || interaction.guildId;
		const userId = interaction.user.id;

		if (!targetGuildId) {
			const components = await simpleContainer(
				interaction,
				await t(interaction, 'core.premium_server.no_server_id'),
				{ color: 'Red' },
			);
			return interaction.reply({
				components,
				flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
			});
		}

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const bind = await PremiumServerBind.getCache({
			guildId: targetGuildId,
			userId,
		});
		if (!bind) {
			const components = await simpleContainer(
				interaction,
				await t(interaction, 'core.premium_server.unbind.not_bound_self'),
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		await bind.destroy();

		const components = await simpleContainer(
			interaction,
			await t(interaction, 'core.premium_server.unbind.success', {
				guildId: targetGuildId,
			}),
			{ color: 'Green' },
		);
		return interaction.editReply({ components });
	}
}

exports.default = UnbindCommand;
