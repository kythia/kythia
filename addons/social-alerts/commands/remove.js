/**
 * @namespace: addons/social-alerts/commands/remove.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags, PermissionFlagsBits } = require('discord.js');
const { BaseCommand } = require('kythia-core');
class RemoveCommand extends BaseCommand {
	subcommand = true;
	permissions = [PermissionFlagsBits.ManageGuild];
	slashCommand = (subcommand) =>
		subcommand
			.setName('remove')
			.setDescription('Unsubscribe from a social media creator alert.')
			.addStringOption((option) =>
				option
					.setName('subscription')
					.setDescription('Select the subscription to remove.')
					.setAutocomplete(true)
					.setRequired(true),
			);
	async autocomplete(interaction) {
		const container = this.container;
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
	}
	async execute(interaction) {
		const container = this.container;
		const { models, helpers, t, logger } = container;
		const { SocialAlertSubscription } = models;
		const { simpleContainer } = helpers.discord;
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
						{
							color: 'Red',
						},
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
					{
						color: 'Green',
					},
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
					{
						color: 'Red',
					},
				),
				flags: MessageFlags.IsComponentsV2,
			});
		}
	}
}
exports.default = RemoveCommand;
