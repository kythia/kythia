/**
 * @namespace: addons/modmail/commands/close.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	MessageFlags,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ContainerBuilder,
	TextDisplayBuilder,
	SeparatorBuilder,
	SeparatorSpacingSize,
} = require('discord.js');

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('close')
			.setDescription('Close this modmail thread and generate a transcript.')
			.addStringOption((option) =>
				option
					.setName('reason')
					.setDescription(
						'Reason for closing this modmail (sent to transcript log).',
					)
					.setRequired(false)
					.setMaxLength(500),
			),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { models, t, helpers, kythiaConfig } = container;
		const { Modmail } = models;
		const { simpleContainer } = helpers.discord;
		const { convertColor } = helpers.color;

		// Verify this is actually a modmail thread
		const modmail = await Modmail.getCache({
			threadChannelId: interaction.channel.id,
			status: 'open',
		});

		if (!modmail) {
			const desc = await t(interaction, 'modmail.errors.not_a_modmail');
			return interaction.reply({
				components: await simpleContainer(interaction, desc, { color: 'Red' }),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}

		const reason = interaction.options.getString('reason') || null;
		const accentColor = convertColor(kythiaConfig.bot.color, {
			from: 'hex',
			to: 'decimal',
		});
		const footerText = await t(interaction, 'common.container.footer', {
			username: kythiaConfig.bot.name,
		});

		// Show confirmation UI with optional reason info
		const bodyLines = [
			await t(interaction, 'modmail.close.confirm_desc'),
			reason ? `\n> **Reason:** ${reason}` : '',
		].join('');

		const row = new ActionRowBuilder().addComponents(
			new ButtonBuilder()
				.setCustomId(
					reason
						? `mm-confirm-close:${encodeURIComponent(reason)}`
						: 'mm-confirm-close:',
				)
				.setLabel(await t(interaction, 'modmail.close.confirm_button'))
				.setStyle(ButtonStyle.Danger)
				.setEmoji('✅'),
			new ButtonBuilder()
				.setCustomId('mm-close-with-reason')
				.setLabel(await t(interaction, 'modmail.close.with_reason_button'))
				.setStyle(ButtonStyle.Secondary)
				.setEmoji('🔏'),
			new ButtonBuilder()
				.setCustomId('mm-cancel-close')
				.setLabel(await t(interaction, 'modmail.close.cancel_button'))
				.setStyle(ButtonStyle.Secondary)
				.setEmoji('❌'),
		);

		const confirmContainer = new ContainerBuilder()
			.setAccentColor(accentColor)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					await t(interaction, 'modmail.close.confirm_title'),
				),
			)
			.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			)
			.addTextDisplayComponents(new TextDisplayBuilder().setContent(bodyLines))
			.addActionRowComponents(row)
			.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(footerText),
			);

		return interaction.reply({
			components: [confirmContainer],
			flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
		});
	},
};
