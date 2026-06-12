/**
 * @namespace: addons/counting/commands/setup.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { ChannelType, MessageFlags } = require('discord.js');

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('setup')
			.setDescription('Configure the counting channel.')
			.addChannelOption((option) =>
				option
					.setName('channel')
					.setDescription('The channel to use for counting.')
					.addChannelTypes(ChannelType.GuildText)
					.setRequired(true),
			)
			.addStringOption((option) =>
				option
					.setName('mode')
					.setDescription('The number format to use.')
					.addChoices(
						{ name: 'Normal Numbers (1, 2, 3...)', value: 'decimal' },
						{ name: 'Roman Numerals (I, II, III, IV...)', value: 'roman' },
						{ name: 'Binary / Hacker (1, 10, 11, 100...)', value: 'binary' },
						{ name: 'Hexadecimal (1...9, A, B, C...)', value: 'hex' },
					),
			)
			.addStringOption((option) =>
				option
					.setName('success_reaction')
					.setDescription('Emoji to react with when the number is correct.'),
			)
			.addStringOption((option) =>
				option
					.setName('fail_reaction')
					.setDescription('Emoji to react with when the number is wrong.'),
			)
			.addBooleanOption((option) =>
				option
					.setName('math')
					.setDescription('Allow math expressions (decimal mode only).'),
			)
			.addBooleanOption((option) =>
				option
					.setName('strict')
					.setDescription(
						'Enable strict counting. if 1 user false, count will reset to 0.',
					)
					.setRequired(false),
			),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { models, t, helpers } = container;
		const { Counting } = models;
		const { simpleContainer, getChannelSafe } = helpers.discord;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const channel = interaction.options.getChannel('channel');
		const strict = interaction.options.getBoolean('strict');
		const mode = interaction.options.getString('mode');
		const success = interaction.options.getString('success_reaction');
		const fail = interaction.options.getString('fail_reaction');
		const math = interaction.options.getBoolean('math');

		const existingCounting = await Counting.getCache({
			guildId: interaction.guild.id,
		});

		if (existingCounting) {
			await interaction.editReply({
				components: await simpleContainer(
					interaction,
					await t(interaction, 'counting.setup.already_configured'),
					{
						color: 'Red',
					},
				),
				flags: MessageFlags.IsComponentsV2,
			});
			return;
		}

		const createData = {
			guildId: interaction.guild.id,
			channelId: channel.id,
			currentCount: 0,
			lastUserId: null,
			mathEnabled: math !== null ? math : true,
			strictEnabled: strict !== null ? strict : false,
		};

		if (mode) createData.mode = mode;
		if (success) createData.successReaction = success;
		if (fail) createData.failReaction = fail;

		await Counting.create(createData);

		// const desc =

		const targetChannel = await getChannelSafe(interaction.client, channel.id);
		const desc = await t(interaction, 'counting.setup.start');

		targetChannel.send({
			components: await simpleContainer(interaction, desc, {
				color: 'Green',
			}),
			flags: MessageFlags.IsComponentsV2,
		});
		await interaction.editReply({
			components: await simpleContainer(
				interaction,
				await t(interaction, 'counting.setup.success', {
					channel: channel.toString(),
				}),
				{
					color: 'Green',
				},
			),
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
