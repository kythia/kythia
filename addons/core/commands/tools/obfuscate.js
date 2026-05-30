/**
 * @namespace: addons/core/commands/tools/obfuscate.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	SlashCommandBuilder,
	AttachmentBuilder,
	MessageFlags,
} = require('discord.js');
const JavaScriptObfuscator = require('javascript-obfuscator');
const axios = require('axios');

module.exports = {
	slashCommand: new SlashCommandBuilder()
		.setName('obfuscate')
		.setDescription(
			'🔒 Obfuscate a Lua or JavaScript file and return it as an attachment.',
		)
		.addStringOption((option) =>
			option
				.setName('type')
				.setDescription('The type of script to obfuscate (lua/javascript)')
				.setRequired(true)
				.addChoices(
					{ name: 'javascript', value: 'javascript' },
					{ name: 'lua', value: 'lua' },
				),
		)
		.addAttachmentOption((option) =>
			option
				.setName('file')
				.setDescription('The script file to obfuscate')
				.setRequired(true),
		),
	async execute(interaction, container) {
		const { t, logger } = container;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const type = interaction.options.getString('type');
		const file = interaction.options.getAttachment('file');

		if (!file?.url) {
			return interaction.editReply({
				content: await t(interaction, 'core.tools.obfuscate.no.file'),
				flags: MessageFlags.Ephemeral,
			});
		}

		let scriptText;
		try {
			const res = await axios.get(file.url);
			scriptText = res.data;
		} catch (_err) {
			return interaction.editReply({
				content: await t(interaction, 'core.tools.obfuscate.failed.download'),
				flags: MessageFlags.Ephemeral,
			});
		}

		let obfuscated, filename;
		if (type === 'javascript') {
			try {
				obfuscated = JavaScriptObfuscator.obfuscate(scriptText, {
					compact: true,
					controlFlowFlattening: true,
				}).getObfuscatedCode();
				filename = `${file.name.replace(/\.js$/i, '')}.obf.js`;
			} catch (_e) {
				return interaction.editReply({
					content: await t(
						interaction,
						'core.tools.obfuscate.failed.javascript',
					),
					flags: MessageFlags.Ephemeral,
				});
			}
		} else if (type === 'lua') {
			try {
				const response = await axios.post(
					'https://wearedevs.net/api/obfuscate',
					{ script: scriptText },
					{ headers: { 'Content-Type': 'application/json' } },
				);

				if (
					!response.data ||
					typeof response.data !== 'object' ||
					!response.data.success ||
					typeof response.data.obfuscated !== 'string' ||
					!response.data.obfuscated.trim()
				) {
					logger.error(
						'Unexpected response from Lua obfuscator:',
						response.data,
						{ label: 'obfuscate' },
					);
					return interaction.editReply({
						content: await t(interaction, 'core.tools.obfuscate.failed.lua'),
						flags: MessageFlags.Ephemeral,
					});
				}

				obfuscated = response.data.obfuscated.replace(
					/--\[\[\s*v\d+\.\d+\.\d+\s+https:\/\/wearedevs\.net\/obfuscator\s*\]\]/g,
					'--[[ obfuscated with kythia bot by kenndeclouv ]]',
				);
				filename = `${file.name.replace(/\.lua$/i, '')}.obf.lua`;
			} catch (error) {
				logger.error(`Error: ${error.message || error}`, {
					label: 'obfuscate',
				});
				return interaction.editReply({
					content: await t(interaction, 'core.tools.obfuscate.failed.lua'),
					flags: MessageFlags.Ephemeral,
				});
			}
		} else {
			return interaction.editReply({
				content: await t(interaction, 'core.tools.obfuscate.invalid.type'),
				flags: MessageFlags.Ephemeral,
			});
		}

		const buffer = Buffer.from(obfuscated, 'utf8');
		const attachment = new AttachmentBuilder(buffer, { name: filename });

		await interaction.editReply({
			content: await t(interaction, 'core.tools.obfuscate.success', { type }),
			flags: MessageFlags.Ephemeral,
			files: [attachment],
		});
	},
};
