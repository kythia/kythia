/**
 * @namespace: addons/core/commands/utils/global-announcement/simple.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	MessageFlags,
	ModalBuilder,
	TextInputStyle,
	ActionRowBuilder,
	ContainerBuilder,
	SeparatorBuilder,
	TextInputBuilder,
	TextDisplayBuilder,
	SeparatorSpacingSize,
} = require('discord.js');
const { BaseCommand } = require('kythia-core');
const announcementHelper = require('../../../helpers/announcement');
class SimpleCommand extends BaseCommand {
	subcommand = true;
	slashCommand = (subcommand) =>
		subcommand
			.setName('simple')
			.setDescription(
				'Send a simple announcement using a simple components v2.',
			);
	async execute(interaction) {
		const container = this.container;
		const { t, logger, kythiaConfig, helpers } = container;
		const modal = new ModalBuilder()
			.setCustomId(`announcement-modal-embed_${interaction.user.id}`)
			.setTitle(
				await t(
					interaction,
					'core.commands.utils.global-announcement.simple.modal.title',
				),
			);
		modal.addComponents(
			new ActionRowBuilder().addComponents(
				new TextInputBuilder()
					.setCustomId('announcement-title')
					.setLabel(
						await t(
							interaction,
							'core.commands.utils.global-announcement.simple.modal.label.title',
						),
					)
					.setStyle(TextInputStyle.Short)
					.setRequired(true),
			),
			new ActionRowBuilder().addComponents(
				new TextInputBuilder()
					.setCustomId('announcement-content')
					.setLabel(
						await t(
							interaction,
							'core.commands.utils.global-announcement.simple.modal.label.content',
						),
					)
					.setStyle(TextInputStyle.Paragraph)
					.setRequired(true),
			),
		);
		await interaction.showModal(modal);
		const modalSubmit = await interaction
			.awaitModalSubmit({
				filter: (i) => i.customId.startsWith('announcement-modal-embed_'),
				time: 300_000,
			})
			.catch(() => null);
		if (!modalSubmit)
			return logger.warn(`Embed announcement modal timed out.`, {
				label: 'core',
			});
		await modalSubmit.deferReply({
			flags: MessageFlags.Ephemeral,
		});
		const title = modalSubmit.fields.getTextInputValue('announcement-title');
		const content = modalSubmit.fields.getTextInputValue(
			'announcement-content',
		);
		const { convertColor } = helpers.color;
		const containerMsg = new ContainerBuilder()
			.setAccentColor(
				convertColor(kythiaConfig.bot.color, {
					from: 'hex',
					to: 'decimal',
				}),
			)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					await t(
						interaction,
						'core.commands.utils.global-announcement.simple.prefix',
						{
							title,
							content,
						},
					),
				),
			)
			.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					await t(
						interaction,
						'core.commands.utils.global-announcement.simple.footer',
						{
							username: interaction.client.user.username,
							timestamp: Math.floor(Date.now() / 1000),
						},
					),
				),
			);
		const payload = {
			components: [containerMsg],
			flags: Number(MessageFlags.IsComponentsV2),
		};
		await announcementHelper.sendToAllGuilds(container, modalSubmit, payload);
	}
}
exports.default = SimpleCommand;
