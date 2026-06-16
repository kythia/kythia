/**
 * @namespace: addons/embed-builder/commands/embed-builder/send.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	EmbedBuilder,
	MessageFlags,
	SlashCommandSubcommandBuilder,
} = require('discord.js');

const { BaseCommand } = require('kythia-core');

class SendCommand extends BaseCommand {
	slashCommand = new SlashCommandSubcommandBuilder()
		.setName('send')
		.setDescription('📤 Send a saved embed to a channel')
		.addStringOption((option) =>
			option
				.setName('id')
				.setDescription('The embed to send')
				.setRequired(true)
				.setAutocomplete(true),
		)
		.addChannelOption((option) =>
			option
				.setName('channel')
				.setDescription('Target channel (defaults to current channel)')
				.setRequired(false),
		)
		.addStringOption((option) =>
			option
				.setName('allowed_mentions')
				.setDescription('Who can be mentioned in the embed (default: everyone)')
				.setRequired(false)
				.addChoices(
					{
						name: '🌐 Everyone (@everyone, @here, roles & users)',
						value: 'everyone',
					},
					{ name: '👥 Roles only', value: 'roles' },
					{ name: '👤 Users only', value: 'users' },
					{ name: '🔕 No mentions', value: 'none' },
				),
		);

	async execute(interaction) {
		const container = this.container;
		const { models } = container;
		const { EmbedBuilder: EmbedModel } = models;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const embedId = parseInt(interaction.options.getString('id'), 10);
		const targetChannel =
			interaction.options.getChannel('channel') ?? interaction.channel;

		// Resolve allowed_mentions option → Discord allowedMentions object
		const mentionChoice =
			interaction.options.getString('allowed_mentions') ?? 'everyone';
		const allowedMentionsMap = {
			everyone: { parse: ['everyone', 'roles', 'users'] },
			roles: { parse: ['roles'] },
			users: { parse: ['users'] },
			none: { parse: [] },
		};
		const allowedMentions = allowedMentionsMap[mentionChoice] ?? {
			parse: ['everyone', 'roles', 'users'],
		};

		const record = await EmbedModel.getCache({
			where: { id: embedId, guildId: interaction.guild.id },
		});

		if (!record) {
			return interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setColor(0xef4444)
						.setDescription('❌ Embed not found in this server.'),
				],
			});
		}

		try {
			let message;

			if (record.mode === 'embed') {
				// Build classic Discord embed from stored data
				const embedData = record.data || {};
				const embed = new EmbedBuilder();

				if (embedData.title) embed.setTitle(embedData.title.slice(0, 256));
				if (embedData.description)
					embed.setDescription(embedData.description.slice(0, 4000));
				if (embedData.color) embed.setColor(embedData.color);
				if (embedData.image?.url) embed.setImage(embedData.image.url);
				if (embedData.thumbnail?.url)
					embed.setThumbnail(embedData.thumbnail.url);
				if (embedData.footer?.text)
					embed.setFooter({
						text: embedData.footer.text.slice(0, 2048),
						iconURL: embedData.footer.icon_url,
					});
				if (embedData.author?.name)
					embed.setAuthor({
						name: embedData.author.name.slice(0, 256),
						iconURL: embedData.author.icon_url,
						url: embedData.author.url,
					});
				if (embedData.url) embed.setURL(embedData.url);
				if (embedData.timestamp)
					embed.setTimestamp(
						embedData.timestamp === true
							? Date.now()
							: new Date(embedData.timestamp),
					);
				if (Array.isArray(embedData.fields)) {
					embed.addFields(embedData.fields);
				}

				message = await targetChannel.send({
					embeds: [embed],
					allowedMentions,
				});
			} else {
				// Components V2 — data.components is the raw components array
				const componentsData = record.data?.components ?? [];

				// Re-build from raw JSON using ContainerBuilder if it's a container type
				if (componentsData.length === 0) {
					return interaction.editReply({
						embeds: [
							new EmbedBuilder()
								.setColor(0xf59e0b)
								.setDescription(
									'⚠️ This Components V2 embed has no components yet. Edit it via the dashboard first.',
								),
						],
					});
				}

				message = await targetChannel.send({
					components: componentsData,
					flags: MessageFlags.IsComponentsV2,
					allowedMentions,
				});
			}

			// Save messageId, channelId, and allowedMentions preference to DB
			await record.update({
				messageId: message.id,
				channelId: targetChannel.id,
				allowedMentions,
			});

			return interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setColor(0x22c55e)
						.setTitle('✅ Embed Sent!')
						.setDescription(
							`**"${record.name}"** was posted to <#${targetChannel.id}>!\n[Jump to message](https://discord.com/channels/${interaction.guild.id}/${targetChannel.id}/${message.id})`,
						),
				],
			});
		} catch (error) {
			container.logger.error(
				`[embed-builder:send] Error: ${error.message || String(error)}`,
				{ label: 'embed-builder:send' },
			);
			return interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setColor(0xef4444)
						.setDescription(`❌ Failed to send: \`${error.message}\``),
				],
			});
		}
	}
}

exports.default = SendCommand;
