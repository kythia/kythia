/**
 * @namespace: addons/core/commands/utils/kyth/premium/delete.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class DeleteCommand extends BaseCommand {
	slashCommand = (subcommand) =>
		subcommand
			.setName('delete')
			.setDescription('Remove a user from premium')
			.addUserOption((option) =>
				option
					.setName('user')
					.setDescription('User to remove premium from')
					.setRequired(true),
			);

	async execute(interaction) {
		const container = this.container;
		const { t, models, helpers } = container;
		const { KythiaUser } = models;
		const { simpleContainer } = helpers.discord;

		await interaction.deferReply();

		const user = interaction.options.getUser('user');

		const kythiaUser = await KythiaUser.getCache({ userId: user.id });
		if (!kythiaUser?.isPremium) {
			return interaction.editReply(
				await t(interaction, 'core.premium.premium.not.premium'),
			);
		}

		kythiaUser.isPremium = false;
		kythiaUser.premiumExpiresAt = null;
		await kythiaUser.save();

		const msg = await t(interaction, 'core.premium.premium.delete.success', {
			user: `<@${user.id}>`,
		});
		const components = await simpleContainer(interaction, msg, {
			color: 'Red',
		});
		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

exports.default = DeleteCommand;
