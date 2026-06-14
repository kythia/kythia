/**
 * @namespace: addons/fun/commands/act.js
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
} = require('discord.js');
const axios = require('axios');

const { BaseCommand } = require('kythia-core');

const VALID_ACTIONS = [
	'hug',
	'kiss',
	'pat',
	'slap',
	'cuddle',
	'wave',
	'highfive',
	'handhold',
	'bite',
	'bonk',
	'yeet',
	'dance',
	'poke',
	'wink',
	'smile',
	'blush',
	'happy',
	'cry',
	'nom',
	'kick',
	'smug',
];

class ActCommand extends BaseCommand {
	slashCommand = new SlashCommandBuilder()
		.setName('act')
		.setDescription('🤗 Perform an anime action with a user')
		.addStringOption((option) =>
			option
				.setName('action')
				.setDescription('The action to perform')
				.setRequired(true)
				.addChoices(
					{ name: 'Hug', value: 'hug' },
					{ name: 'Kiss', value: 'kiss' },
					{ name: 'Pat', value: 'pat' },
					{ name: 'Slap', value: 'slap' },
					{ name: 'Cuddle', value: 'cuddle' },
					{ name: 'Wave', value: 'wave' },
					{ name: 'High Five', value: 'highfive' },
					{ name: 'Handhold', value: 'handhold' },
					{ name: 'Bite', value: 'bite' },
					{ name: 'Bonk', value: 'bonk' },
					{ name: 'Yeet', value: 'yeet' },
					{ name: 'Dance', value: 'dance' },
					{ name: 'Poke', value: 'poke' },
					{ name: 'Wink', value: 'wink' },
					{ name: 'Smile', value: 'smile' },
					{ name: 'Blush', value: 'blush' },
					{ name: 'Happy', value: 'happy' },
					{ name: 'Cry', value: 'cry' },
					{ name: 'Nom', value: 'nom' },
					{ name: 'Kick', value: 'kick' },
					{ name: 'Smug', value: 'smug' },
				),
		)
		.addUserOption((option) =>
			option
				.setName('user')
				.setDescription('The user to perform the action on')
				.setRequired(false),
		);

	async execute(interaction) {
		const container = this.container;
		const { t, kythiaConfig, helpers } = container;

		const action = interaction.options.getString('action');
		const targetUser = interaction.options.getUser('user');
		const author = interaction.user;

		if (!VALID_ACTIONS.includes(action)) {
			return interaction.reply({
				content: await t(interaction, 'fun.act.errors.invalid_action'),
				flags: MessageFlags.Ephemeral,
			});
		}

		const apis = [
			async () =>
				(await axios.get(`https://api.waifu.pics/sfw/${action}`)).data?.url,
			async () =>
				(await axios.get(`https://nekos.best/api/v2/${action}`)).data
					?.results?.[0]?.url,
		];

		let gifUrl;
		for (const fetchApi of apis) {
			try {
				gifUrl = await fetchApi();
				if (gifUrl) break;
			} catch (_e) {}
		}

		if (!gifUrl) {
			throw new Error('No GIF URL received from API');
		}

		let actionText;
		if (targetUser) {
			if (targetUser.id === author.id) {
				actionText = await t(interaction, `fun.act.self.${action}`, {
					user: author.toString(),
				});
			} else if (targetUser.id === interaction.client.user.id) {
				actionText = await t(interaction, `fun.act.bot.${action}`, {
					user: author.toString(),
					bot: targetUser.toString(),
				});
			} else {
				actionText = await t(interaction, `fun.act.other.${action}`, {
					user: author.toString(),
					target: targetUser.toString(),
				});
			}
		} else {
			actionText = await t(interaction, `fun.act.none.${action}`, {
				user: author.toString(),
			});
		}

		const actionContainer = new ContainerBuilder()
			.setAccentColor(
				helpers.color.convertColor(kythiaConfig.bot.color, {
					from: 'hex',
					to: 'decimal',
				}),
			)
			.addTextDisplayComponents(new TextDisplayBuilder().setContent(actionText))
			.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			)
			.addMediaGalleryComponents(
				new MediaGalleryBuilder().addItems([
					new MediaGalleryItemBuilder().setURL(gifUrl),
				]),
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

		await interaction.reply({
			components: [actionContainer],
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

exports.default = ActCommand;
