/**
 * @namespace: addons/fun/commands/quote.js
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
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
} = require('discord.js');
const axios = require('axios');

const { BaseCommand } = require('kythia-core');

class QuoteCommand extends BaseCommand {
	slashCommand = new SlashCommandBuilder()
		.setName('quote')
		.setDescription('✨ Get a random inspirational quote');

	async execute(interaction) {
		const container = this.container;
		const { t, kythiaConfig, helpers } = container;

		await interaction.deferReply();

		const fetchQuote = async () => {
			const response = await axios.get('https://zenquotes.io/api/random', {
				timeout: 8000,
			});
			const data = Array.isArray(response.data)
				? response.data[0]
				: response.data;
			return { text: data.q, author: data.a };
		};

		let quote;
		try {
			quote = await fetchQuote();
		} catch {
			return interaction.editReply({
				content: await t(interaction, 'fun.quote.error.fetch'),
			});
		}

		if (!quote?.text) {
			return interaction.editReply({
				content: await t(interaction, 'fun.quote.error.fetch'),
			});
		}

		const accentColor = helpers.color.convertColor(kythiaConfig.bot.color, {
			from: 'hex',
			to: 'decimal',
		});

		const buildContainer = async (q) =>
			new ContainerBuilder()
				.setAccentColor(accentColor)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						await t(interaction, 'fun.quote.title', {
							text: q.text,
							author: q.author,
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
							.setCustomId('quote_another')
							.setLabel(await t(interaction, 'fun.quote.button.another'))
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
			components: [await buildContainer(quote)],
			flags: MessageFlags.IsComponentsV2,
		});

		const collector = msg.createMessageComponentCollector({ time: 120_000 });

		collector.on('collect', async (btn) => {
			if (btn.customId !== 'quote_another') return;
			await btn.deferUpdate();
			try {
				const newQuote = await fetchQuote();
				await btn.editReply({
					components: [await buildContainer(newQuote)],
					flags: MessageFlags.IsComponentsV2,
				});
			} catch {
				/* silently ignore re-fetch errors */
			}
		});
	}
}

exports.default = QuoteCommand;
