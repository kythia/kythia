/**
 * @namespace: addons/core/commands/tools/hash.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const crypto = require('node:crypto');

const SUPPORTED_ALGOS = [
	{ name: 'MD5', value: 'md5' },
	{ name: 'SHA1', value: 'sha1' },
	{ name: 'SHA224', value: 'sha224' },
	{ name: 'SHA256', value: 'sha256' },
	{ name: 'SHA384', value: 'sha384' },
	{ name: 'SHA512', value: 'sha512' },
	{ name: 'SHA3-256', value: 'sha3-256' },
	{ name: 'SHA3-512', value: 'sha3-512' },
	{ name: 'RIPEMD160', value: 'ripemd160' },
];

module.exports = {
	slashCommand: new SlashCommandBuilder()
		.setName('hash')
		.setDescription(
			'🔒 Hash a text string using MD5, SHA, or other algorithms.',
		)
		.addStringOption((option) =>
			option
				.setName('algorithm')
				.setDescription('The hash algorithm to use')
				.setRequired(true)
				.addChoices(...SUPPORTED_ALGOS),
		)
		.addStringOption((option) =>
			option
				.setName('text')
				.setDescription('The text to hash')
				.setRequired(true),
		),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t, kythiaConfig, helpers } = container;
		const { createContainer } = helpers.discord;

		await interaction.deferReply();

		const algorithm = interaction.options.getString('algorithm');
		const text = interaction.options.getString('text');

		if (!text || text.length > 1024) {
			const components = await createContainer(interaction, {
				description: await t(interaction, 'core.tools.hash.invalid.text'),
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const algoObj = SUPPORTED_ALGOS.find((a) => a.value === algorithm);
		if (!algoObj) {
			const components = await createContainer(interaction, {
				description: await t(interaction, 'core.tools.hash.invalid.algorithm'),
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		let hash;
		try {
			hash = crypto.createHash(algorithm).update(text, 'utf8').digest('hex');
		} catch (_e) {
			const components = await createContainer(interaction, {
				description: await t(interaction, 'core.tools.hash.failed.hash'),
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const description =
			`**${await t(interaction, 'core.tools.hash.algorithm')}:** ${algoObj.name}\n\n` +
			`**${await t(interaction, 'core.tools.hash.input')}:**\n\`\`\`${text}\`\`\`\n` +
			`**${await t(interaction, 'core.tools.hash.hash')}:**\n\`\`\`${hash}\`\`\``;

		const components = await createContainer(interaction, {
			title: await t(interaction, 'core.tools.hash.result'),
			description,
			color: kythiaConfig.bot.color,
		});

		await interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
