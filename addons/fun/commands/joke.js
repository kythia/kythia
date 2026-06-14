/**
 * @namespace: addons/fun/commands/joke.js
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

class JokeCommand extends BaseCommand {
	slashCommand = new SlashCommandBuilder()
		.setName('joke')
		.setDescription('😂 Get a random joke with a hidden punchline')
		.addStringOption((option) =>
			option
				.setName('category')
				.setDescription('Choose a joke category')
				.setRequired(false)
				.addChoices(
					{ name: '🌍 General', value: 'general' },
					{ name: '🔨 Knock Knock', value: 'knock-knock' },
					{ name: '💻 Programming', value: 'programming' },
					{ name: '🌚 Dark', value: 'dark' },
					{ name: '😬 Pun', value: 'pun' },
					{ name: '🤪 Misc', value: 'misc' },
					{ name: '🎭 Spooky', value: 'spooky' },
					{ name: '🎄 Christmas', value: 'christmas' },
				),
		);

	async execute(interaction) {
		const container = this.container;
		const { t, kythiaConfig, helpers } = container;

		await interaction.deferReply();

		const category = interaction.options.getString('category') ?? 'general';

		let joke;
		try {
			const response = await axios.get(
				`https://official-joke-api.appspot.com/jokes/${category}/random`,
				{ timeout: 8000 },
			);
			// API returns an array
			joke = Array.isArray(response.data) ? response.data[0] : response.data;
		} catch {
			return interaction.editReply({
				content: await t(interaction, 'fun.joke.error.fetch'),
			});
		}

		if (!joke?.setup || !joke?.punchline) {
			return interaction.editReply({
				content: await t(interaction, 'fun.joke.error.fetch'),
			});
		}

		const accentColor = helpers.color.convertColor(kythiaConfig.bot.color, {
			from: 'hex',
			to: 'decimal',
		});

		// --- Setup (punchline hidden) ---
		const buildContainer = async (revealed) => {
			const container = new ContainerBuilder()
				.setAccentColor(accentColor)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						await t(interaction, 'fun.joke.setup', {
							category,
							setup: joke.setup,
						}),
					),
				)
				.addSeparatorComponents(
					new SeparatorBuilder()
						.setSpacing(SeparatorSpacingSize.Small)
						.setDivider(true),
				);

			if (revealed) {
				container.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						await t(interaction, 'fun.joke.punchline', {
							punchline: joke.punchline,
						}),
					),
				);
			} else {
				container.addActionRowComponents(
					new ActionRowBuilder().addComponents(
						new ButtonBuilder()
							.setCustomId('joke_reveal')
							.setLabel(await t(interaction, 'fun.joke.button.reveal'))
							.setStyle(ButtonStyle.Primary)
							.setEmoji('🥁'),
					),
				);
			}

			container
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

			return container;
		};

		const msg = await interaction.editReply({
			components: [await buildContainer(false)],
			flags: MessageFlags.IsComponentsV2,
		});

		const collector = msg.createMessageComponentCollector({ time: 60_000 });

		collector.on('collect', async (btn) => {
			if (btn.customId !== 'joke_reveal') return;
			await btn.update({
				components: [await buildContainer(true)],
				flags: MessageFlags.IsComponentsV2,
			});
			collector.stop();
		});
	}
}

exports.default = JokeCommand;
