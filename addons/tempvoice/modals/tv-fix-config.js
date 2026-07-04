/**
 * @namespace: addons/tempvoice/modals/tv-fix-config.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { MessageFlags, ComponentType } = require('discord.js');
const { BaseModal } = require('kythia-core');
class TvFixConfigModal extends BaseModal {
	modal = {
		customId: 'tv_fix_config_modal',
	};
	async execute(interaction) {
		const container = this.container;
		const { models, t } = container;
		const { TempVoiceConfig } = models;
		const guild = interaction.guild;
		await interaction.deferReply({
			flags: MessageFlags.Ephemeral,
		});
		const config = await TempVoiceConfig.getCache({
			where: {
				guildId: guild.id,
			},
		});
		if (!config)
			return interaction.editReply(
				await t(interaction, 'tempvoice.shared.fix_config.config_not_found'),
			);
		const getChannelId = (customId) => {
			try {
				const component = interaction.fields.fields.get(customId);
				if (component && component.type === ComponentType.ChannelSelect) {
					return component.values[0];
				}
				return null;
			} catch (_e) {
				return null;
			}
		};
		const newCatId = getChannelId('new_category_id');
		const newTrigId = getChannelId('new_trigger_id');
		const newIntId = getChannelId('new_interface_id');
		const logs = [
			await t(
				interaction,
				'tempvoice.modals.tv-fix-config.fix_config.applying_fixes',
			),
		];
		if (newCatId) {
			config.categoryId = newCatId;
			logs.push(
				await t(
					interaction,
					'tempvoice.modals.tv-fix-config.fix_config.category_updated',
					{
						id: newCatId,
					},
				),
			);
			try {
				const cat = await container.helpers.discord.getChannelSafe(
					guild,
					newCatId,
				);
				if (cat) {
					await cat.permissionOverwrites.edit(guild.members.me, {
						ViewChannel: true,
						ManageChannels: true,
						Connect: true,
						MoveMembers: true,
					});
					logs.push(
						await t(
							interaction,
							'tempvoice.modals.tv-fix-config.fix_config.perms_fixed',
						),
					);
				}
			} catch (_e) {
				logs.push(
					await t(
						interaction,
						'tempvoice.modals.tv-fix-config.fix_config.perms_warning',
					),
				);
			}
		}
		if (newTrigId) {
			config.triggerChannelId = newTrigId;
			logs.push(
				await t(
					interaction,
					'tempvoice.modals.tv-fix-config.fix_config.trigger_updated',
					{
						id: newTrigId,
					},
				),
			);
			try {
				const trig = await container.helpers.discord.getChannelSafe(
					guild,
					newTrigId,
				);
				if (trig) {
					await trig.lockPermissions().catch(() => {});
					logs.push(
						await t(
							interaction,
							'tempvoice.modals.tv-fix-config.fix_config.perms_synced',
						),
					);
				}
			} catch (_e) {
				logs.push(
					await t(
						interaction,
						'tempvoice.modals.tv-fix-config.fix_config.trigger_warning',
					),
				);
			}
		}
		if (newIntId) {
			config.controlPanelChannelId = newIntId;
			config.interfaceMessageId = null;
			logs.push(
				await t(
					interaction,
					'tempvoice.modals.tv-fix-config.fix_config.interface_updated',
					{
						id: newIntId,
					},
				),
			);
			logs.push(
				await t(
					interaction,
					'tempvoice.modals.tv-fix-config.fix_config.interface_regenerate',
				),
			);
		}
		await config.save();
		logs.push(
			await t(interaction, 'tempvoice.modals.tv-fix-config.fix_config.success'),
		);
		await interaction.editReply({
			content: logs.join('\n'),
		});
	}
}
exports.default = TvFixConfigModal;
