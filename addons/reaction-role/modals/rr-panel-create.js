/**
 * @namespace: addons/reaction-role/modals/rr-panel-create.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ContainerBuilder,
	SeparatorBuilder,
	SeparatorSpacingSize,
	TextDisplayBuilder,
	MessageFlags,
} = require('discord.js');

const { buildPanelEmbed } = require('../helpers/index.js');

const { BaseModal } = require('kythia-core');

class RrPanelCreateModal extends BaseModal {
	modal = {};

	async execute(interaction) {
		const container = this.container;

		const { models, helpers, logger } = container;
		const { ReactionRolePanel } = models;
		const { simpleContainer } = helpers.discord;
		const { convertColor } = helpers.color;

		await interaction.deferUpdate();

		try {
			// customId: rr-panel-create:<originalMessageId>
			const originalMessageId = interaction.customId.split(':')[1];

			// ----- Read modal fields -----
			const modeRaw = interaction.fields
				.getTextInputValue('mode')
				.trim()
				.toLowerCase();
			const mode = modeRaw === 'use_message' ? 'use_message' : 'post_embed';

			const panelTypeRaw = interaction.fields
				.getTextInputValue('panelType')
				.trim()
				.toLowerCase();
			const panelType = panelTypeRaw === 'dropdown' ? 'dropdown' : 'reaction';

			const channelId = interaction.fields
				.getSelectedChannels('channelId')
				.first()?.id;
			const messageIdInput = interaction.fields
				.getTextInputValue('messageId')
				.trim();
			const title =
				interaction.fields.getTextInputValue('title').trim() || null;
			const description =
				interaction.fields.getTextInputValue('description').trim() || null;

			// ----- Validate channel -----
			if (!channelId) {
				const desc = '❌ You must select a channel.';
				return interaction.followUp({
					components: await simpleContainer(interaction, desc, {
						color: 'Red',
					}),
					flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
				});
			}

			const channel = await interaction.guild.channels
				.fetch(channelId)
				.catch(() => null);

			if (!channel?.isTextBased()) {
				return interaction.followUp({
					components: await simpleContainer(
						interaction,
						'❌ Invalid channel. Please select a text channel.',
						{ color: 'Red' },
					),
					flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
				});
			}

			// ----- Mode-specific logic -----
			let panelMessageId = null;

			if (mode === 'use_message') {
				// Validate message ID
				if (!messageIdInput) {
					return interaction.followUp({
						components: await simpleContainer(
							interaction,
							'❌ For **use_message** mode you must provide a Message ID.',
							{ color: 'Red' },
						),
						flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
					});
				}

				const existingMessage = await channel.messages
					.fetch(messageIdInput)
					.catch(() => null);

				if (!existingMessage) {
					return interaction.followUp({
						components: await simpleContainer(
							interaction,
							`❌ Message ID \`${messageIdInput}\` not found in <#${channelId}>. Make sure the message is in the selected channel.`,
							{ color: 'Red' },
						),
						flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
					});
				}

				panelMessageId = messageIdInput;
			} else {
				// post_embed — send a new embed to the channel
				const panelTitle = title || '🎭 Reaction Roles';
				const placeholder = await buildPanelEmbed(
					{
						guildId: interaction.guildId,
						channelId,
						messageId: null,
						mode: 'post_embed',
						title: panelTitle,
						description,
						whitelistRoles: [],
						blacklistRoles: [],
						messageType: 'normal',
					},
					[],
					container,
				);

				const sentMessage = await channel.send({
					components: [placeholder],
					flags: MessageFlags.IsComponentsV2,
				});
				panelMessageId = sentMessage.id;
			}

			// ----- Save panel to DB -----
			const panel = await ReactionRolePanel.create({
				guildId: interaction.guildId,
				channelId,
				messageId: panelMessageId,
				mode,
				panelType,
				title: title || (mode === 'post_embed' ? '🎭 Reaction Roles' : null),
				description,
				whitelistRoles: [],
				blacklistRoles: [],
				messageType: 'normal',
			});

			// ----- Build success confirmation -----
			const modeLabel =
				mode === 'post_embed' ? '📨 Post Embed' : '🔗 Use Message ID';
			const typeLabel =
				panelType === 'dropdown' ? '🔽 Dropdown Select' : '⚡ Reaction';
			const jumpLink = `https://discord.com/channels/${interaction.guildId}/${channelId}/${panelMessageId}`;

			const addEmojiButton = new ButtonBuilder()
				.setCustomId(`rr-panel-add-emoji-show:${panel.id}`)
				.setLabel(
					panelType === 'dropdown' ? 'Add Option → Role' : 'Add Emoji → Role',
				)
				.setStyle(ButtonStyle.Success)
				.setEmoji('➕');

			const successContainer = new ContainerBuilder()
				.setAccentColor(
					convertColor('Green', { from: 'discord', to: 'decimal' }),
				)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						`✅ **Panel Created!**\n\n` +
							`**Panel ID:** \`${panel.id}\`\n` +
							`**Mode:** ${modeLabel}\n` +
							`**Type:** ${typeLabel}\n` +
							`**Channel:** <#${channelId}>\n` +
							`**Message:** [Jump to Panel](${jumpLink})\n\n` +
							`Now click **${panelType === 'dropdown' ? 'Add Option → Role' : 'Add Emoji → Role'}** to add bindings to this panel.`,
					),
				)
				.addSeparatorComponents(
					new SeparatorBuilder()
						.setSpacing(SeparatorSpacingSize.Small)
						.setDivider(true),
				)
				.addActionRowComponents(
					new ActionRowBuilder().addComponents(addEmojiButton),
				);

			// Edit the original ephemeral setup message to show success
			if (originalMessageId) {
				await interaction.channel.messages
					.edit(originalMessageId, {
						components: [successContainer],
						flags: MessageFlags.IsComponentsV2,
					})
					.catch(() => null);
			} else {
				await interaction.followUp({
					components: [successContainer],
					flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
				});
			}
		} catch (error) {
			logger.error(`Error: ${error.message || error}`, {
				label: 'reaction-role:rr-panel-create',
			});
			await interaction.followUp({
				components: await simpleContainer(
					interaction,
					'❌ An error occurred while creating the panel.',
					{ color: 'Red' },
				),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}
	}
}

exports.default = RrPanelCreateModal;
