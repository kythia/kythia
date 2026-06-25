/**
 * @namespace: addons/core/helpers/handlers/ErrorHandler.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	ButtonStyle,
	MessageFlags,
	ButtonBuilder,
	WebhookClient,
	ActionRowBuilder,
	SeparatorBuilder,
	ContainerBuilder,
	TextDisplayBuilder,
	SeparatorSpacingSize,
} = require('discord.js');
const Sentry = require('@sentry/node');
class ErrorHandler {
	/**
	 * Handle error logging and reporting
	 * @param {Error} error - The error that occurred
	 * @param {Message} message - Discord message
	 * @param {KythiaDI.Container} container - Kythia container
	 */
	async handle(error, message, container) {
		const { logger, kythiaConfig } = container;

		if (error?.message?.includes('ECONNREFUSED')) {
			// Throttle database connection errors so we don't spam console/webhooks when db is down
			if (
				!global.__kythia_last_db_error ||
				Date.now() - global.__kythia_last_db_error > 60000
			) {
				global.__kythia_last_db_error = Date.now();
				logger.error(`Database connection refused: ${error.message || error}`, {
					label: 'ErrorHandler',
				});
			}
			return; // Skip sentry, user error, and webhook for repetitive db connection failures
		}

		// Log error
		logger.error(
			`Error in messageCreate handler for ${message.author ? message.author.tag : '???'}: ${error.message || error}`,
			{
				label: 'ErrorHandler',
			},
		);

		// Sentry report
		await this.sendToSentry(error, message, kythiaConfig);

		// Send user error message
		await this.sendUserError(message, container);

		// Webhook logging
		await this.sendWebhookLog(error, message, container);
	}
	sendToSentry(error, message, kythiaConfig) {
		if (kythiaConfig.sentry?.dsn && Sentry?.withScope) {
			try {
				Sentry.withScope((scope) => {
					if (message.author) {
						scope.setUser({
							id: message.author.id,
							username: message.author.tag,
						});
					}
					if (message.content) {
						scope.setTag('content', message.content);
					}
					if (message.guild) {
						scope.setContext('guild', {
							id: message.guild.id,
							name: message.guild.name,
						});
					}
					Sentry.captureException(error);
				});
			} catch (_e) {}
		}
	}
	async sendUserError(message, container) {
		const { kythiaConfig, t, helpers, logger } = container;
		const { convertColor } = helpers.color;
		try {
			const ownerFirstId = kythiaConfig.owner?.ids
				? kythiaConfig.owner.ids.split(',')[0].trim()
				: '';
			const components = [
				new ContainerBuilder()
					.setAccentColor(
						convertColor('Red', {
							from: 'discord',
							to: 'decimal',
						}),
					)
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(
							await t(message, 'common.error.generic'),
						),
					)
					.addSeparatorComponents(
						new SeparatorBuilder()
							.setSpacing(SeparatorSpacingSize.Small)
							.setDivider(true),
					)
					.addActionRowComponents(
						new ActionRowBuilder().addComponents(
							new ButtonBuilder()
								.setStyle(ButtonStyle.Link)
								.setLabel(
									await t(message, 'common.error.button.join.support.server'),
								)
								.setURL(kythiaConfig.settings.supportServer),
							new ButtonBuilder()
								.setStyle(ButtonStyle.Link)
								.setLabel(await t(message, 'common.error.button.contact.owner'))
								.setURL(`discord://-/users/${ownerFirstId}`),
						),
					),
			];
			if (message.channel && typeof message.reply === 'function') {
				await message
					.reply({
						components,
						flags: MessageFlags.IsComponentsV2,
					})
					.catch(() => {});
			} else if (message.author && typeof message.author.send === 'function') {
				await message.author
					.send({
						components,
						flags: MessageFlags.IsComponentsV2,
					})
					.catch(() => {});
			}
		} catch (e) {
			logger.error(
				`Failed to send messageCreate error message to user: ${e.message || e}`,
				{
					label: 'core:helpers:handlers:ErrorHandler',
				},
			);
		}
	}
	async sendWebhookLog(error, message, container) {
		const { kythiaConfig, logger, t } = container;
		try {
			if (
				kythiaConfig.api?.webhookErrorLogs &&
				kythiaConfig.settings &&
				kythiaConfig.settings.webhookErrorLogs === true
			) {
				const webhookClient = new WebhookClient({
					url: kythiaConfig.api.webhookErrorLogs,
				});
				const title = await t(
					message,
					'core.helpers.handlers.ErrorHandler.errorhandler.webhook.title',
					{
						user: message.author ? message.author.tag : '???',
					},
				);
				const footerContext = message.guild
					? `Error from server ${message.guild.name}`
					: 'Error from DM';
				const footer = await t(
					message,
					'core.helpers.handlers.ErrorHandler.errorhandler.webhook.footer',
					{
						context: footerContext,
					},
				);

				// Use Components V2 for webhook
				const errorContainer = new ContainerBuilder()
					.setAccentColor(16711680) // Red in decimal
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(
							`${title}\n\`\`\`${error?.stack ? error.stack : `${error}`}\`\`\``,
						),
					)
					.addSeparatorComponents(
						new SeparatorBuilder()
							.setSpacing(SeparatorSpacingSize.Small)
							.setDivider(true),
					)
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(footer),
					);
				await webhookClient.send({
					content: '\u200B',
					components: [errorContainer.toJSON()],
					flags: MessageFlags.IsComponentsV2,
				});
			}
		} catch (webhookErr) {
			logger.error(
				`Error sending messageCreate error webhook: ${webhookErr.message || webhookErr}`,
				{
					label: 'core',
				},
			);
		}
	}
}
module.exports = ErrorHandler;
