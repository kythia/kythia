/**
 * @namespace: addons/core/commands/tools/decrypt.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const crypto = require('node:crypto');

const { BaseCommand } = require('kythia-core');

const ALGORITHM = 'aes-256-gcm';

class DecryptCommand extends BaseCommand {
	slashCommand = new SlashCommandBuilder()
		.setName('decrypt')
		.setDescription('🔓 Decrypt data using the correct secret key.')
		.addStringOption((option) =>
			option
				.setName('encrypted-data')
				.setDescription('The full encrypted string from the /encrypt command')
				.setRequired(true),
		)
		.addStringOption((option) =>
			option
				.setName('secret-key')
				.setDescription('The 32-character secret key used for encryption')
				.setRequired(true),
		);

	async execute(interaction) {
		const container = this.container;
		const { t, kythiaConfig, helpers } = container;
		const { createContainer } = helpers.discord;

		await interaction.deferReply();

		const encryptedData = interaction.options.getString('encrypted-data');
		const secretKey = interaction.options.getString('secret-key');

		if (secretKey.length !== 32) {
			const components = await createContainer(interaction, {
				description: await t(
					interaction,
					'core.tools.decrypt.invalid.key.length',
				),
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		try {
			const parts = encryptedData.split(':');
			if (parts.length !== 3) {
				const components = await createContainer(interaction, {
					description: await t(
						interaction,
						'core.tools.decrypt.invalid.data.format',
					),
					color: 'Red',
				});
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}

			const iv = Buffer.from(parts[0], 'hex');
			const authTag = Buffer.from(parts[1], 'hex');
			const encryptedText = parts[2];

			const decipher = crypto.createDecipheriv(
				ALGORITHM,
				Buffer.from(secretKey),
				iv,
			);

			decipher.setAuthTag(authTag);

			let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
			decrypted += decipher.final('utf8');

			const description = `**${await t(interaction, 'core.tools.decrypt.decrypted.plaintext')}:**\n\`\`\`${decrypted}\`\`\``;

			const components = await createContainer(interaction, {
				title: await t(interaction, 'core.tools.decrypt.success'),
				description,
				color: kythiaConfig.bot.color,
			});

			await interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		} catch (_error) {
			const components = await createContainer(interaction, {
				title: await t(interaction, 'core.tools.decrypt.failed.title'),
				description: await t(interaction, 'core.tools.decrypt.failed.desc'),
				color: 'Red',
			});
			await interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
	}
}

exports.default = DecryptCommand;
