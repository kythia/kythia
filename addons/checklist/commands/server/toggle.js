/**
 * @namespace: addons/checklist/commands/server/toggle.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { getScopeMeta, getChecklistAndItems } = require('../../helpers');
const { MessageFlags } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class ToggleCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('toggle')
			.setDescription('Toggle server checklist item complete/incomplete')
			.addIntegerOption((option) =>
				option
					.setName('index')
					.setDescription('Item number to toggle')
					.setRequired(true),
			);

	async execute(interaction) {
		const container = this.container;
		const { t, helpers } = container;
		const { createContainer } = helpers.discord;
		const { convertColor } = helpers.color;

		const guildId = interaction.guild?.id;
		const userId = null; // Server scope
		const group = 'server';

		const index = interaction.options.getInteger('index');
		if (!index || typeof index !== 'number' || index < 1) {
			await interaction.deferReply({ flags: MessageFlags.Ephemeral });
			const msg =
				(await t(interaction, 'checklist.server.toggle.invalid.index.title')) +
				'\n' +
				(await t(interaction, 'checklist.server.toggle.invalid.index.desc'));
			const components = await createContainer(interaction, {
				description: msg,
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
		const { scopeKey, ephemeral } = getScopeMeta(container, userId, group);

		if (!checklist || !Array.isArray(items) || items.length === 0) {
			await interaction.deferReply({ ephemeral });
			const msg =
				(await t(interaction, 'checklist.server.toggle.empty.title', {
					scope: await t(interaction, scopeKey),
				})) +
				'\n' +
				(await t(interaction, 'checklist.server.toggle.toggle.empty.desc'));
			const components = await createContainer(interaction, {
				description: msg,
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
			const components = await createContainer(interaction, {
				description: msg,
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		items[index - 1].checked = !items[index - 1].checked;
		try {
			await checklist.update({ items: JSON.stringify(items) });
		} catch (_e) {
			await interaction.deferReply({ ephemeral });
			const msg =
				'Checklist Error\nFailed to update checklist. Please try again.';
			const components = await createContainer(interaction, {
				description: msg,
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const checked = items[index - 1].checked;
		const color = checked
			? convertColor('Green', { from: 'discord', to: 'decimal' })
			: convertColor('Yellow', { from: 'discord', to: 'decimal' });
		const statusKey = checked
			? 'checklist.status.done'
			: 'checklist.status.undone';

		await interaction.deferReply({ ephemeral });
		const title = await t(
			interaction,
			'checklist.server.toggle.toggle.success.title',
			{
				scope: await t(interaction, scopeKey),
			},
		);
		const description =
			`**${await t(interaction, 'checklist.server.toggle.item.field')}:** \`${items[index - 1].text}\`\n` +
			`**${await t(interaction, 'checklist.server.toggle.status.field')}:** ${await t(interaction, statusKey)}`;

		const components = await createContainer(interaction, {
			title,
			description,
			color,
		});
		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

exports.default = ToggleCommand;
