/**
 * @namespace: addons/verification/commands/reset.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { sendCaptcha } = require('../helpers/verify');
const { clearSession } = require('../helpers/session');
const { BaseCommand } = require('kythia-core');
class ResetCommand extends BaseCommand {
	subcommand = true;
	slashCommand = (subcommand) =>
		subcommand
			.setName('reset')
			.setDescription('Re-send captcha to a member')
			.addUserOption((option) =>
				option
					.setName('member')
					.setDescription('Target member')
					.setRequired(true),
			);
	async execute(interaction) {
		const container = this.container;
		const { models, helpers, kythiaConfig, t } = container;
		const { simpleContainer } = helpers.discord;
		const { VerificationConfig } = models;
		const guildId = interaction.guild.id;
		await interaction.deferReply({
			flags: MessageFlags.Ephemeral,
		});
		const user = interaction.options.getUser('member');
		const member = await helpers.discord.getMemberSafe(
			interaction.guild,
			user.id,
		);
		if (!member) {
			const components = await simpleContainer(
				interaction,
				await t(interaction, 'verify.member.not.found'),
				{
					color: kythiaConfig.bot.color,
				},
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		const config = await VerificationConfig.getCache({
			where: {
				guildId,
			},
		});
		if (!config) {
			const components = await simpleContainer(
				interaction,
				await t(interaction, 'verify.setup.not.configured'),
				{
					color: kythiaConfig.bot.color,
				},
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		clearSession(guildId, user.id);
		await sendCaptcha(member, config);
		const components = await simpleContainer(
			interaction,
			await t(interaction, 'verify.captcha.sent', {
				user: member.user.tag,
			}),
			{
				color: kythiaConfig.bot.color,
			},
		);
		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}
exports.default = ResetCommand;
