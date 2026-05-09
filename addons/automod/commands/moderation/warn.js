/**
 * @namespace: addons/automod/commands/moderation/warn.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */

const { PermissionFlagsBits, MessageFlags } = require('discord.js');

module.exports = {
	slashCommand: (subcommand) =>
		subcommand
			.setName('warn')
			.setDescription('⚠️ Warns a user.')
			.addUserOption((option) =>
				option
					.setName('user')
					.setDescription('The user to warn')
					.setRequired(true),
			)
			.addStringOption((option) =>
				option
					.setName('reason')
					.setDescription('Reason for the warning')
					.setRequired(false),
			),
	permissions: PermissionFlagsBits.ModerateMembers,
	botPermissions: PermissionFlagsBits.ModerateMembers,

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t, helpers, models, kythiaConfig } = container;
		const { createContainer, simpleContainer, getTextChannelSafe } =
			helpers.discord;
		const { User, ServerSetting } = models;

		await interaction.deferReply();

		const targetUser = interaction.options.getUser('user');
		const reason =
			interaction.options.getString('reason') ||
			(await t(interaction, 'core.moderation.warn.default.reason'));

		if (targetUser.id === interaction.user.id) {
			const reply = await simpleContainer(
				interaction,
				await t(interaction, 'core.moderation.warn.cannot.self'),
				{ color: 'Red' },
			);
			return interaction.editReply({
				components: reply,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		try {
			const [userRecord] = await User.findOrCreateWithCache({
				where: { userId: targetUser.id, guildId: interaction.guild.id },
				defaults: {
					userId: targetUser.id,
					guildId: interaction.guild.id,
					warnings: [],
				},
			});
			let currentWarnings = userRecord.warnings;
			if (typeof currentWarnings === 'string') {
				try {
					currentWarnings = JSON.parse(currentWarnings);
				} catch (_e) {
					currentWarnings = [];
				}
			}
			if (!Array.isArray(currentWarnings)) {
				currentWarnings = [];
			}

			const newWarnings = [
				...currentWarnings,
				{
					moderator: interaction.user.id,
					reason,
					date: new Date(),
				},
			];

			userRecord.warnings = newWarnings;
			userRecord.changed('warnings', true);
			await userRecord.save();

			try {
				const dmReply = await createContainer(interaction, {
					color: 'Orange',
					title: await t(interaction, 'core.moderation.warn.dm.title', {
						guild: interaction.guild.name,
					}),
					description: await t(interaction, 'core.moderation.warn.dm.desc', {
						reason,
						moderator: interaction.user.tag,
					}),
					thumbnail: interaction.guild.iconURL(),
				});
				await targetUser.send({
					components: dmReply,
					flags: MessageFlags.IsComponentsV2,
				});
			} catch (_) {}

			const setting = await ServerSetting.getCache({
				guildId: interaction.guild.id,
			});
			const modLogChannelId = setting.modLogChannelId;
			const modLogChannel = await getTextChannelSafe(
				interaction.guild,
				modLogChannelId,
			);
			if (modLogChannel) {
				const modLogReply = await createContainer(interaction, {
					color: 'Orange',
					title: 'Warn',
					description: await t(
						interaction,
						'core.moderation.warn.modlog.desc',
						{
							user: `${targetUser.tag} (${targetUser.id})`,
							moderator: interaction.user.tag,
							reason,
						},
					),
					thumbnail: targetUser.displayAvatarURL(),
				});
				await modLogChannel.send({
					components: modLogReply,
					flags: MessageFlags.IsComponentsV2,
				});
			}

			const reply = await createContainer(interaction, {
				color: kythiaConfig.bot.color,
				title: await t(interaction, 'core.moderation.warn.success.title'),
				description: await t(interaction, 'core.moderation.warn.success.desc', {
					user: targetUser.tag,
					reason,
				}),
				thumbnail: targetUser.displayAvatarURL(),
			});
			return interaction.editReply({
				components: reply,
				flags: MessageFlags.IsComponentsV2,
			});
		} catch (error) {
			const reply = await simpleContainer(
				interaction,
				await t(interaction, 'core.moderation.warn.failed', {
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
