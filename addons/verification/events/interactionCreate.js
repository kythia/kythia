/**
 * @namespace: addons/verification/events/interactionCreate.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { MessageFlags } = require('discord.js');
const { sendCaptcha } = require('../helpers/verify');

const { BaseEvent } = require('kythia-core');

class InteractionCreateEvent extends BaseEvent {
	async execute(interaction) {
		const container = this.container;
		const bot = { client: this.client, container: this.container };

		if (!interaction.isButton()) return;
		if (interaction.customId !== 'verify_panel_btn') return;

		try {
			const { models, t, kythiaConfig, helpers } = container;
			const { VerificationConfig, ServerSetting } = models;
			const { simpleContainer } = helpers.discord;

			// Defer ephemeral so we have time to generate canvas (3s limit)
			await interaction.deferReply({ flags: MessageFlags.Ephemeral });

			// Check system enabled
			const settings = await ServerSetting.getCache({
				guildId: interaction.guild.id,
			});
			if (!settings?.verificationOn) {
				const comps = await simpleContainer(
					interaction,
					await t(interaction, 'verify.panel.disabled'),
					{ color: 'Red' },
				);
				return interaction.editReply({
					components: comps,
					flags: MessageFlags.IsComponentsV2,
				});
			}

			// Check config
			const config = await VerificationConfig.getCache({
				where: { guildId: interaction.guild.id },
			});
			if (!config?.verifiedRoleId) {
				const comps = await simpleContainer(
					interaction,
					await t(interaction, 'verify.panel.not.configured'),
					{ color: 'Red' },
				);
				return interaction.editReply({
					components: comps,
					flags: MessageFlags.IsComponentsV2,
				});
			}

			// Check already verified
			if (interaction.member.roles.cache.has(config.verifiedRoleId)) {
				const comps = await simpleContainer(
					interaction,
					await t(interaction, 'verify.panel.already.verified'),
					{ color: kythiaConfig.bot.color },
				);
				return interaction.editReply({
					components: comps,
					flags: MessageFlags.IsComponentsV2,
				});
			}

			// Dispatch captcha flow via ephemeral interaction
			await sendCaptcha(interaction.member, config, interaction);
		} catch (err) {
			this.container.logger.error(`Panel button error: ${err.message || err}`, {
				label: 'verification',
			});
		}
	}
}

module.exports = InteractionCreateEvent;
