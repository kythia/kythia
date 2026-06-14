/**
 * @namespace: addons/quest/commands/remove.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { MessageFlags } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class RemoveCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('remove')
			.setDescription('Stop receiving Discord Quest notifications.');

	async execute(interaction) {
		const container = this.container;
		const { models, t, helpers } = container;
		const { simpleContainer } = helpers.discord;
		const { QuestConfig } = models;
		const guildId = interaction.guild.id;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const config = await QuestConfig.getCache({ guildId: guildId });
		if (!config) {
			const content = await t(interaction, 'questnotifier.unset.not_setup');
			return interaction.editReply({
				components: await simpleContainer(interaction, content, {
					color: 'Yellow',
				}),
				flags: MessageFlags.IsComponentsV2,
			});
		}

		await config.destroy();

		// const questLogs = await QuestGuildLog.getAllCache({ where: { guildId: guildId } });
		// await questLogs.destroy();

		const content = await t(interaction, 'questnotifier.unset.success');
		await interaction.editReply({
			components: await simpleContainer(interaction, content, { color: 'Red' }),
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

exports.default = RemoveCommand;
