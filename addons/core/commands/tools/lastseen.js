/**
 * @namespace: addons/core/commands/tools/lastseen.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags, SlashCommandBuilder } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class LastseenCommand extends BaseCommand {
	slashCommand = new SlashCommandBuilder()
		.setName('lastseen')
		.setDescription('👀 Check when a user last sent a message in this server.')
		.addUserOption((option) =>
			option
				.setName('user')
				.setDescription('The user to check')
				.setRequired(true),
		);

	async execute(interaction) {
		const container = this.container;
		const { models, helpers } = container;
		const { User } = models;
		const { simpleContainer } = helpers.discord;

		await interaction.deferReply();

		const targetUser = interaction.options.getUser('user');

		try {
			const userData = await User.getCache({
				where: { userId: targetUser.id, guildId: interaction.guildId },
				attributes: ['lastMessage'],
			});

			if (!userData?.lastMessage) {
				const reply = await simpleContainer(
					interaction,
					`🤷‍♀️ Gak tau deh, <@${targetUser.id}> belum pernah kirim pesan atau datanya belum tercatat.`,
					{ color: 'Orange' },
				);
				return interaction.editReply({
					components: reply,
					allowedMentions: { parse: [] },
					flags: MessageFlags.IsComponentsV2,
				});
			}

			const timestamp = Math.floor(
				new Date(userData.lastMessage).getTime() / 1000,
			);
			const reply = await simpleContainer(
				interaction,
				`👀 <@${targetUser.id}> terakhir terlihat mengirim pesan pada <t:${timestamp}:F> (<t:${timestamp}:R>).`,
				{ color: 'Green' },
			);

			return interaction.editReply({
				components: reply,
				allowedMentions: { parse: [] },
				flags: MessageFlags.IsComponentsV2,
			});
		} catch (err) {
			const reply = await simpleContainer(
				interaction,
				`❌ Terjadi kesalahan saat mengambil data: ${err.message}`,
				{ color: 'Red' },
			);
			return interaction.editReply({
				components: reply,
				flags: MessageFlags.IsComponentsV2,
			});
		}
	}
}

exports.default = LastseenCommand;
