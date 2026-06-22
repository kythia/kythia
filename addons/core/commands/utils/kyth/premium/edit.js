/**
 * @namespace: addons/core/commands/utils/kyth/premium/edit.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { BaseCommand } = require('kythia-core');
class EditCommand extends BaseCommand {
	slashCommand = (subcommand) =>
		subcommand
			.setName('edit')
			.setDescription('Edit a premium user')
			.addUserOption((option) =>
				option
					.setName('user')
					.setDescription('User to edit premium access')
					.setRequired(true),
			);
	async execute(interaction) {
		const container = this.container;
		const { t, models, helpers } = container;
		const { KythiaUser } = models;
		const { simpleContainer } = helpers.discord;
		await interaction.deferReply();
		const user = interaction.options.getUser('user');
		const days = interaction.options.getInteger('days');
		const kythiaUser = await KythiaUser.getCache({
			userId: user.id,
		});
		if (!kythiaUser) {
			return interaction.editReply(
				await t(interaction, 'core.helpers.index.premium.premium.not.premium'),
			);
		}
		const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
		kythiaUser.premiumExpiresAt = expiresAt;
		await kythiaUser.save();
		const msg = await t(
			interaction,
			'core.commands.utils.kyth.premium.edit.premium.success',
			{
				user: `<@${user.id}>`,
				days,
				expires: `<t:${Math.floor(expiresAt.getTime() / 1000)}:R>`,
			},
		);
		const components = await simpleContainer(interaction, msg, {
			color: 'Red',
		});
		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}
exports.default = EditCommand;
