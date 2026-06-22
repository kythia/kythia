/**
 * @namespace: addons/automod/commands/moderation/kick.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags, PermissionFlagsBits } = require('discord.js');
const { BaseCommand } = require('kythia-core');
class KickCommand extends BaseCommand {
	permissions = PermissionFlagsBits.KickMembers;
	botPermissions = PermissionFlagsBits.KickMembers;
	slashCommand = (subcommand) =>
		subcommand
			.setName('kick')
			.setDescription('Kicks a user from the server.')
			.addUserOption((option) =>
				option
					.setName('user')
					.setDescription('The user to kick')
					.setRequired(true),
			)
			.addStringOption((option) =>
				option
					.setName('reason')
					.setDescription('Reason for the kick')
					.setRequired(false),
			);
	async execute(interaction) {
		const container = this.container;
		const { t, helpers, models, kythiaConfig } = container;
		const { createContainer, simpleContainer, getTextChannelSafe } =
			helpers.discord;
		const { ServerSetting } = models;
		await interaction.deferReply();
		const user = interaction.options.getUser('user');
		const reason =
			interaction.options.getString('reason') ||
			(await t(interaction, 'automod.commands.moderation.kick.default.reason'));
		try {
			await interaction.guild.members.kick(user, reason);
			const reply = await createContainer(interaction, {
				color: kythiaConfig.bot.color,
				title: await t(
					interaction,
					'automod.commands.moderation.kick.success.title',
				),
				description: await t(
					interaction,
					'automod.commands.moderation.kick.success.desc',
					{
						user: user.tag,
						reason,
					},
				),
				thumbnail: user.displayAvatarURL(),
			});
			const [setting] = await ServerSetting.findOrCreateCache({
				where: {
					guildId: interaction.guild.id,
				},
				defaults: {
					guildId: interaction.guild.id,
					guildName: interaction.guild?.name || 'Unknown',
				},
			});
			const modLogChannelId = setting.modLogChannelId;
			const modLogChannel = await getTextChannelSafe(
				interaction.guild,
				modLogChannelId,
			);
			if (modLogChannel) {
				const modLogReply = await createContainer(interaction, {
					color: 'Orange',
					title: await t(
						interaction,
						'automod.commands.moderation.kick.modlog.title',
					),
					description: await t(
						interaction,
						'automod.commands.moderation.kick.modlog.desc',
						{
							user: `${user.tag} (${user.id})`,
							moderator: interaction.user.tag,
							reason,
						},
					),
					thumbnail: user.displayAvatarURL(),
				});
				await modLogChannel.send({
					components: modLogReply,
					flags: MessageFlags.IsComponentsV2,
				});
			}
			return interaction.editReply({
				components: reply,
				flags: MessageFlags.IsComponentsV2,
			});
		} catch (error) {
			const reply = await simpleContainer(
				interaction,
				await t(interaction, 'automod.commands.moderation.kick.failed', {
					error: error.message,
				}),
				{
					color: 'Red',
				},
			);
			return interaction.editReply({
				components: reply,
				flags: MessageFlags.IsComponentsV2,
			});
		}
	}
}
exports.default = KickCommand;
