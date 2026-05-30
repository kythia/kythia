/**
 * @namespace: addons/automod/commands/moderation/slowmode.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { PermissionFlagsBits, MessageFlags } = require('discord.js');

module.exports = {
	slashCommand: (subcommand) =>
		subcommand
			.setName('slowmode')
			.setDescription('🐢 Sets the slowmode for the current channel.')
			.addIntegerOption((option) =>
				option
					.setName('seconds')
					.setDescription('Slowmode duration in seconds (0 to disable)')
					.setRequired(true),
			)
			.addStringOption((option) =>
				option
					.setName('reason')
					.setDescription('Reason for changing slowmode')
					.setRequired(false),
			),
	permissions: PermissionFlagsBits.ManageChannels,
	botPermissions: PermissionFlagsBits.ManageChannels,

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t, helpers, kythiaConfig } = container;
		const { createContainer, simpleContainer } = helpers.discord;

		await interaction.deferReply();

		const seconds = interaction.options.getInteger('seconds');
		const reason =
			interaction.options.getString('reason') ||
			(await t(interaction, 'core.moderation.slowmode.default.reason'));

		try {
			await interaction.channel.setRateLimitPerUser(seconds, reason);

			const reply = await createContainer(interaction, {
				color: kythiaConfig.bot.color,
				title: await t(interaction, 'core.moderation.slowmode.success.title'),
				description: await t(
					interaction,
					'core.moderation.slowmode.success.desc',
					{
						channel: interaction.channel.toString(),
						seconds,
						reason,
					},
				),
				thumbnail: interaction.guild.iconURL(),
			});
			await interaction.channel.send({
				components: reply,
				flags: MessageFlags.IsComponentsV2,
			});

			const confirmReply = await simpleContainer(
				interaction,
				await t(interaction, 'core.moderation.slowmode.confirm'),
				{ color: 'Green' },
			);
			return interaction.editReply({
				components: confirmReply,
				flags: MessageFlags.IsComponentsV2,
			});
		} catch (error) {
			const reply = await simpleContainer(
				interaction,
				await t(interaction, 'core.moderation.slowmode.failed', {
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
