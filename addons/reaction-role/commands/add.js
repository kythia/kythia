/**
 * @namespace: addons/reaction-role/commands/add.js
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

const { BaseCommand } = require('kythia-core');

class AddCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('add')
			.setDescription('➕ Add a reaction role to a message.')
			.addStringOption((option) =>
				option
					.setName('message_id')
					.setDescription('The ID of the message.')
					.setRequired(true),
			)
			.addStringOption((option) =>
				option
					.setName('emoji')
					.setDescription('The emoji to react with.')
					.setRequired(true),
			)
			.addRoleOption((option) =>
				option
					.setName('role')
					.setDescription('The role to assign.')
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
			);

	async execute(interaction) {
		const container = this.container;
		const { t, models, helpers, logger } = container;
		const { ReactionRole, ReactionRolePanel } = models;
		const { convertColor } = helpers.color;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const messageId = interaction.options.getString('message_id');
		const emojiInput = interaction.options.getString('emoji');
		const role = interaction.options.getRole('role');
		const channel =
			interaction.options.getChannel('channel') || interaction.channel;

		if (!channel?.isTextBased()) {
			return interaction.editReply({
				content: await t(interaction, 'reaction-role.invalid_channel'),
			});
		}

		try {
			const message = await channel.messages.fetch(messageId).catch(() => null);

			if (!message) {
				return interaction.editReply({
					content: await t(interaction, 'reaction-role.invalid_message'),
				});
			}

			const panel = await ReactionRolePanel.getCache({
				where: { guildId: interaction.guildId, messageId },
			});

			// Validate emoji by trying to react
			try {
				const reaction = await message.react(emojiInput);
				if (panel && panel.panelType === 'dropdown') {
					try {
						await reaction.users.remove(interaction.client.user.id);
					} catch (_) {}
				}
			} catch (error) {
				logger.error(`Error: ${error.message || error}`, {
					label: 'reaction-role:react',
				});
				return interaction.editReply({
					content: await t(interaction, 'reaction-role.invalid_emoji'),
				});
			}

			// Check if exists
			const existing = await ReactionRole.getCache({
				where: {
					guildId: interaction.guildId,
					messageId,
					emoji: emojiInput,
				},
			});

			if (existing) {
				existing.roleId = role.id;
				existing.channelId = channel.id; // Update channel just in case
				if (panel) existing.panelId = panel.id;
				await existing.save();
			} else {
				await ReactionRole.create({
					guildId: interaction.guildId,
					channelId: channel.id,
					messageId,
					emoji: emojiInput,
					roleId: role.id,
					panelId: panel ? panel.id : null,
				});
			}

			// Refresh panel if it exists
			if (panel) {
				await helpers.reactionRole.refreshPanelMessage(panel.id, container);
			}

			const successContainer = new ContainerBuilder()
				.setAccentColor(
					convertColor('Green', { from: 'discord', to: 'decimal' }),
				)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						await t(interaction, 'reaction-role.add.success', {
							messageUrl: message.url,
							emoji: emojiInput,
							role: role.toString(),
						}),
					),
				);

			return interaction.editReply({
				components: [successContainer],
				flags: MessageFlags.IsComponentsV2,
			});
		} catch (error) {
			logger.error(`Error: ${error.message || error}`, {
				label: 'reaction-role:add',
			});
			return interaction.editReply({
				content: await t(interaction, 'common.error.generic'),
			});
		}
	}
}

exports.default = AddCommand;
