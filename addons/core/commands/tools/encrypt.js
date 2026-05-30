/**
 * @namespace: addons/core/commands/tools/encrypt.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const crypto = require('node:crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const _AUTH_TAG_LENGTH = 16;

module.exports = {
	slashCommand: new SlashCommandBuilder()
		.setName('encrypt')
		.setDescription('🔒 Encrypt a text with a secret key (two-way encryption).')
		.addStringOption((option) =>
			option
				.setName('text')
				.setDescription('The text you want to encrypt')
				.setRequired(true),
		)
		.addStringOption((option) =>
			option
				.setName('secret-key')
				.setDescription('A 32-character secret key for encryption')
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

		const text = interaction.options.getString('text');
		const secretKey = interaction.options.getString('secret-key');

		if (secretKey.length !== 32) {
			const components = await createContainer(interaction, {
				description: await t(
					interaction,
					'core.tools.encrypt.invalid.key.length',
				),
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const iv = crypto.randomBytes(IV_LENGTH);

		const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(secretKey), iv);

		let encrypted = cipher.update(text, 'utf8', 'hex');
		encrypted += cipher.final('hex');

		const authTag = cipher.getAuthTag();

		const encryptedData = `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;

		const description =
			(await t(interaction, 'core.tools.encrypt.embed.desc')) +
			'\n\n' +
			`**${await t(interaction, 'core.tools.encrypt.secret.key.used')}:**\n\`\`\`${'*'.repeat(32)}\`\`\`\n\n` +
			`**${await t(interaction, 'core.tools.encrypt.encrypted.data')}:**\n\`\`\`${encryptedData}\`\`\``;

		const components = await createContainer(interaction, {
			title: await t(interaction, 'core.tools.encrypt.success'),
			description,
			color: kythiaConfig.bot.color,
		});

		await interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
