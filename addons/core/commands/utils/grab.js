/**
 * @namespace: addons/core/commands/utils/grab.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	MessageFlags,
	SlashCommandBuilder,
	PermissionFlagsBits,
	ApplicationCommandType,
	ContextMenuCommandBuilder,
} = require('discord.js');

const { BaseCommand } = require('kythia-core');

function parseCustomEmoji(str) {
	const match = str.match(/<?a?:?(\w+):(\d+)>?/);
	if (!match) return null;
	const [, name, id] = match;
	const isAnimated = str.startsWith('<a:');
	return { name, id, isAnimated };
}

class GrabCommand extends BaseCommand {
	slashCommand = new SlashCommandBuilder()
		.setName('grab')
		.setDescription('🛍️ grab stickers or emojis from messages.')
		.addSubcommand((sub) =>
			sub
				.setName('sticker')
				.setDescription('grab a sticker from a message')
				.addStringOption((opt) =>
					opt
						.setName('sticker_id')
						.setDescription('Sticker ID to grab')
						.setRequired(true),
				),
		)
		.addSubcommand((sub) =>
			sub
				.setName('emoji')
				.setDescription('grab a custom emoji from a message')
				.addStringOption((opt) =>
					opt
						.setName('emoji')
						.setDescription('Emoji to grab (custom emoji format)')
						.setRequired(true),
				),
		)
		.addSubcommand((sub) =>
			sub
				.setName('image')
				.setDescription(
					'grab an image from a message and turn it into a sticker',
				)
				.addStringOption((opt) =>
					opt
						.setName('message_id')
						.setDescription('ID of the message containing the image')
						.setRequired(true),
				)
				.addStringOption((opt) =>
					opt
						.setName('name')
						.setDescription('Name for the new sticker (max 30 chars)')
						.setRequired(false),
				),
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuildExpressions);

	contextMenuCommand = new ContextMenuCommandBuilder()
		.setName('Grab Sticker/Emoji')
		.setType(ApplicationCommandType.Message);

	contextMenuDescription = '🛍️ Grab sticker or emoji from this message.';
	permissions = PermissionFlagsBits.ManageGuildExpressions;
	botPermissions = PermissionFlagsBits.ManageGuildExpressions;

	async execute(interaction) {
		const container = this.container;
		const { t, helpers } = container;
		const { simpleContainer } = helpers.discord;

		if (
			interaction.isChatInputCommand?.() &&
			interaction.commandName === 'grab'
		) {
			const sub = interaction.options.getSubcommand();
			if (sub === 'sticker') {
				await interaction.deferReply();
				const stickerId = interaction.options.getString('sticker_id');
				try {
					const sticker = await interaction.client.fetchSticker(stickerId);
					if (!sticker) {
						const components = await simpleContainer(
							interaction,
							await t(interaction, 'core.utils.grab.sticker.not.found'),
							{ color: 'Red' },
						);
						return interaction.editReply({
							components,
							flags: MessageFlags.IsComponentsV2,
						});
					}

					if (!interaction.guild?.stickers?.create) {
						const components = await simpleContainer(
							interaction,
							await t(interaction, 'core.utils.grab.no.perm.sticker'),
							{ color: 'Red' },
						);
						return interaction.editReply({
							components,
							flags: MessageFlags.IsComponentsV2,
						});
					}

					const url = sticker.url || sticker.asset;
					if (!url) {
						const components = await simpleContainer(
							interaction,
							await t(interaction, 'core.utils.grab.sticker.no.url'),
							{ color: 'Red' },
						);
						return interaction.editReply({
							components,
							flags: MessageFlags.IsComponentsV2,
						});
					}

					try {
						const created = await interaction.guild.stickers.create({
							file: url,
							name: sticker.name || `stolen_sticker_${sticker.id}`,
							tags: sticker.tags || 'stolen',
						});
						const components = await simpleContainer(
							interaction,
							await t(interaction, 'core.utils.grab.sticker.success', {
								name: created.name,
							}),
							{ color: 'Green' },
						);
						return interaction.editReply({
							components,
							flags: MessageFlags.IsComponentsV2,
						});
					} catch (_e) {
						return interaction.editReply({
							content: await t(interaction, 'core.utils.grab.sticker.manual'),
							files: [url],
						});
					}
				} catch (_err) {
					return interaction.editReply({
						content: await t(interaction, 'core.utils.grab.sticker.error'),
					});
				}
			} else if (sub === 'emoji') {
				await interaction.deferReply();
				const emojiInput = interaction.options.getString('emoji');

				const match = emojiInput.match(/<?a?:?(\w+):(\d+)>?/);
				if (!match) {
					const components = await simpleContainer(
						interaction,
						await t(interaction, 'core.utils.grab.emoji.invalid'),
						{ color: 'Red' },
					);
					return interaction.editReply({
						components,
						flags: MessageFlags.IsComponentsV2,
					});
				}
				const [, name, id] = match;
				const isAnimated = emojiInput.startsWith('<a:');
				const url = `https://cdn.discordapp.com/emojis/${id}.${isAnimated ? 'gif' : 'png'}?v=1`;
				try {
					if (!interaction.guild?.emojis?.create) {
						return interaction.editReply({
							content: await t(interaction, 'core.utils.grab.no.perm.emoji'),
						});
					}
					const created = await interaction.guild.emojis.create({
						attachment: url,
						name,
					});
					const components = await simpleContainer(
						interaction,
						await t(interaction, 'core.utils.grab.emoji.success', {
							name: created.name,
						}),
						{ color: 'Green' },
					);
					return interaction.editReply({
						components,
						flags: MessageFlags.IsComponentsV2,
					});
				} catch (_e) {
					return interaction.editReply({
						content: await t(interaction, 'core.utils.grab.emoji.manual'),
						files: [url],
					});
				}
			} else if (sub === 'image') {
				await interaction.deferReply();
				const messageId = interaction.options.getString('message_id');
				const stickerName = interaction.options.getString('name');

				let targetMessage;
				try {
					targetMessage = await interaction.channel.messages.fetch(messageId);
				} catch {
					const components = await simpleContainer(
						interaction,
						await t(interaction, 'core.utils.grab.image.message.not_found'),
						{ color: 'Red' },
					);
					return interaction.editReply({
						components,
						flags: MessageFlags.IsComponentsV2,
					});
				}

				const attachment = targetMessage?.attachments?.find((a) =>
					a.contentType?.startsWith('image/'),
				);

				let url;
				let fallbackName;

				if (attachment) {
					url = attachment.url;
					fallbackName = (
						attachment.name?.split('.')[0] || 'grabbed_image'
					).slice(0, 30);
				} else {
					const urlRegex = /(https?:\/\/[^\s]+)/g;
					const urls = targetMessage?.content?.match?.(urlRegex);
					if (urls && urls.length > 0) {
						url = urls[0];
						fallbackName = 'grabbed_link';
					}
				}

				if (!url) {
					const components = await simpleContainer(
						interaction,
						await t(interaction, 'core.utils.grab.image.not_found'),
						{ color: 'Red' },
					);
					return interaction.editReply({
						components,
						flags: MessageFlags.IsComponentsV2,
					});
				}

				const finalName = (stickerName || fallbackName).slice(0, 30);

				try {
					if (!interaction.guild?.stickers?.create)
						throw new Error('No permission');
					const created = await interaction.guild.stickers.create({
						file: url,
						name: finalName,
						tags: 'grabbed',
					});
					const components = await simpleContainer(
						interaction,
						await t(interaction, 'core.utils.grab.sticker.success', {
							name: created.name,
						}),
						{ color: 'Green' },
					);
					return interaction.editReply({
						components,
						flags: MessageFlags.IsComponentsV2,
					});
				} catch (_e) {
					return interaction.editReply({
						content: await t(interaction, 'core.utils.grab.sticker.manual'),
						files: [url],
					});
				}
			}
		}

		if (interaction.isMessageContextMenuCommand?.()) {
			await interaction.deferReply({ flags: MessageFlags.Ephemeral });
			const message = interaction.targetMessage;

			if (message?.stickers && message.stickers.size > 0) {
				const sticker = message.stickers.first();
				if (!sticker) {
					const components = await simpleContainer(
						interaction,
						await t(interaction, 'core.utils.grab.sticker.not.found'),
						{ color: 'Red' },
					);
					return interaction.editReply({
						components,
						flags: MessageFlags.IsComponentsV2,
					});
				}
				const url = sticker.url || sticker.asset;
				if (!url) {
					const components = await simpleContainer(
						interaction,
						await t(interaction, 'core.utils.grab.sticker.no.url'),
						{ color: 'Red' },
					);
					return interaction.editReply({
						components,
						flags: MessageFlags.IsComponentsV2,
					});
				}

				try {
					if (!interaction.guild?.stickers?.create)
						throw new Error('No permission');
					const created = await interaction.guild.stickers.create({
						file: url,
						name: sticker.name || `stolen_sticker_${sticker.id}`,
						tags: sticker.tags || 'stolen',
					});
					const components = await simpleContainer(
						interaction,
						await t(interaction, 'core.utils.grab.sticker.success', {
							name: created.name,
						}),
						{ color: 'Green' },
					);
					return interaction.editReply({
						components,
						flags: MessageFlags.IsComponentsV2,
					});
				} catch (_e) {
					return interaction.editReply({
						content: await t(interaction, 'core.utils.grab.sticker.manual'),
						files: [url],
					});
				}
			}

			const emojiRegex = /<a?:\w+:\d+>/g;
			const found = message?.content?.match?.(emojiRegex);
			if (found && found.length > 0) {
				const emojiData = parseCustomEmoji(found[0]);
				if (!emojiData) {
					const components = await simpleContainer(
						interaction,
						await t(interaction, 'core.utils.grab.emoji.invalid'),
						{ color: 'Red' },
					);
					return interaction.editReply({
						components,
						flags: MessageFlags.IsComponentsV2,
					});
				}
				const { name, id, isAnimated } = emojiData;
				const url = `https://cdn.discordapp.com/emojis/${id}.${isAnimated ? 'gif' : 'png'}?v=1`;
				try {
					if (!interaction.guild?.emojis?.create) {
						return interaction.editReply({
							content: await t(interaction, 'core.utils.grab.no.perm.emoji'),
						});
					}
					const created = await interaction.guild.emojis.create({
						attachment: url,
						name,
					});
					const components = await simpleContainer(
						interaction,
						await t(interaction, 'core.utils.grab.emoji.success', {
							name: created.name,
						}),
						{ color: 'Green' },
					);
					return interaction.editReply({
						components,
						flags: MessageFlags.IsComponentsV2,
					});
				} catch (_e) {
					return interaction.editReply({
						content: await t(interaction, 'core.utils.grab.emoji.manual'),
						files: [url],
					});
				}
			}

			// Opsi 3: Cek Attachment (Image) atau Link di Content
			const attachment = message?.attachments?.find((a) =>
				a.contentType?.startsWith('image/'),
			);

			let imageUrl;
			let imageFileName;

			if (attachment) {
				imageUrl = attachment.url;
				imageFileName = `grabbed_${attachment.name.split('.')[0]}`.slice(0, 30);
			} else {
				const urlRegex = /(https?:\/\/[^\s]+)/g;
				const urls = message?.content?.match?.(urlRegex);
				if (urls && urls.length > 0) {
					imageUrl = urls[0];
					imageFileName = 'grabbed_link';
				}
			}

			if (imageUrl) {
				try {
					if (!interaction.guild?.stickers?.create)
						throw new Error('No permission');

					const created = await interaction.guild.stickers.create({
						file: imageUrl,
						name: imageFileName,
						tags: 'grabbed',
					});

					const components = await simpleContainer(
						interaction,
						await t(interaction, 'core.utils.grab.sticker.success', {
							name: created.name,
						}),
						{ color: 'Green' },
					);
					return interaction.editReply({
						components,
						flags: MessageFlags.IsComponentsV2,
					});
				} catch (_e) {
					return interaction.editReply({
						content: await t(interaction, 'core.utils.grab.sticker.manual'),
						files: [imageUrl],
					});
				}
			}

			const components = await simpleContainer(
				interaction,
				await t(interaction, 'core.utils.grab.sticker.or.emoji.not.found'),
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
	}
}

exports.default = GrabCommand;
