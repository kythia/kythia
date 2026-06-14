/**
 * @namespace: addons/fun/commands/meme.js
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
	MediaGalleryBuilder,
	SlashCommandBuilder,
	SeparatorSpacingSize,
	MediaGalleryItemBuilder,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
} = require('discord.js');
const axios = require('axios');

const { BaseCommand } = require('kythia-core');

const SUBREDDITS = [
	'memes',
	'dankmemes',
	'me_irl',
	'AdviceAnimals',
	'funny',
	'ProgrammerHumor',
];

class MemeCommand extends BaseCommand {
	slashCommand = new SlashCommandBuilder()
		.setName('meme')
		.setDescription('😂 Get a random meme from Reddit')
		.addStringOption((option) =>
			option
				.setName('subreddit')
				.setDescription('Choose a subreddit to pull the meme from')
				.setRequired(false)
				.addChoices(
					{ name: '😂 Memes', value: 'memes' },
					{ name: '🔥 Dank Memes', value: 'dankmemes' },
					{ name: '🪞 Me IRL', value: 'me_irl' },
					{ name: '🐸 Advice Animals', value: 'AdviceAnimals' },
					{ name: '😄 Funny', value: 'funny' },
					{ name: '💻 Programmer Humor', value: 'ProgrammerHumor' },
				),
		);

	async execute(interaction) {
		const container = this.container;
		const { t, kythiaConfig, helpers } = container;

		await interaction.deferReply();

		const subreddit =
			interaction.options.getString('subreddit') ??
			SUBREDDITS[Math.floor(Math.random() * SUBREDDITS.length)];

		let meme;
		try {
			const response = await axios.get(
				`https://meme-api.com/gimme/${subreddit}`,
				{ timeout: 8000 },
			);
			meme = response.data;
		} catch {
			return interaction.editReply({
				content: await t(interaction, 'fun.meme.error.fetch'),
				flags: MessageFlags.Ephemeral,
			});
		}

		if (!meme?.url || meme.nsfw) {
			return interaction.editReply({
				content: await t(interaction, 'fun.meme.error.nsfw'),
				flags: MessageFlags.Ephemeral,
			});
		}

		const accentColor = helpers.color.convertColor(kythiaConfig.bot.color, {
			from: 'hex',
			to: 'decimal',
		});

		const memeContainer = new ContainerBuilder()
			.setAccentColor(accentColor)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					await t(interaction, 'fun.meme.title', {
						title: meme.title,
						subreddit: meme.subreddit,
						upvotes: meme.ups.toLocaleString(),
						author: meme.author,
					}),
				),
			)
			.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			)
			.addMediaGalleryComponents(
				new MediaGalleryBuilder().addItems([
					new MediaGalleryItemBuilder().setURL(meme.url),
				]),
			)
			.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			)
			.addActionRowComponents(
				new ActionRowBuilder().addComponents(
					new ButtonBuilder()
						.setLabel(await t(interaction, 'fun.meme.button.view'))
						.setStyle(ButtonStyle.Link)
						.setURL(meme.postLink)
						.setEmoji('🔗'),
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

		// const linkRow = ;

		await interaction.editReply({
			components: [memeContainer],
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

exports.default = MemeCommand;
