/**
 * @namespace: addons/automod/commands/moderation/ban.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags, PermissionFlagsBits } = require('discord.js');
const { BaseCommand } = require('kythia-core');
class BanCommand extends BaseCommand {
	permissions = PermissionFlagsBits.BanMembers;
	botPermissions = PermissionFlagsBits.BanMembers;
	slashCommand = (subcommand) =>
		subcommand
			.setName('ban')
			.setDescription('Bans a user from the server.')
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
			);
	async execute(interaction) {
		const container = this.container;
		const { t, helpers, kythiaConfig } = container;
		const { createContainer, simpleContainer } = helpers.discord;
		await interaction.deferReply({
			flags: MessageFlags.Ephemeral,
		});
		const user = interaction.options.getUser('user');
		const reason =
			interaction.options.getString('reason') ||
			(await t(interaction, 'automod.commands.moderation.ban.default.reason'));
		try {
			await interaction.guild.members.ban(user, {
				reason,
			});
			const reply = await createContainer(interaction, {
				color: kythiaConfig.bot.color,
				title: await t(
					interaction,
					'automod.commands.moderation.ban.success.title',
				),
				description: await t(
					interaction,
					'automod.commands.moderation.ban.success.desc',
					{
						user: user.tag,
						reason,
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
				await t(interaction, 'automod.commands.moderation.ban.failed', {
					error: error.message,
				}),
				{
					color: 'Red',
				},
			);
			return interaction.editReply({
				components: reply,
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}
	}
}
exports.default = BanCommand;
