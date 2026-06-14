/**
 * @namespace: addons/checklist/commands/personal/remove.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { getScopeMeta, getChecklistAndItems } = require('../../helpers');
const { MessageFlags } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class RemoveCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('remove')
			.setDescription('Remove item from personal checklist')
			.addIntegerOption((option) =>
				option
					.setName('index')
					.setDescription('Item number to remove')
					.setRequired(true),
			);

	async execute(interaction) {
		const container = this.container;
		// Dependency
		const { t, helpers } = container;
		const { simpleContainer } = helpers.discord;

		const guildId = interaction.guild?.id;
		const userId = interaction.user.id; // Personal scope
		const group = 'personal';

		const index = interaction.options.getInteger('index');
		if (!index || typeof index !== 'number' || index < 1) {
			await interaction.deferReply({ flags: MessageFlags.Ephemeral });
			const msg =
				(await t(interaction, 'checklist.server.toggle.invalid.index.title')) +
				'\n' +
				(await t(interaction, 'checklist.server.toggle.invalid.index.desc'));
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const { checklist, items } = await getChecklistAndItems({
			container,
			guildId,
			userId,
		});
		const { scopeKey, color, ephemeral } = getScopeMeta(
			container,
			userId,
			group,
		);

		if (!checklist || !Array.isArray(items) || items.length === 0) {
			await interaction.deferReply({ ephemeral });
			const msg =
				(await t(interaction, 'checklist.server.toggle.empty.title', {
					scope: await t(interaction, scopeKey),
				})) +
				'\n' +
				(await t(interaction, 'checklist.server.remove.remove.empty.desc'));
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		if (index < 1 || index > items.length) {
			await interaction.deferReply({ ephemeral });
			const msg =
				(await t(interaction, 'checklist.server.toggle.invalid.index.title')) +
				'\n' +
				(await t(interaction, 'checklist.server.toggle.invalid.index.desc'));
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const removed = items.splice(index - 1, 1);
		try {
			await checklist.update({ items: JSON.stringify(items) });
		} catch (_e) {
			await interaction.deferReply({ ephemeral });
			const msg =
				'Checklist Error\nFailed to update checklist. Please try again.';
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
			(await t(interaction, 'checklist.server.remove.remove.success.title', {
				scope: await t(interaction, scopeKey),
			})) +
			'\n' +
			(await t(interaction, 'checklist.server.remove.remove.success.desc', {
				item: removed[0]?.text || '-',
			}));
		const components = await simpleContainer(interaction, msg, { color });
		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

exports.default = RemoveCommand;
