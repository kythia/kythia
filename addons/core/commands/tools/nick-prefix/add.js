/**
 * @namespace: addons/core/commands/tools/nick-prefix/add.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { rolePrefix } = require('../../../helpers');
const { MessageFlags } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class AddCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('add')
			.setDescription('📛 Adds the highest role prefix to member nicknames.');

	async execute(interaction) {
		const container = this.container;
		const { t, helpers } = container;
		const { simpleContainer } = helpers.discord;

		await interaction.deferReply();

		const startedMsg = await t(interaction, 'core.tools.prefix.add.started');
		const startedComponents = await simpleContainer(interaction, startedMsg);

		await interaction.editReply({
			components: startedComponents,
			flags: MessageFlags.IsComponentsV2,
		});

		try {
			const updated = await rolePrefix(interaction.guild, container);
			const successMsg = await t(interaction, 'core.tools.prefix.add.success', {
				count: updated,
			});
			const successComponents = await simpleContainer(interaction, successMsg);

			try {
				await interaction.editReply({
					components: successComponents,
					flags: MessageFlags.IsComponentsV2,
				});
			} catch (_e) {
				await interaction.channel
					.send({
						content: `<@${interaction.user.id}>`,
						components: successComponents,
						flags: MessageFlags.IsComponentsV2,
					})
					.catch(() => {});
			}
		} catch (_e) {
			const errMsg = await t(interaction, 'core.tools.prefix.add.error');
			const errorComponents = await simpleContainer(interaction, errMsg, {
				color: 'Red',
			});
			try {
				await interaction.editReply({
					components: errorComponents,
					flags: MessageFlags.IsComponentsV2,
				});
			} catch (_e) {
				await interaction.channel
					.send({
						content: `<@${interaction.user.id}>`,
						components: errorComponents,
						flags: MessageFlags.IsComponentsV2,
					})
					.catch(() => {});
			}
		}
	}
}

exports.default = AddCommand;
