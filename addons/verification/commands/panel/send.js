/**
 * @namespace: addons/verification/commands/panel/send.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	ButtonStyle,
	MessageFlags,
	ButtonBuilder,
	ActionRowBuilder,
	ContainerBuilder,
	SeparatorBuilder,
	TextDisplayBuilder,
	SeparatorSpacingSize,
} = require('discord.js');
const { BaseCommand } = require('kythia-core');
class SendCommand extends BaseCommand {
	subcommand = true;
	slashCommand = (subcommand) =>
		subcommand
			.setName('send')
			.setDescription(
				'Send the interactive verification panel to the configured channel',
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
		const config = await VerificationConfig.getCache({
			where: {
				guildId,
			},
		});
		if (!config?.verifiedRoleId) {
			const components = await simpleContainer(
				interaction,
				await t(interaction, 'verify.setup.not.configured'),
				{
					color: 'Red',
				},
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		if (!config.channelId) {
			const components = await simpleContainer(
				interaction,
				'❌ A verification channel must be set before sending the panel. Use `/verify setup channel` to configure it.',
				{
					color: 'Red',
				},
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		const ch = await helpers.discord.getChannelSafe(
			interaction.guild,
			config.channelId,
		);
		if (!ch?.isTextBased()) {
			const components = await simpleContainer(
				interaction,
				'❌ The configured verification channel could not be found or is invalid.',
				{
					color: 'Red',
				},
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		let panelConfig = {};
		if (config.panelConfig) {
			try {
				panelConfig = JSON.parse(config.panelConfig);
			} catch {
				// skip
			}
		}
		const title = panelConfig.title || '🛡️ Server Verification';
		const description =
			panelConfig.description ||
			'Welcome! To gain access to the rest of the server, please click the button below to verify yourself.';
		const buttonText = panelConfig.buttonText || 'Verify Me';
		const color = panelConfig.color
			? parseInt(panelConfig.color.replace('#', ''), 16)
			: null;
		const containerPayload = new ContainerBuilder()
			.setAccentColor(color || kythiaConfig.bot.color)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(`## ${title}\n\n${description}`),
			)
			.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			)
			.addActionRowComponents(
				new ActionRowBuilder().addComponents(
					new ButtonBuilder()
						.setCustomId('verify_panel_btn')
						.setLabel(buttonText.slice(0, 80))
						.setStyle(ButtonStyle.Success)
						.setEmoji('🛡️'),
				),
			);
		const msg = await ch
			.send({
				components: [containerPayload],
				flags: MessageFlags.IsComponentsV2,
			})
			.catch(() => null);
		if (!msg) {
			const components = await simpleContainer(
				interaction,
				'❌ Failed to send panel to the channel. Please check my permissions.',
				{
					color: 'Red',
				},
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		config.panelMessageId = msg.id;
		await config.save();
		const components = await simpleContainer(
			interaction,
			await t(interaction, 'verify.panel.success', {
				channel: `<#${ch.id}>`,
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
exports.default = SendCommand;
