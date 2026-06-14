/**
 * @namespace: addons/automod/commands/moderation/unpin.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { PermissionFlagsBits, MessageFlags } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class UnpinCommand extends BaseCommand {
	slashCommand = (subcommand) =>
		subcommand
			.setName('unpin')
			.setDescription('📌 Unpins a message from the channel.')
			.addStringOption((option) =>
				option
					.setName('message_id')
					.setDescription('The ID of the message to unpin')
					.setRequired(true),
			);

	permissions = PermissionFlagsBits.ManageMessages;
	botPermissions = PermissionFlagsBits.ManageMessages;

	async execute(interaction) {
		const container = this.container;
		const { t, helpers, kythiaConfig } = container;
		const { createContainer, simpleContainer } = helpers.discord;

		await interaction.deferReply();

		const messageId = interaction.options.getString('message_id');

		try {
			const message = await interaction.channel.messages.fetch(messageId);
			if (!message) {
				const reply = await simpleContainer(
					interaction,
					await t(interaction, 'core.moderation.unpin.not.found'),
					{ color: 'Red' },
				);
				return interaction.editReply({
					components: reply,
					flags: MessageFlags.IsComponentsV2,
				});
			}

			if (!message.pinned) {
				const reply = await simpleContainer(
					interaction,
					await t(interaction, 'core.moderation.unpin.not.pinned'),
					{ color: 'Red' },
				);
				return interaction.editReply({
					components: reply,
					flags: MessageFlags.IsComponentsV2,
				});
			}

			await message.unpin();

			const reply = await createContainer(interaction, {
				color: kythiaConfig.bot.color,
				title: await t(interaction, 'core.moderation.unpin.success.title'),
				description: await t(
					interaction,
					'core.moderation.unpin.success.desc',
					{
						messageUrl: message.url,
					},
				),
				thumbnail: interaction.guild.iconURL(),
			});
			return interaction.editReply({
				components: reply,
				flags: MessageFlags.IsComponentsV2,
			});
		} catch (error) {
			const reply = await simpleContainer(
				interaction,
				await t(interaction, 'core.moderation.unpin.failed', {
					error: error.message,
				}),
				{ color: 'Red' },
			);
			return interaction.editReply({
				components: reply,
				flags: MessageFlags.IsComponentsV2,
			});
		}
	}
}

exports.default = UnpinCommand;
