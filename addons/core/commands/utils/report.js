/**
 * @namespace: addons/core/commands/utils/report.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	MessageFlags,
	SlashCommandBuilder,
	ApplicationCommandType,
	InteractionContextType,
	ContextMenuCommandBuilder,
} = require('discord.js');

module.exports = {
	slashCommand: new SlashCommandBuilder()
		.setName('report')
		.setDescription('🚨 Report a user to the moderators.')
		.addUserOption((option) =>
			option.setName('user').setDescription('User to report').setRequired(true),
		)
		.addStringOption((option) =>
			option
				.setName('reason')
				.setDescription('Reason for the report')
				.setRequired(true),
		)
		.setContexts(InteractionContextType.Guild),

	contextMenuCommand: new ContextMenuCommandBuilder()
		.setName('Report User')
		.setType(ApplicationCommandType.User)
		.setContexts(InteractionContextType.Guild),

	contextMenuDescription: '🚨 Report a user to the moderators.',
	guildOnly: true,

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t, helpers, models } = container;
		const { createContainer } = helpers.discord;
		const { ServerSetting } = models;

		await interaction.deferReply();

		const user =
			interaction.options.getUser('user') ||
			interaction.targetUser ||
			interaction.user;
		const reason =
			interaction.options.getString('reason') ||
			(await t(interaction, 'core.utils.report.reason'));
		const guildId = interaction.guild?.id;

		const setting = await ServerSetting.getCache({ guildId });
		if (!setting.modLogChannelId && !interaction.guild) {
			const components = await createContainer(interaction, {
				description: await t(interaction, 'core.utils.report.no.channel'),
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const reportChannel = interaction.guild?.channels.cache.get(
			setting.modLogChannelId,
		);

		// Send report to mod channel (still using embed for mod channel)
		const reportComponents = await createContainer(interaction, {
			description: await t(interaction, 'core.utils.report.embed.desc', {
				reported: user.tag,
				reporter: interaction.user?.tag,
				reason,
			}),
			color: 'Red',
		});

		await reportChannel?.send({
			components: reportComponents,
			flags: MessageFlags.IsComponentsV2,
		});

		// Confirm to user
		const confirmComponents = await createContainer(interaction, {
			description: await t(interaction, 'core.utils.report.success', {
				user: user.tag,
			}),
			color: 'Green',
		});

		return interaction.editReply({
			components: confirmComponents,
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
