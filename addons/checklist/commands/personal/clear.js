/**
 * @namespace: addons/checklist/commands/personal/clear.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { getScopeMeta, getChecklistAndItems } = require('../../helpers');
const { MessageFlags } = require('discord.js');
const { BaseCommand } = require('kythia-core');
class ClearCommand extends BaseCommand {
	subcommand = true;
	slashCommand = (subcommand) =>
		subcommand.setName('clear').setDescription('Clear all personal checklist');
	async execute(interaction) {
		const container = this.container;
		// Dependency
		const { t, helpers } = container;
		const { simpleContainer } = helpers.discord;
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
					'checklist.helpers.index.server.clear.already.empty.title',
					{
						scope: await t(interaction, scopeKey),
					},
				)) +
				'\n' +
				(await t(
					interaction,
					'checklist.helpers.index.server.clear.clear.empty.desc',
				));
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		try {
			await checklist.update({
				items: '[]',
			});
		} catch (_e) {
			await interaction.deferReply({
				ephemeral,
			});
			const msg = await t(
				interaction,
				'checklist.commands.personal.clear.error',
			);
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		await interaction.deferReply({
			ephemeral,
		});
		const msg =
			(await t(
				interaction,
				'checklist.helpers.index.server.clear.clear.success.title',
				{
					scope: await t(interaction, scopeKey),
				},
			)) +
			'\n' +
			(await t(
				interaction,
				'checklist.helpers.index.server.clear.clear.success.desc',
			));
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
