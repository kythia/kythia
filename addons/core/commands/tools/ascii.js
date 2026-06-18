/**
 * @namespace: addons/core/commands/tools/ascii.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags, SlashCommandBuilder } = require('discord.js');
const figletFonts = require('@coreHelpers/figletFonts');
const figlet = require('figlet');
const { BaseCommand } = require('kythia-core');
class AsciiCommand extends BaseCommand {
	voteLocked = true;
	slashCommand = new SlashCommandBuilder()
		.setName('ascii')
		.setDescription('Generate ASCII art from your text using figlet.')
		.addStringOption((option) =>
			option
				.setName('text')
				.setDescription('The text to convert to ASCII art')
				.setRequired(true),
		)
		.addStringOption((option) =>
			option
				.setName('font')
				.setDescription(
					'The figlet font to use (eg: Standard, Slant, Larry 3D, etc.)',
				)
				.setRequired(false)
				.setAutocomplete(true),
		)
		.addBooleanOption((option) =>
			option
				.setName('allfonts')
				.setDescription('Generate ASCII art with ALL fonts')
				.setRequired(false),
		);
	cooldown = 15;
	async autocomplete(interaction) {
		const focusedValue = interaction.options.getFocused(true)?.value || '';
		const filteredFonts = figletFonts.filter((font) =>
			font.toLowerCase().includes(focusedValue.toLowerCase()),
		);
		await interaction.respond(
			filteredFonts.slice(0, 25).map((font) => ({
				name: font.length > 100 ? font.slice(0, 100) : font,
				value: font.length > 100 ? font.slice(0, 100) : font,
			})),
		);
	}
	async execute(interaction) {
		const container = this.container;
		const { t, helpers } = container;
		const { simpleContainer, createContainer } = helpers.discord;
		await interaction.deferReply();
		const text = interaction.options.getString('text');
		const font = interaction.options.getString('font') || 'Standard';
		const allFonts = interaction.options.getBoolean('allfonts') || false;
		if (!text || text.length > 20) {
			const components = await simpleContainer(
				interaction,
				await t(interaction, 'core.tools.ascii.invalid.text.allfonts'),
				{
					color: 'Red',
				},
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		if (allFonts) {
			const msg = await t(interaction, 'core.tools.ascii.generating', {
				text,
				count: figletFonts.length,
			});
			await interaction.editReply({
				components: await simpleContainer(interaction, msg),
				flags: MessageFlags.IsComponentsV2,
			});
			const containers = [];
			for (const f of figletFonts) {
				const data = await new Promise((resolve) => {
					figlet.text(
						text,
						{
							font: f,
						},
						(err, res) => {
							if (err || !res) return resolve(null);
							resolve(res);
						},
					);
				});
				if (data) {
					const asciiArt = `\`\`\`${data}\`\`\``;
					const block = `**${f}**\n${asciiArt}`;
					if (block.length > 4000) continue;

					// Create container for each font
					const container = await createContainer(interaction, {
						description: block,
					});
					containers.push(...container);

					// Send in batches of 5 to avoid hitting message limits
					if (containers.length >= 5) {
						await interaction.followUp({
							components: containers.splice(0, 5),
							flags: MessageFlags.IsComponentsV2,
						});
					}
				}
			}

			// Send remaining containers
			if (containers.length > 0) {
				await interaction.followUp({
					components: containers,
					flags: MessageFlags.IsComponentsV2,
				});
			}
		} else {
			figlet.text(
				text,
				{
					font,
				},
				async (err, data) => {
					if (err || !data) {
						const components = await simpleContainer(
							interaction,
							await t(interaction, 'core.tools.ascii.failed'),
							{
								color: 'Red',
							},
						);
						return interaction.editReply({
							components,
							flags: MessageFlags.IsComponentsV2,
						});
					}
					const asciiArt = `\`\`\`${data}\`\`\``;
					if (asciiArt.length > 4096) {
						const components = await simpleContainer(
							interaction,
							await t(interaction, 'core.tools.ascii.too.long'),
							{
								color: 'Red',
							},
						);
						return interaction.editReply({
							components,
							flags: MessageFlags.IsComponentsV2,
						});
					}
					const description = await t(
						interaction,
						'core.tools.ascii.embed.desc',
						{
							asciiArt,
							font,
						},
					);
					const components = await createContainer(interaction, {
						description,
					});
					await interaction.editReply({
						components,
						flags: MessageFlags.IsComponentsV2,
					});
				},
			);
		}
	}
}
exports.default = AsciiCommand;
