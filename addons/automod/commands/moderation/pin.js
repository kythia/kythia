/**
 * @namespace: addons/automod/commands/moderation/pin.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags, PermissionFlagsBits } = require('discord.js');
const { BaseCommand } = require('kythia-core');
class PinCommand extends BaseCommand {
	permissions = PermissionFlagsBits.ManageMessages;
	botPermissions = PermissionFlagsBits.ManageMessages;
	slashCommand = (subcommand) =>
		subcommand
			.setName('pin')
			.setDescription('📌 Pins a message in the channel.')
			.addStringOption((option) =>
				option
					.setName('message_id')
					.setDescription('The ID of the message to pin')
					.setRequired(true),
			);
	async execute(interaction) {
		const container = this.container;
		const { t, helpers, kythiaConfig } = container;
		const { createContainer, simpleContainer } = helpers.discord;
		await interaction.deferReply();
		const messageId = interaction.options.getString('message_id');
		try {
			const message = await helpers.discord.getMessageSafe(
				interaction.channel,
				messageId,
			);
			if (!message) {
				const reply = await simpleContainer(
					interaction,
					await t(interaction, 'core.moderation.pin.not.found'),
					{
						color: 'Red',
					},
				);
				return interaction.editReply({
					components: reply,
					flags: MessageFlags.IsComponentsV2,
				});
			}
			if (message.pinned) {
				const reply = await simpleContainer(
					interaction,
					await t(interaction, 'core.moderation.pin.already.pinned'),
					{
						color: 'Red',
					},
				);
				return interaction.editReply({
					components: reply,
					flags: MessageFlags.IsComponentsV2,
				});
			}
			await message.pin();
			const reply = await createContainer(interaction, {
				color: kythiaConfig.bot.color,
				title: await t(interaction, 'core.moderation.pin.success.title'),
				description: await t(interaction, 'core.moderation.pin.success.desc', {
					messageUrl: message.url,
				}),
				thumbnail: interaction.guild.iconURL(),
			});
			return interaction.editReply({
				components: reply,
				flags: MessageFlags.IsComponentsV2,
			});
		} catch (error) {
			const reply = await simpleContainer(
				interaction,
				await t(interaction, 'core.moderation.pin.failed', {
					error: error.message,
				}),
				{
					color: 'Red',
				},
			);
			return interaction.editReply({
				components: reply,
				flags: MessageFlags.IsComponentsV2,
			});
		}
	}
}
exports.default = PinCommand;
