/**
 * @namespace: addons/tempvoice/buttons/tv-fix-config.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const {
	ChannelType,
	LabelBuilder,
	MessageFlags,
	ModalBuilder,
	ChannelSelectMenuBuilder,
} = require('discord.js');
const { BaseButton } = require('kythia-core');
class TvFixConfigButton extends BaseButton {
	button = {
		customId: 'tv_fix_config',
	};
	async execute(interaction) {
		const container = this.container;
		const { models, helpers, t } = container;
		const { TempVoiceConfig } = models;
		const { simpleContainer } = helpers.discord;
		const config = await TempVoiceConfig.getCache({
			where: {
				guildId: interaction.guild.id,
			},
		});
		if (!config)
			return interaction.reply({
				components: await simpleContainer(
					interaction,
					await t(interaction, 'tempvoice.shared.fix_config.config_not_found'),
					{
						color: 'Red',
					},
				),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		const modal = new ModalBuilder()
			.setCustomId('tv_fix_config_modal')
			.setTitle(
				await t(
					interaction,
					'tempvoice.buttons.tv-fix-config.fix_config.modal_title',
				),
			);

		// Cek lagi apa yang hilang buat nentuin field modal
		const guild = interaction.guild;

		// 1. Category
		let catMissing = false;
		try {
			await helpers.discord.getChannelSafe(guild, config.categoryId);
		} catch {
			catMissing = true;
		}
		if (catMissing) {
			modal.addLabelComponents(
				new LabelBuilder()
					.setLabel(
						await t(
							interaction,
							'tempvoice.buttons.tv-fix-config.fix_config.labels.category',
						),
					)
					.setDescription(
						await t(
							interaction,
							'tempvoice.buttons.tv-fix-config.fix_config.labels.category_desc',
						),
					)
					.setChannelSelectMenuComponent(
						new ChannelSelectMenuBuilder()
							.setCustomId('new_category_id')
							.setPlaceholder(
								await t(
									interaction,
									'tempvoice.buttons.tv-fix-config.fix_config.labels.category_placeholder',
								),
							)
							.addChannelTypes(ChannelType.GuildCategory)
							.setMinValues(1)
							.setMaxValues(1)
							.setRequired(true),
					),
			);
		}

		// 2. Trigger Channel
		let trigMissing = false;
		try {
			await helpers.discord.getChannelSafe(guild, config.triggerChannelId);
		} catch {
			trigMissing = true;
		}
		if (trigMissing) {
			modal.addLabelComponents(
				new LabelBuilder()
					.setLabel(
						await t(
							interaction,
							'tempvoice.buttons.tv-fix-config.fix_config.labels.trigger',
						),
					)
					.setDescription(
						await t(
							interaction,
							'tempvoice.buttons.tv-fix-config.fix_config.labels.trigger_desc',
						),
					)
					.setChannelSelectMenuComponent(
						new ChannelSelectMenuBuilder()
							.setCustomId('new_trigger_id')
							.setChannelTypes(ChannelType.GuildVoice)
							.setPlaceholder(
								await t(
									interaction,
									'tempvoice.buttons.tv-fix-config.fix_config.labels.trigger_placeholder',
								),
							)
							.setRequired(true),
					),
			);
		}

		// 3. Interface Channel
		let intMissing = false;
		if (config.controlPanelChannelId) {
			try {
				await helpers.discord.getChannelSafe(
					guild,
					config.controlPanelChannelId,
				);
			} catch {
				intMissing = true;
			}
		}
		if (intMissing) {
			modal.addLabelComponents(
				new LabelBuilder()
					.setLabel(
						await t(
							interaction,
							'tempvoice.buttons.tv-fix-config.fix_config.labels.interface',
						),
					)
					.setDescription(
						await t(
							interaction,
							'tempvoice.buttons.tv-fix-config.fix_config.labels.interface_desc',
						),
					)
					.setChannelSelectMenuComponent(
						new ChannelSelectMenuBuilder()
							.setCustomId('new_interface_id')
							.setChannelTypes(ChannelType.GuildText)
							.setPlaceholder(
								await t(
									interaction,
									'tempvoice.buttons.tv-fix-config.fix_config.labels.interface_placeholder',
								),
							)
							.setRequired(true),
					),
			);
		}
		if (!catMissing && !trigMissing && !intMissing) {
			return interaction.reply({
				components: await simpleContainer(
					interaction,
					await t(
						interaction,
						'tempvoice.buttons.tv-fix-config.fix_config.all_good',
					),
					{
						color: 'Green',
					},
				),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}
		await interaction.showModal(modal);
	}
}
exports.default = TvFixConfigButton;
