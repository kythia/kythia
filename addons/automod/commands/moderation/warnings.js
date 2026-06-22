/**
 * @namespace: addons/automod/commands/moderation/warnings.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags, PermissionFlagsBits } = require('discord.js');
const { BaseCommand } = require('kythia-core');
class WarningsCommand extends BaseCommand {
	permissions = PermissionFlagsBits.ModerateMembers;
	botPermissions = PermissionFlagsBits.ModerateMembers;
	slashCommand = (subcommand) =>
		subcommand
			.setName('warnings')
			.setDescription('View warnings for a user.')
			.addUserOption((option) =>
				option
					.setName('user')
					.setDescription('The user to view warnings for')
					.setRequired(true),
			);
	async execute(interaction) {
		const container = this.container;
		const { t, helpers, models, kythiaConfig } = container;
		const { createContainer, simpleContainer } = helpers.discord;
		const { User } = models;
		await interaction.deferReply();
		const targetUser = interaction.options.getUser('user');
		try {
			const userRecord = await User.getCache({
				userId: targetUser.id,
				guildId: interaction.guild.id,
			});
			if (!userRecord?.warnings || userRecord.warnings.length === 0) {
				const reply = await simpleContainer(
					interaction,
					await t(interaction, 'automod.commands.moderation.warnings.none', {
						user: targetUser.tag,
					}),
					{
						color: 'Green',
					},
				);
				return interaction.editReply({
					components: reply,
					flags: MessageFlags.IsComponentsV2,
				});
			}
			const warningsList = userRecord.warnings
				.map(
					(w, i) =>
						`**${i + 1}.** ${w.reason} - <@${w.moderator}> (${new Date(w.date).toLocaleDateString()})`,
				)
				.join('\n');
			const reply = await createContainer(interaction, {
				color: kythiaConfig.bot.color,
				title: await t(
					interaction,
					'automod.commands.moderation.warnings.title',
					{
						user: targetUser.tag,
					},
				),
				description: warningsList,
				thumbnail: targetUser.displayAvatarURL(),
			});
			return interaction.editReply({
				components: reply,
				flags: MessageFlags.IsComponentsV2,
			});
		} catch (error) {
			const reply = await simpleContainer(
				interaction,
				await t(interaction, 'automod.commands.moderation.warnings.failed', {
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
exports.default = WarningsCommand;
