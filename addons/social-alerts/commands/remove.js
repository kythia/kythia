/**
 * @namespace: addons/social-alerts/commands/remove.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags, PermissionFlagsBits } = require('discord.js');

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('remove')
			.setDescription('➖ Unsubscribe from a social media creator alert.')
			.addStringOption((option) =>
				option
					.setName('subscription')
					.setDescription('Select the subscription to remove.')
					.setAutocomplete(true)
					.setRequired(true),
			),

	async autocomplete(interaction, container) {
		const { models } = container;
		const { SocialAlertSubscription } = models;
		const focused = interaction.options.getFocused();

		try {
			const subs = await SocialAlertSubscription.getAllCache({
				guildId: interaction.guild.id,
			});

			if (!subs || subs.length === 0) return interaction.respond([]);

			const filtered = subs.filter((s) =>
				s.youtubeChannelName.toLowerCase().includes(focused.toLowerCase()),
			);

			const platformEmoji = (platform) => (platform === 'tiktok' ? '🎵' : '📺');

			await interaction.respond(
				filtered.slice(0, 25).map((s) => {
					const name = `${platformEmoji(s.platform)} ${s.youtubeChannelName}`;
					return {
						name: name.length > 100 ? name.slice(0, 100) : name,
						value: s.id.toString(),
					};
				}),
			);
		} catch {
			await interaction.respond([]);
		}
	},

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { models, helpers, t, logger } = container;
		const { SocialAlertSubscription } = models;
		const { simpleContainer } = helpers.discord;

		if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
			return interaction.reply({
				components: await simpleContainer(
					interaction,
					await t(interaction, 'social-alert.error.no_permission'),
					{ color: 'Red' },
				),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}

		await interaction.deferReply();

		const subscriptionId = interaction.options.getString('subscription', true);

		try {
			const sub = await SocialAlertSubscription.getCache({
				id: subscriptionId,
			});

			if (!sub || sub.guildId !== interaction.guild.id) {
				return interaction.editReply({
					components: await simpleContainer(
						interaction,
						await t(interaction, 'social-alert.error.not_found'),
						{ color: 'Red' },
					),
					flags: MessageFlags.IsComponentsV2,
				});
			}

			const channelName = sub.youtubeChannelName;
			await sub.destroy();

			return interaction.editReply({
				components: await simpleContainer(
					interaction,
					await t(interaction, 'social-alert.remove.success', {
						name: channelName,
					}),
					{ color: 'Green' },
				),
				flags: MessageFlags.IsComponentsV2,
			});
		} catch (err) {
			logger.error(`Error in remove command: ${err.message || err}`, {
				label: 'social-alerts',
			});
			return interaction.editReply({
				components: await simpleContainer(
					interaction,
					await t(interaction, 'social-alert.error.failed', {
						error: err.message,
					}),
					{ color: 'Red' },
				),
				flags: MessageFlags.IsComponentsV2,
			});
		}
	},
};
