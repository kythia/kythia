/**
 * @namespace: addons/automod/commands/moderation/lock.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { PermissionFlagsBits, MessageFlags } = require('discord.js');

module.exports = {
	slashCommand: (subcommand) =>
		subcommand
			.setName('lock')
			.setDescription('🔒 Locks the current channel.')
			.addStringOption((option) =>
				option
					.setName('reason')
					.setDescription('Reason for locking the channel')
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

		const reason =
			interaction.options.getString('reason') ||
			(await t(interaction, 'core.moderation.lock.default.reason'));

		try {
			await interaction.channel.permissionOverwrites.edit(
				interaction.guild.roles.everyone,
				{
					SendMessages: false,
				},
				{ reason },
			);

			const reply = await createContainer(interaction, {
				color: kythiaConfig.bot.color,
				title: await t(interaction, 'core.moderation.lock.success.title'),
				description: await t(interaction, 'core.moderation.lock.success.desc', {
					channel: interaction.channel.toString(),
					reason,
				}),
				thumbnail: interaction.guild.iconURL(),
			});
			await interaction.channel.send({
				components: reply,
				flags: MessageFlags.IsComponentsV2,
			});

			const confirmReply = await simpleContainer(
				interaction,
				await t(interaction, 'core.moderation.lock.confirm'),
				{ color: 'Green' },
			);
			return interaction.editReply({
				components: confirmReply,
				flags: MessageFlags.IsComponentsV2,
			});
		} catch (error) {
			const reply = await simpleContainer(
				interaction,
				await t(interaction, 'core.moderation.lock.failed', {
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
