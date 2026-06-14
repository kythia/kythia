/**
 * @namespace: addons/core/commands/utils/global-announcement/complex.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	ModalBuilder,
	TextInputStyle,
	TextInputBuilder,
	ActionRowBuilder,
	MessageFlags,
} = require('discord.js');
const { sendToAllGuilds } = require('./_command');

const { BaseCommand } = require('kythia-core');

class ComplexCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('complex')
			.setDescription('Send a complex announcement by pasting a JSON payload.');

	async execute(interaction) {
		const container = this.container;
		const { t, logger } = container;

		const modal = new ModalBuilder()
			.setCustomId(`announcement-modal-container_${interaction.user.id}`)
			.setTitle(
				await t(
					interaction,
					'core.utils.global-announcement.complex.modal.title',
				),
			);

		modal.addComponents(
			new ActionRowBuilder().addComponents(
				new TextInputBuilder()
					.setCustomId('announcement-json')
					.setLabel(
						await t(
							interaction,
							'core.utils.global-announcement.complex.modal.label',
						),
					)
					.setStyle(TextInputStyle.Paragraph)
					.setPlaceholder(
						await t(
							interaction,
							'core.utils.global-announcement.complex.modal.placeholder',
						),
					)
					.setRequired(true),
			),
		);
		await interaction.showModal(modal);

		const modalSubmit = await interaction
			.awaitModalSubmit({
				filter: (i) => i.customId.startsWith('announcement-modal-container_'),
				time: 300_000,
			})
			.catch(() => null);

		if (!modalSubmit)
			return logger.warn(`Container announcement modal timed out.`, {
				label: 'core',
			});

		await modalSubmit.deferReply({ flags: MessageFlags.Ephemeral });

		const jsonString =
			modalSubmit.fields.getTextInputValue('announcement-json');
		let payload;
		try {
			payload = JSON.parse(jsonString);
		} catch (err) {
			return modalSubmit.editReply({
				content: await t(
					interaction,
					'core.utils.global-announcement.complex.invalid.json',
					{ error: err.message },
				),
			});
		}
		await sendToAllGuilds(modalSubmit, payload);
	}
}

exports.default = ComplexCommand;
