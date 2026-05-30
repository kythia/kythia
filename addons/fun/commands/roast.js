/**
 * @namespace: addons/fun/commands/roast.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	MessageFlags,
	ContainerBuilder,
	SeparatorBuilder,
	TextDisplayBuilder,
	SlashCommandBuilder,
	SeparatorSpacingSize,
} = require('discord.js');
const axios = require('axios');

module.exports = {
	slashCommand: new SlashCommandBuilder()
		.setName('roast')
		.setDescription('🔥 Roast someone with a savage insult')
		.addUserOption((option) =>
			option
				.setName('user')
				.setDescription('The user to roast')
				.setRequired(false),
		),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t, kythiaConfig, helpers } = container;

		await interaction.deferReply();

		const target = interaction.options.getUser('user') ?? interaction.user;
		const isSelf = target.id === interaction.user.id;

		let insult;
		try {
			const response = await axios.get(
				'https://evilinsult.com/generate_insult.php?lang=en&type=json',
				{ timeout: 8000 },
			);
			insult = response.data?.insult;
		} catch {
			return interaction.editReply({
				content: await t(interaction, 'fun.roast.error.fetch'),
			});
		}

		if (!insult) {
			return interaction.editReply({
				content: await t(interaction, 'fun.roast.error.fetch'),
			});
		}

		const accentColor = helpers.color.convertColor(kythiaConfig.bot.color, {
			from: 'hex',
			to: 'decimal',
		});

		const headerKey = isSelf ? 'fun.roast.title.self' : 'fun.roast.title.other';

		const roastContainer = new ContainerBuilder()
			.setAccentColor(accentColor)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					await t(interaction, headerKey, {
						author: interaction.user.toString(),
						target: target.toString(),
					}),
				),
			)
			.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					await t(interaction, 'fun.roast.insult', { insult }),
				),
			)
			.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					await t(interaction, 'common.container.footer', {
						username: interaction.client.user.username,
					}),
				),
			);

		await interaction.editReply({
			components: [roastContainer],
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
