/**
 * @namespace: addons/checklist/commands/personal/list.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { getScopeMeta, getChecklistAndItems } = require('../../helpers');
const { MessageFlags } = require('discord.js');
const { BaseCommand } = require('kythia-core');
class ListCommand extends BaseCommand {
	subcommand = true;
	slashCommand = (subcommand) =>
		subcommand.setName('list').setDescription('View all personal checklist');
	async execute(interaction) {
		const container = this.container;
		// Dependency
		const { t, helpers } = container;
		const { createContainer } = helpers.discord;
		const guildId = interaction.guild?.id;
		const userId = interaction.user.id; // Personal scope
		const group = 'personal';
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
			await interaction.deferReply({
				ephemeral,
			});
			const msg =
				(await t(
					interaction,
					'checklist.helpers.index.server.toggle.empty.title',
					{
						scope: await t(interaction, scopeKey),
					},
				)) +
				'\n' +
				(await t(
					interaction,
					'checklist.helpers.index.server.list.list.empty.desc',
				));
			const components = await createContainer(interaction, {
				description: msg,
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		// Build checklist description
		let description = '';
		for (let i = 0; i < items.length; i++) {
			const item = items[i];
			description += `${item.checked ? '✅' : '⬜'} \`${i + 1}\` ${item.text}\n`;
		}
		await interaction.deferReply({
			ephemeral,
		});
		const title = await t(
			interaction,
			'checklist.helpers.index.server.list.list.title',
			{
				scope: await t(interaction, scopeKey),
			},
		);
		const components = await createContainer(interaction, {
			title,
			description: description.trim(),
			color: colorName,
		});
		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}
exports.default = ListCommand;
