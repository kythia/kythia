/**
 * @namespace: addons/verification/commands/status.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');

const { BaseCommand } = require('kythia-core');

const CAPTCHA_TYPES = [
	{ name: 'Math (multiple choice buttons)', value: 'math' },
	{ name: 'Emoji click (buttons)', value: 'emoji' },
	{ name: 'Image text (type the code)', value: 'image' },
];

class StatusCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('status')
			.setDescription('View current verification config');

	async execute(interaction) {
		const container = this.container;
		const { models, helpers, kythiaConfig, t } = container;
		const { simpleContainer, createContainer } = helpers.discord;
		const { VerificationConfig, ServerSetting } = models;
		const guildId = interaction.guild.id;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });
		const config = await VerificationConfig.getCache({ where: { guildId } });
		const settings = await ServerSetting.getCache({ guildId });

		if (!config) {
			const components = await simpleContainer(
				interaction,
				await t(interaction, 'verify.status.not.configured'),
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const typeLabel =
			CAPTCHA_TYPES.find((t) => t.value === config.captchaType)?.name ||
			config.captchaType;

		const desc = await t(interaction, 'verify.status.system', {
			systemStatus: settings?.verificationOn
				? '🟢 Enabled'
				: '🔴 Disabled (toggle via `/set features verificationOn`)',
			typeLabel: typeLabel,
			verifiedRole: config.verifiedRoleId
				? `<@${config.verifiedRoleId}>`
				: '❌ Not set',
			unverifiedRole: config.unverifiedRoleId
				? `<@${config.unverifiedRoleId}>`
				: 'None',
			channel: config.channelId ? `<#${config.channelId}>` : 'DM only',
			timeout: config.timeoutSeconds,
			maxAttempts: config.maxAttempts,
			kickOnFail: config.kickOnFail ? '✅' : '❌',
			kickOnTimeout: config.kickOnTimeout ? '✅' : '❌',
			logChannel: config.logChannelId ? `<#${config.logChannelId}>` : 'None',
			welcomeMessage: config.welcomeMessage ? '✅ Set' : 'None',
		});

		const components = await createContainer(interaction, {
			title: await t(interaction, 'verify.status.title'),
			description: desc,
			color: kythiaConfig.bot.color,
		});

		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

exports.default = StatusCommand;
