/**
 * @namespace: addons/automod/commands/moderation/unban.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { PermissionFlagsBits, MessageFlags } = require('discord.js');

module.exports = {
	slashCommand: (subcommand) =>
		subcommand
			.setName('unban')
			.setDescription('🔓 Unbans a user from the server.')
			.addStringOption((option) =>
				option
					.setName('user_id')
					.setDescription('The ID of the user to unban')
					.setRequired(true),
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

		await interaction.deferReply();

		const userId = interaction.options.getString('user_id');

		try {
			await interaction.guild.members.unban(userId);
			const reply = await createContainer(interaction, {
				color: kythiaConfig.bot.color,
				title: await t(interaction, 'core.moderation.unban.success.title'),
				description: await t(
					interaction,
					'core.moderation.unban.success.desc',
					{
						userId,
					},
				),
				thumbnail: interaction.client.user.displayAvatarURL(),
			});
			return interaction.editReply({
				components: reply,
				flags: MessageFlags.IsComponentsV2,
			});
		} catch (error) {
			const reply = await simpleContainer(
				interaction,
				await t(interaction, 'core.moderation.unban.failed', {
					error: error.message,
				}),
				{ color: 'Red' },
			);
			return interaction.editReply({
				components: reply,
				flags: MessageFlags.IsComponentsV2,
			});
		}
	},
};
