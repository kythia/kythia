/**
 * @namespace: addons/core/commands/utils/kyth/premium/info.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { MessageFlags } = require('discord.js');
const { BaseCommand } = require('kythia-core');
class InfoCommand extends BaseCommand {
	slashCommand = (subcommand) =>
		subcommand
			.setName('info')
			.setDescription('View premium info for a user')
			.addUserOption((option) =>
				option
					.setName('user')
					.setDescription('User to check')
					.setRequired(true),
			);
	async execute(interaction) {
		const container = this.container;
		const { t, kythiaConfig, helpers, models } = container;
		const { createContainer } = helpers.discord;
		const { KythiaUser } = models;
		await interaction.deferReply();
		const user = interaction.options.getUser('user');
		const kythiaUser = await KythiaUser.getCache({
			userId: user.id,
		});
		if (
			!kythiaUser?.isPremium ||
			new Date(kythiaUser.premiumExpiresAt) < new Date()
		) {
			const components = await createContainer(interaction, {
				description: await t(
					interaction,
					'core.commands.utils.kyth.premium.info.premium.not.active',
					{
						user: `<@${user.id}>`,
					},
				),
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		const description =
			`**${await t(interaction, 'core.commands.utils.kyth.premium.info.premium.field.user')}:** <@${user.id}> (${user.id})\n` +
			`**${await t(interaction, 'core.commands.utils.kyth.premium.info.premium.field.status')}:** ${kythiaUser.isPremium ? await t(interaction, 'core.commands.utils.kyth.premium.info.premium.status.active') : await t(interaction, 'core.commands.utils.kyth.premium.info.premium.status.inactive')}\n` +
			`**${await t(interaction, 'core.commands.utils.kyth.premium.info.premium.field.expires')}:** <t:${Math.floor(new Date(kythiaUser.premiumExpiresAt).getTime() / 1000)}:F>`;
		const components = await createContainer(interaction, {
			title: await t(
				interaction,
				'core.commands.utils.kyth.premium.info.premium.title',
				{
					tag: user.tag,
				},
			),
			description,
			color: kythiaConfig.bot.color,
		});
		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}
exports.default = InfoCommand;
