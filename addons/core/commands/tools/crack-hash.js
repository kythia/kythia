/**
 * @namespace: addons/core/commands/tools/crack-hash.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags, SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

const { BaseCommand } = require('kythia-core');
const cryptoHelper = require('../../helpers/crypto');

class CrackHashCommand extends BaseCommand {
	slashCommand = new SlashCommandBuilder()
		.setName('crack-hash')
		.setDescription(
			'🔍 Try to lookup a hash from public databases (MD5, SHA1, SHA256, SHA512).',
		)
		.addStringOption((option) =>
			option
				.setName('algorithm')
				.setDescription('The hash algorithm to lookup')
				.setRequired(true)
				.addChoices(...cryptoHelper.SUPPORTED_HASHES),
		)
		.addStringOption((option) =>
			option
				.setName('hash')
				.setDescription('The hash to try to lookup')
				.setRequired(true),
		);

	async execute(interaction) {
		const container = this.container;
		const { t, kythiaConfig, helpers, logger } = container;
		const { createContainer } = helpers.discord;

		await interaction.deferReply();

		const algorithm = interaction.options.getString('algorithm');
		const hash = interaction.options.getString('hash').toLowerCase();

		const hashLengths = { md5: 32, sha1: 40, sha256: 64, sha512: 128 };
		if (hash.length !== hashLengths[algorithm]) {
			const components = await createContainer(interaction, {
				description: await t(
					interaction,
					'core.tools.crackhash.invalid.hash.length',
					{
						algorithm: algorithm.toUpperCase(),
						hashLength: hashLengths[algorithm],
					},
				),
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const { SUPPORTED_HASHES } = cryptoHelper;
		const algoObj = SUPPORTED_HASHES.find((a) => a.value === algorithm);

		let resultText = await t(interaction, 'core.tools.crackhash.not.found');
		let _found = false;

		try {
			const response = await axios.get(
				`https://hashes.com/api.php?act=get&hash=${hash}`,
			);

			if (
				response.data &&
				response.data.status === 'success' &&
				response.data.result
			) {
				const results = response.data.result;
				const foundHash = Object.values(results).find(
					(r) => r.hash === hash && r.plaintext,
				);

				if (foundHash) {
					resultText = `\`\`\`${foundHash.plaintext}\`\`\``;
					_found = true;
				}
			}
		} catch (error) {
			logger.error(`Hash lookup API error: ${error.message || error}`, {
				label: 'crack-hash',
			});
			resultText = await t(interaction, 'core.tools.crackhash.api.error');
		}

		const description =
			(await t(interaction, 'core.tools.crackhash.result.desc')) +
			'\n\n' +
			`**${await t(interaction, 'core.tools.crackhash.algorithm')}:** ${algoObj.name}\n\n` +
			`**${await t(interaction, 'core.tools.crackhash.hash')}:**\n\`\`\`${hash}\`\`\`\n\n` +
			`**${await t(interaction, 'core.tools.crackhash.result.text')}:**\n${resultText}`;

		const components = await createContainer(interaction, {
			description,
			color: kythiaConfig.bot.color,
		});

		await interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

exports.default = CrackHashCommand;
