/**
 * @namespace: addons/automod/commands/moderation/ban.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { PermissionFlagsBits, MessageFlags } = require('discord.js');

module.exports = {
	slashCommand: (subcommand) =>
		subcommand
			.setName('ban')
			.setDescription('🔨 Bans a user from the server.')
			.addUserOption((option) =>
				option
					.setName('user')
					.setDescription('The user to ban')
					.setRequired(true),
			)
			.addStringOption((option) =>
				option
					.setName('reason')
					.setDescription('Reason for the ban')
					.setRequired(false),
			),
	permissions: PermissionFlagsBits.BanMembers,
	botPermissions: PermissionFlagsBits.BanMembers,

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t, helpers, kythiaConfig } = container;
		const { createContainer, simpleContainer } = helpers.discord;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const user = interaction.options.getUser('user');
		const reason =
			interaction.options.getString('reason') ||
			(await t(interaction, 'core.moderation.ban.default.reason'));

		try {
			await interaction.guild.members.ban(user, { reason });
			const reply = await createContainer(interaction, {
				color: kythiaConfig.bot.color,
				title: await t(interaction, 'core.moderation.ban.success.title'),
				description: await t(interaction, 'core.moderation.ban.success.desc', {
					user: user.tag,
					reason,
				}),
				thumbnail: interaction.client.user.displayAvatarURL(),
			});
			return interaction.editReply({
				components: reply,
				flags: MessageFlags.IsComponentsV2,
			});
		} catch (error) {
			const reply = await simpleContainer(
				interaction,
				await t(interaction, 'core.moderation.ban.failed', {
					error: error.message,
				}),
				{ color: 'Red' },
			);
			return interaction.editReply({
				components: reply,
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}
	},
};
