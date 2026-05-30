/**
 * @namespace: addons/automod/commands/moderation/announce.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { PermissionFlagsBits, MessageFlags } = require('discord.js');

module.exports = {
	slashCommand: (subcommand) =>
		subcommand
			.setName('announce')
			.setDescription('📢 Sends an announcement to the current channel.')
			.addStringOption((option) =>
				option
					.setName('message')
					.setDescription('The message to announce')
					.setRequired(true),
			)
			.addStringOption((option) =>
				option
					.setName('title')
					.setDescription('Title for the announcement')
					.setRequired(false),
			),
	permissions: PermissionFlagsBits.ManageMessages,
	botPermissions: PermissionFlagsBits.ManageMessages,

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t, helpers, kythiaConfig } = container;
		const { createContainer, simpleContainer } = helpers.discord;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const message = interaction.options.getString('message');
		const title =
			interaction.options.getString('title') ||
			(await t(interaction, 'core.moderation.announce.default.title'));

		try {
			const announcement = await createContainer(interaction, {
				color: kythiaConfig.bot.color,
				title,
				description: message,
				thumbnail: interaction.guild.iconURL(),
				footer: {
					text: await t(interaction, 'core.moderation.announce.footer', {
						user: interaction.user.tag,
					}),
					iconURL: interaction.user.displayAvatarURL(),
				},
			});

			await interaction.channel.send({ components: announcement });

			const reply = await simpleContainer(
				interaction,
				await t(interaction, 'core.moderation.announce.success'),
				{ color: 'Green' },
			);
			return interaction.editReply({
				components: reply,
				flags: MessageFlags.IsComponentsV2,
			});
		} catch (error) {
			const reply = await simpleContainer(
				interaction,
				await t(interaction, 'core.moderation.announce.failed', {
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
