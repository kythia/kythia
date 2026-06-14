/**
 * @namespace: addons/checklist/commands/server/clear.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { getChecklistAndItems, getScopeMeta } = require('../../helpers');
const { MessageFlags } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class ClearCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand.setName('clear').setDescription('Clear all server checklist');

	async execute(interaction) {
		const container = this.container;
		const { t, helpers } = container;
		const { simpleContainer } = helpers.discord;

		const guildId = interaction.guild?.id;
		const userId = null; // Server scope
		const group = 'server';

		const { checklist, items } = await getChecklistAndItems({
			container,
			guildId,
			userId,
		});
		const { scopeKey, colorName, ephemeral } = getScopeMeta(
			container,
			userId,
			group,
		);

		if (!checklist || !Array.isArray(items) || items.length === 0) {
			await interaction.deferReply({ ephemeral });
			const msg =
				(await t(interaction, 'checklist.server.clear.already.empty.title', {
					scope: await t(interaction, scopeKey),
				})) +
				'\n' +
				(await t(interaction, 'checklist.server.clear.clear.empty.desc'));
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		try {
			await checklist.update({ items: '[]' });
		} catch (_e) {
			await interaction.deferReply({ ephemeral });
			const msg =
				'Checklist Error\nFailed to clear checklist. Please try again.';
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		await interaction.deferReply({ ephemeral });
		const msg =
			(await t(interaction, 'checklist.server.clear.clear.success.title', {
				scope: await t(interaction, scopeKey),
			})) +
			'\n' +
			(await t(interaction, 'checklist.server.clear.clear.success.desc'));
		const components = await simpleContainer(interaction, msg, {
			color: colorName,
		});
		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

exports.default = ClearCommand;
