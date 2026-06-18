/**
 * @namespace: addons/fun/commands/fact.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	ButtonStyle,
	MessageFlags,
	ButtonBuilder,
	ActionRowBuilder,
	ContainerBuilder,
	SeparatorBuilder,
	TextDisplayBuilder,
	SlashCommandBuilder,
	SeparatorSpacingSize,
} = require('discord.js');
const axios = require('axios');
const { BaseCommand } = require('kythia-core');
class FactCommand extends BaseCommand {
	slashCommand = new SlashCommandBuilder()
		.setName('fact')
		.setDescription('Get a random useless (but interesting) fact');
	async execute(interaction) {
		const container = this.container;
		const { t, kythiaConfig, helpers } = container;
		await interaction.deferReply();
		const fetchFact = async () => {
			const response = await axios.get(
				'https://uselessfacts.jsph.pl/api/v2/facts/random?language=en',
				{
					timeout: 8000,
				},
			);
			return response.data?.text;
		};
		let fact;
		try {
			fact = await fetchFact();
		} catch {
			return interaction.editReply({
				content: await t(interaction, 'fun.fact.error.fetch'),
			});
		}
		if (!fact) {
			return interaction.editReply({
				content: await t(interaction, 'fun.fact.error.fetch'),
			});
		}
		const accentColor = helpers.color.convertColor(kythiaConfig.bot.color, {
			from: 'hex',
			to: 'decimal',
		});
		const buildContainer = async (factText) =>
			new ContainerBuilder()
				.setAccentColor(accentColor)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						await t(interaction, 'fun.fact.title', {
							fact: factText,
						}),
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
							.setCustomId('fact_another')
							.setLabel(await t(interaction, 'fun.fact.button.another'))
							.setStyle(ButtonStyle.Secondary)
							.setEmoji('🔄'),
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
		const msg = await interaction.editReply({
			components: [await buildContainer(fact)],
			flags: MessageFlags.IsComponentsV2,
		});
		const collector = msg.createMessageComponentCollector({
			time: 120_000,
		});
		collector.on('collect', async (btn) => {
			if (btn.customId !== 'fact_another') return;
			await btn.deferUpdate();
			try {
				const newFact = await fetchFact();
				await btn.editReply({
					components: [await buildContainer(newFact)],
					flags: MessageFlags.IsComponentsV2,
				});
			} catch {
				/* silently ignore re-fetch errors */
			}
		});
	}
}
exports.default = FactCommand;
