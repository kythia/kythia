/**
 * @namespace: addons/automod/helpers/sendLogs.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

async function sendLogsWarning(
	message,
	reason,
	originalContent = null,
	setting,
	userId = message.author.id,
) {
	const container = message.client.container;
	const { t, helpers, models, logger } = container;
	const { getTextChannelSafe } = helpers.discord;
	const { convertColor } = helpers.color;
	const { ModLog } = models;

	// Send warning message in channel
	const warningMessage = await t(
		message,
		'core.helpers.system.warning.public',
		{
			userId,
			reason,
		},
	);
	const warning = await message.channel.send(warningMessage);
	setTimeout(() => warning.delete(), 10000);

	// Attempt to send a direct message warning to the user
	try {
		const dmEmbed = {
			color: convertColor('Red', { from: 'discord', to: 'decimal' }),
			description: await t(
				message,
				'core.helpers.system.warning.dm.description',
				{
					guildName: message.guild.name,
					reason,
				},
			),
			footer: {
				text: await t(message, 'common.embed.footer', {
					username: message.client.user.username,
				}),
				icon_url:
					message.client.user.displayAvatarURL({ dynamic: true }) || undefined,
			},
		};
		await message.author.send({ embeds: [dmEmbed] }).catch(() => {
			// Optionally log DM failure
			logger.warn(
				`Failed to send DM to ${message.author.tag}. DMs may be disabled.`,
				{
					label: 'core',
				},
			);
		});
	} catch (dmError) {
		logger.error(
			`Failed to send DM to ${message.author.tag}: ${dmError.message || dmError}`,
			{
				label: 'core',
			},
		);
	}

	// Log the action to the moderation log database
	try {
		await ModLog.create({
			guildId: message.guild.id,
			moderatorId: message.client.user.id,
			moderatorTag: message.client.user.tag,
			targetId: message.author.id,
			targetTag: message.author.tag,
			action: 'Automod Warning',
			reason: reason,
			channelId: message.channel.id,
		});
		logger.info(
			`Automod log for user ${message.author.tag} saved successfully.`,
			{
				label: 'core',
			},
		);
	} catch (dbError) {
		logger.error(
			`Failed to save moderation log to database: ${dbError.message || dbError}`,
			{
				label: 'core',
			},
		);
	}

	// Send a log embed to the moderation log channel, if configured
	const logChannel = await getTextChannelSafe(
		message.guild,
		setting.modLogChannelId,
	);
	if (logChannel) {
		const embed = {
			color: convertColor('Red', { from: 'discord', to: 'decimal' }),
			description: await t(
				message,
				'core.helpers.system.warning.log.description',
				{
					userId: message.author.id,
					userTag: message.author.tag,
					channelId: message.channel.id,
					channelName: message.channel.name,
					reason,
					originalContent: originalContent
						? originalContent.slice(0, 1000) +
							(originalContent.length > 1000 ? '... (truncated)' : '')
						: null,
				},
			),
			fields: [
				{
					name: await t(
						message,
						'core.helpers.system.warning.log.field.sentat',
					),
					value: `<t:${Math.floor(message.createdTimestamp / 1000)}:F>`,
				},
			],
			footer: {
				text: await t(message, 'common.embed.footer', {
					username: message.client.user.username,
				}),
				icon_url:
					message.client.user.displayAvatarURL({ dynamic: true }) || undefined,
			},
		};

		logChannel.send({ embeds: [embed] }).catch((e) => {
			logger.error(
				`Failed to send log embed to moderation log channel: ${e.message || e}`,
				{
					label: 'core',
				},
			);
		});
	}
}

module.exports = sendLogsWarning;
