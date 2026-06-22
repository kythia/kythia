/**
 * @namespace: addons/automod/commands/moderation/timeout.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags, PermissionFlagsBits } = require('discord.js');
const { BaseCommand } = require('kythia-core');
class TimeoutCommand extends BaseCommand {
	permissions = PermissionFlagsBits.ModerateMembers;
	botPermissions = PermissionFlagsBits.ModerateMembers;
	slashCommand = (subcommand) =>
		subcommand
			.setName('timeout')
			.setDescription('Timeouts a user.')
			.addUserOption((option) =>
				option
					.setName('user')
					.setDescription('The user to timeout')
					.setRequired(true),
			)
			.addIntegerOption((option) =>
				option
					.setName('duration')
					.setDescription('Duration in minutes')
					.setRequired(true),
			)
			.addStringOption((option) =>
				option
					.setName('reason')
					.setDescription('Reason for the timeout')
					.setRequired(false),
			);
	async execute(interaction) {
		const container = this.container;
		const { t, helpers, kythiaConfig } = container;
		const { createContainer, simpleContainer } = helpers.discord;
		await interaction.deferReply();
		const user = interaction.options.getUser('user');
		const duration = interaction.options.getInteger('duration');
		const reason =
			interaction.options.getString('reason') ||
			(await t(
				interaction,
				'automod.commands.moderation.timeout.default.reason',
			));
		try {
			const member = await helpers.discord.getMemberSafe(
				interaction.guild,
				user.id,
			);
			await member.timeout(duration * 60 * 1000, reason);
			const reply = await createContainer(interaction, {
				color: kythiaConfig.bot.color,
				title: await t(
					interaction,
					'automod.commands.moderation.timeout.success.title',
				),
				description: await t(
					interaction,
					'automod.commands.moderation.timeout.success.desc',
					{
						user: user.tag,
						duration,
						reason,
					},
				),
				thumbnail: user.displayAvatarURL(),
			});
			return interaction.editReply({
				components: reply,
				flags: MessageFlags.IsComponentsV2,
			});
		} catch (error) {
			const reply = await simpleContainer(
				interaction,
				await t(interaction, 'automod.commands.moderation.timeout.failed', {
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
exports.default = TimeoutCommand;
