/**
 * @namespace: addons/automod/events/autoModerationActionExecution.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const {
	MessageFlags,
	ContainerBuilder,
	SeparatorBuilder,
	TextDisplayBuilder,
	SeparatorSpacingSize,
} = require('discord.js');

const { BaseEvent } = require('kythia-core');

class AutoModerationActionExecutionEvent extends BaseEvent {
	async execute(execution) {
		const container = this.container;

		const { t, models, helpers } = container;
		const { ServerSetting } = models;
		const { convertColor } = helpers.color;

		const guildId = execution.guild.id;
		const ruleName = execution.ruleTriggerType.toString();

		const settings = await ServerSetting.getCache({
			guildId,
		});
		const locale = execution.guild.preferredLocale || 'en';

		if (!settings?.modLogChannelId) {
			return;
		}

		const logChannelId = settings.modLogChannelId;
		const logChannel = await execution.guild.channels
			.fetch(logChannelId)
			.catch(() => null);

		if (logChannel?.isTextBased()) {
			const components = [
				new ContainerBuilder()
					.setAccentColor(
						convertColor('Red', { from: 'discord', to: 'decimal' }),
					)
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(
							ruleName,
							'\n\n' +
								`**${await t(execution.guild, 'common.automod.field.user', {}, locale)}:** ${execution.user?.tag} (<@${execution.userId}>)\n` +
								`**${await t(execution.guild, 'common.automod.field.rule.trigger', {}, locale)}:** \`${ruleName}\``,
						),
					)
					.addSeparatorComponents(
						new SeparatorBuilder()
							.setSpacing(SeparatorSpacingSize.Small)
							.setDivider(true),
					)
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(
							`👤 **User ID:** ${execution.userId}\n` +
								`🕒 **Timestamp:** <t:${Math.floor(Date.now() / 1000)}:F>`,
						),
					)
					.addSeparatorComponents(
						new SeparatorBuilder()
							.setSpacing(SeparatorSpacingSize.Small)
							.setDivider(true),
					)
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(
							await t({ guildId }, 'common.container.footer', {
								username: this.client.user.username,
							}),
						),
					),
			];

			await logChannel.send({
				components,
				flags: MessageFlags.IsComponentsV2,
				allowedMentions: {
					parse: [],
				},
			});
		}
	}
}

module.exports = AutoModerationActionExecutionEvent;
