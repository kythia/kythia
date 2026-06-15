/**
 * @namespace: addons/reaction-role/commands/edit.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const {
	ChannelType,
	MessageFlags,
	ContainerBuilder,
	TextDisplayBuilder,
} = require('discord.js');
const { refreshReactionRoleMessage } = require('../helpers/index.js');
const { BaseCommand } = require('kythia-core');
class EditCommand extends BaseCommand {
	subcommand = true;
	slashCommand = (subcommand) =>
		subcommand
			.setName('edit')
			.setDescription('✏️ Edit an existing reaction role on a message.')
			.addStringOption((option) =>
				option
					.setName('message_id')
					.setDescription('The ID of the message with the reaction role.')
					.setRequired(true),
			)
			.addStringOption((option) =>
				option
					.setName('emoji')
					.setDescription('The current emoji of the reaction role to edit.')
					.setRequired(true),
			)
			.addRoleOption((option) =>
				option
					.setName('new_role')
					.setDescription('The new role to assign for this reaction.')
					.setRequired(false),
			)
			.addStringOption((option) =>
				option
					.setName('new_emoji')
					.setDescription('The new emoji to replace the current one.')
					.setRequired(false),
			)
			.addChannelOption((option) =>
				option
					.setName('channel')
					.setDescription(
						'The channel where the message is (defaults to current).',
					)
					.addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
					.setRequired(false),
			);
	async execute(interaction) {
		const container = this.container;
		const { t, models, helpers, logger } = container;
		const { ReactionRole } = models;
		const { convertColor } = helpers.color;
		await interaction.deferReply({
			flags: MessageFlags.Ephemeral,
		});
		const messageId = interaction.options.getString('message_id');
		const currentEmoji = interaction.options.getString('emoji');
		const newRole = interaction.options.getRole('new_role');
		const newEmoji = interaction.options.getString('new_emoji');
		const channel =
			interaction.options.getChannel('channel') || interaction.channel;

		// Must provide at least one thing to edit
		if (!newRole && !newEmoji) {
			return interaction.editReply({
				content: await t(interaction, 'reaction-role.edit.nothing_to_edit'),
			});
		}
		if (!channel?.isTextBased()) {
			return interaction.editReply({
				content: await t(interaction, 'reaction-role.invalid_channel'),
			});
		}
		try {
			// Find the existing reaction role entry
			const rr = await ReactionRole.getCache({
				where: {
					guildId: interaction.guildId,
					messageId,
					emoji: currentEmoji,
				},
			});
			if (!rr) {
				return interaction.editReply({
					content: await t(interaction, 'reaction-role.not_found'),
				});
			}
			let panel = null;
			if (rr.panelId) {
				panel = await models.ReactionRolePanel.findByPk(rr.panelId);
			}

			// Fetch the Discord message so we can swap reactions
			const message = await helpers.discord.getMessageSafe(channel, messageId);
			if (!message) {
				return interaction.editReply({
					content: await t(interaction, 'reaction-role.invalid_message'),
				});
			}
			const emojiChanged = newEmoji && newEmoji !== currentEmoji;
			if (emojiChanged) {
				// Validate the new emoji by reacting
				try {
					const reaction = await message.react(newEmoji);
					if (panel && panel.panelType === 'dropdown') {
						try {
							await reaction.users.remove(interaction.client.user.id);
						} catch (_) {}
					}
				} catch (error) {
					logger.error(`Error: ${error.message || error}`, {
						label: 'reaction-role:edit:react',
					});
					return interaction.editReply({
						content: await t(interaction, 'reaction-role.invalid_emoji'),
					});
				}

				// Remove the old bot reaction (best-effort)
				try {
					const oldReaction = message.reactions.cache.find((r) => {
						const reactEmoji = r.emoji.id ?? r.emoji.name;
						return (
							reactEmoji === currentEmoji ||
							`<:${r.emoji.name}:${r.emoji.id}>` === currentEmoji
						);
					});
					if (oldReaction) {
						await oldReaction.users.remove(interaction.client.user.id);
					}
				} catch (err) {
					logger.warn(`Error: ${err.message || err}`, {
						label: 'reaction-role:edit:remove_old_reaction',
					});
				}
				rr.emoji = newEmoji;
			}
			if (newRole) {
				rr.roleId = newRole.id;
			}

			// Persist the changes
			await rr.save();

			// Refresh the live Discord message to reflect the updated reaction roles
			await refreshReactionRoleMessage(messageId, container);

			// Build a summary of what changed
			const changes = [];
			if (emojiChanged)
				changes.push(`**Emoji:** ${currentEmoji} → ${newEmoji}`);
			if (newRole) changes.push(`**Role:** ${newRole}`);
			const successContainer = new ContainerBuilder()
				.setAccentColor(
					convertColor('Blue', {
						from: 'discord',
						to: 'decimal',
					}),
				)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						`✏️ **Reaction Role Updated!**\n\n` +
							`**Message:** [Jump to Message](${message.url})\n` +
							changes.join('\n'),
					),
				);
			return interaction.editReply({
				components: [successContainer],
				flags: MessageFlags.IsComponentsV2,
			});
		} catch (error) {
			logger.error(`Error: ${error.message || error}`, {
				label: 'reaction-role:edit',
			});
			return interaction.editReply({
				content: await t(interaction, 'common.error.generic'),
			});
		}
	}
}
exports.default = EditCommand;
