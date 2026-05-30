/**
 * @namespace: addons/embed-builder/commands/embed-builder/delete.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	SlashCommandSubcommandBuilder,
	EmbedBuilder,
	MessageFlags,
} = require('discord.js');

module.exports = {
	slashCommand: new SlashCommandSubcommandBuilder()
		.setName('delete')
		.setDescription('🗑️ Delete a saved embed')
		.addStringOption((o) =>
			o
				.setName('id')
				.setDescription('The embed to delete')
				.setRequired(true)
				.setAutocomplete(true),
		)
		.addBooleanOption((o) =>
			o
				.setName('delete_message')
				.setDescription(
					'Also delete the Discord message if the embed was sent (default: false)',
				)
				.setRequired(false),
		),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { models } = container;
		const { EmbedBuilder: EmbedModel } = models;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const embedId = parseInt(interaction.options.getString('id'), 10);
		const deleteMessage =
			interaction.options.getBoolean('delete_message') ?? false;

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

		const embedName = record.name;

		// Optionally delete the Discord message
		if (deleteMessage && record.messageId && record.channelId) {
			try {
				const channel = await interaction.client.channels
					.fetch(record.channelId)
					.catch(() => null);
				if (channel) {
					const msg = await channel.messages
						.fetch(record.messageId)
						.catch(() => null);
					if (msg) await msg.delete();
				}
			} catch {
				// Best-effort; don't fail if message is already gone
			}
		}

		await record.destroy();

		return interaction.editReply({
			embeds: [
				new EmbedBuilder()
					.setColor(0x22c55e)
					.setDescription(
						`🗑️ **"${embedName}"** has been deleted${deleteMessage ? ' (including the Discord message)' : ''}.`,
					),
			],
		});
	},
};
