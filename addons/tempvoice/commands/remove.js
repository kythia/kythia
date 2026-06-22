/**
 * @namespace: addons/tempvoice/commands/remove.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { ChannelType, MessageFlags } = require('discord.js');
const { BaseCommand } = require('kythia-core');
class RemoveCommand extends BaseCommand {
	subcommand = true;
	slashCommand = (subcommand) =>
		subcommand
			.setName('remove')
			.setDescription('Disable the tempvoice system and remove the panel.');
	async execute(interaction) {
		const container = this.container;
		const { models, logger, client, helpers, t } = container;
		const { TempVoiceConfig, TempVoiceChannel } = models;
		const { simpleContainer } = helpers.discord;
		const guildId = interaction.guild.id;
		await interaction.deferReply({
			flags: MessageFlags.Ephemeral,
		});
		const config = await TempVoiceConfig.getCache({
			guildId: guildId,
		});
		if (!config) {
			return interaction.editReply({
				components: await simpleContainer(
					interaction,
					await t(interaction, 'tempvoice.commands.remove.unset.not_setup'),
					{
						color: 'Yellow',
					},
				),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}
		const deleteReason = await t(
			interaction,
			'tempvoice.commands.remove.unset.delete_reason',
		);
		const deleteReasonPanel = await t(
			interaction,
			'tempvoice.commands.remove.unset.delete_reason_panel',
		);
		const deleteReasonTrigger = await t(
			interaction,
			'tempvoice.commands.remove.unset.delete_reason_trigger',
		);
		const deleteReasonCategory = await t(
			interaction,
			'tempvoice.commands.remove.unset.delete_reason_category',
		);
		const activeChannels = await TempVoiceChannel.getAllCache({
			where: {
				guildId: guildId,
			},
		});
		const tempvoiceChannelIds = new Set(
			activeChannels.map((ac) => ac.channelId),
		);
		if (config.triggerChannelId)
			tempvoiceChannelIds.add(config.triggerChannelId);
		if (config.controlPanelChannelId)
			tempvoiceChannelIds.add(config.controlPanelChannelId);
		let shouldDeleteCategory = false;
		let category = null;
		let triggerChannel = null;
		let controlPanelChannel = null;
		if (config.categoryId) {
			try {
				category = await client.container.helpers.discord.getChannelGlobalSafe(
					client,
					config.categoryId,
				);
				if (category && category.type === ChannelType.GuildCategory) {
					const { getAllChannelsSafe } = client.container.helpers.discord;
					const allChannels = await getAllChannelsSafe(interaction.guild);
					const channelsInCategory = allChannels
						? allChannels.filter((c) => c.parentId === category.id)
						: [];
					const nonTempvoiceChannels = [];
					for (const ch of channelsInCategory.values()) {
						if (!tempvoiceChannelIds.has(ch.id)) {
							nonTempvoiceChannels.push(ch);
						}
					}
					if (nonTempvoiceChannels.length === 0) {
						shouldDeleteCategory = true;
						logger.info(
							`[TempVoice] Category will be deleted (no foreign channels found).`,
							{
								label: 'tempvoice',
							},
						);
					} else {
						logger.info(
							`[TempVoice] Category NOT deleted: ${nonTempvoiceChannels.length} foreign channel(s) found.`,
							{
								label: 'tempvoice',
							},
						);
					}
				}
			} catch (e) {
				logger.warn(`Failed while checking category: ${e.message}`, {
					label: 'tempvoice',
				});
			}
		}
		for (const ac of activeChannels) {
			const tempChannel =
				await client.container.helpers.discord.getChannelGlobalSafe(
					client,
					ac.channelId,
				);
			if (tempChannel)
				await tempChannel.delete(deleteReason).catch((e) =>
					logger.warn(
						`[TempVoice] Failed to delete temp channel: ${e.message}`,
						{
							label: 'tempvoice',
						},
					),
				);
			await ac.destroy();
		}
		if (config.controlPanelChannelId) {
			controlPanelChannel =
				await client.container.helpers.discord.getChannelGlobalSafe(
					client,
					config.controlPanelChannelId,
				);
			if (controlPanelChannel) {
				if (
					!shouldDeleteCategory ||
					(category && controlPanelChannel.parentId !== category.id)
				) {
					await controlPanelChannel.delete(deleteReasonPanel).catch((e) =>
						logger.warn(
							`[TempVoice] Failed to delete control panel: ${e.message}`,
							{
								label: 'tempvoice',
							},
						),
					);
				}
			}
		}
		if (config.triggerChannelId) {
			triggerChannel =
				await client.container.helpers.discord.getChannelGlobalSafe(
					client,
					config.triggerChannelId,
				);
			if (triggerChannel) {
				if (
					!shouldDeleteCategory ||
					(category && triggerChannel.parentId !== category.id)
				) {
					await triggerChannel.delete(deleteReasonTrigger).catch((e) =>
						logger.warn(`Failed to delete trigger: ${e.message}`, {
							label: 'tempvoice',
						}),
					);
				}
			}
		}
		if (category && shouldDeleteCategory) {
			await category.delete(deleteReasonCategory).catch((e) =>
				logger.warn(`Failed to delete category: ${e.message}`, {
					label: 'tempvoice',
				}),
			);
		}
		await config.destroy();
		return interaction.editReply({
			components: await simpleContainer(
				interaction,
				await t(interaction, 'tempvoice.commands.remove.unset.success_content'),
				{
					color: 'Red',
				},
			),
			flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
		});
	}
}
exports.default = RemoveCommand;
