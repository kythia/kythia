/**
 * @namespace: addons/automod/commands/moderation/unmute.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags, PermissionFlagsBits } = require('discord.js');
const { BaseCommand } = require('kythia-core');
class UnmuteCommand extends BaseCommand {
	permissions = PermissionFlagsBits.MuteMembers;
	botPermissions = PermissionFlagsBits.MuteMembers;
	slashCommand = (subcommand) =>
		subcommand
			.setName('unmute')
			.setDescription('Unmutes a user in voice channels.')
			.addUserOption((option) =>
				option
					.setName('user')
					.setDescription('The user to unmute')
					.setRequired(true),
			);
	async execute(interaction) {
		const container = this.container;
		const { t, helpers, kythiaConfig } = container;
		const { createContainer, simpleContainer } = helpers.discord;
		await interaction.deferReply();
		const user = interaction.options.getUser('user');
		try {
			const member = await helpers.discord.getMemberSafe(
				interaction.guild,
				user.id,
			);
			if (member.voice.channel) {
				await member.voice.setMute(false);
				const reply = await createContainer(interaction, {
					color: kythiaConfig.bot.color,
					title: await t(
						interaction,
						'automod.moderation.unmute.success.title',
					),
					description: await t(
						interaction,
						'automod.moderation.unmute.success.desc',
						{
							user: user.tag,
						},
					),
					thumbnail: user.displayAvatarURL(),
				});
				return interaction.editReply({
					components: reply,
					flags: MessageFlags.IsComponentsV2,
				});
			} else {
				const reply = await simpleContainer(
					interaction,
					await t(interaction, 'automod.moderation.unmute.not.in.voice'),
					{
						color: 'Red',
					},
				);
				return interaction.editReply({
					components: reply,
					flags: MessageFlags.IsComponentsV2,
				});
			}
		} catch (error) {
			const reply = await simpleContainer(
				interaction,
				await t(interaction, 'automod.moderation.unmute.failed', {
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
exports.default = UnmuteCommand;
