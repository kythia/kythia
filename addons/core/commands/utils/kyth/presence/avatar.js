/**
 * @namespace: addons/core/commands/utils/kyth/presence/avatar.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { BaseCommand } = require('kythia-core');
class AvatarCommand extends BaseCommand {
	subcommand = true;
	slashCommand = (subcommand) =>
		subcommand
			.setName('avatar')
			.setDescription('Change bot avatar')
			.addAttachmentOption((option) =>
				option
					.setName('image')
					.setDescription('New avatar image')
					.setRequired(true),
			);
	async execute(interaction) {
		const container = this.container;
		const { t, helpers, logger } = container;
		const { simpleContainer } = helpers.discord;
		await interaction.deferReply();
		try {
			const attachment = interaction.options.getAttachment('image');
			if (!attachment.contentType?.startsWith('image/')) {
				const components = await simpleContainer(
					interaction,
					await t(interaction, 'core.utils.presence.avatar.invalid'),
					{
						color: 'Red',
					},
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
			await interaction.client.user.setAvatar(attachment.url);
			const components = await simpleContainer(
				interaction,
				await t(interaction, 'core.utils.presence.avatar.success'),
				{
					color: 'Green',
				},
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		} catch (error) {
			logger.error(`Error setting avatar: ${error.message || error}`, {
				label: 'presence',
			});
			const components = await simpleContainer(
				interaction,
				await t(interaction, 'core.utils.presence.error', {
					error: error.message,
				}),
				{
					color: 'Red',
				},
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
	}
}
exports.default = AvatarCommand;
