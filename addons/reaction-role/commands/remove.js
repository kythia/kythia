/**
 * @namespace: addons/reaction-role/commands/remove.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const {
	TextDisplayBuilder,
	ContainerBuilder,
	MessageFlags,
	ChannelType,
} = require('discord.js');

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('remove')
			.setDescription('➖ Remove a reaction role from a message.')
			.addStringOption((option) =>
				option
					.setName('message_id')
					.setDescription('The ID of the message.')
					.setRequired(true),
			)
			.addStringOption((option) =>
				option
					.setName('emoji')
					.setDescription('The emoji to remove.')
					.setRequired(true),
			)
			.addChannelOption((option) =>
				option
					.setName('channel')
					.setDescription(
						'The channel where the message is (defaults to current).',
					)
					.addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
					.setRequired(false),
			),
	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t, models, helpers, logger } = container;
		const { ReactionRole } = models;
		const { convertColor } = helpers.color;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const messageId = interaction.options.getString('message_id');
		const emojiInput = interaction.options.getString('emoji');
		const channel =
			interaction.options.getChannel('channel') || interaction.channel; // Optional, helps with fetching message to remove reaction

		try {
			const deleted = await ReactionRole.destroy({
				where: {
					guildId: interaction.guildId,
					messageId,
					emoji: emojiInput,
				},
			});

			if (!deleted) {
				return interaction.editReply({
					content: await t(interaction, 'reaction-role.not_found'),
				});
			}

			// Try to remove bot's reaction
			try {
				if (channel?.isTextBased()) {
					const message = await channel.messages
						.fetch(messageId)
						.catch(() => null);
					if (message) {
						// Simple check, might need better emoji ID handling
						const botReaction = message.reactions.cache.find((r) => {
							const reactEmoji = r.emoji.id ?? r.emoji.name;
							return (
								reactEmoji === emojiInput ||
								`<:${r.emoji.name}:${r.emoji.id}>` === emojiInput
							);
						});

						if (botReaction) {
							await botReaction.users.remove(interaction.client.user.id);
						}
					}
				}
			} catch (err) {
				logger.warn(`Error: ${err.message || err}`, {
					label: 'reaction-role:remove_reaction',
				});
				// Continue even if we can't remove the reaction
			}

			const successContainer = new ContainerBuilder()
				.setAccentColor(convertColor('Red', { from: 'discord', to: 'decimal' }))
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						`🗑️ **Reaction Role Removed**\n\n` +
							`**Message ID:** ${messageId}\n` +
							`**Emoji:** ${emojiInput}`,
					),
				);

			return interaction.editReply({
				components: [successContainer],
				flags: MessageFlags.IsComponentsV2,
			});
		} catch (error) {
			logger.error(`Error: ${error.message || error}`, {
				label: 'reaction-role:remove',
			});
			return interaction.editReply({
				content: await t(interaction, 'common.error.generic'),
			});
		}
	},
};
