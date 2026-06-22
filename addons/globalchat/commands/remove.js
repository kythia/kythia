/**
 * @namespace: addons/globalchat/commands/remove.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const fetch = require('node-fetch');
const { BaseCommand } = require('kythia-core');
class RemoveCommand extends BaseCommand {
	subcommand = true;
	slashCommand = (subcommand) =>
		subcommand
			.setName('remove')
			.setDescription('Remove this server from the global chat network');
	async execute(interaction) {
		const container = this.container;
		const { t, models, kythiaConfig, helpers, logger } = container;
		const { GlobalChat } = models;
		const { simpleContainer } = helpers.discord;
		const apiUrl = kythiaConfig?.addons?.globalchat?.apiUrl;
		await interaction.deferReply();
		const localDbChat = await GlobalChat.getCache({
			guildId: interaction.guild.id,
		});
		if (localDbChat) {
			await localDbChat.destroy();
		}
		try {
			const res = await fetch(`${apiUrl}/remove/${interaction.guild.id}`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${kythiaConfig.addons.globalchat.apiKey}`,
				},
			});
			const resJson = await res.json();
			if (resJson.status === 'ok') {
				const components = await simpleContainer(
					interaction,
					await t(interaction, 'globalchat.commands.remove.success'),
					{
						color: 'Green',
					},
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			} else if (resJson.code === 'GUILD_NOT_FOUND') {
				const components = await simpleContainer(
					interaction,
					await t(interaction, 'globalchat.commands.remove.not.found'),
					{
						color: 'Orange',
					},
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			} else {
				const components = await simpleContainer(
					interaction,
					await t(interaction, 'globalchat.commands.remove.failed'),
					{
						color: 'Red',
					},
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
		} catch (error) {
			logger.error(
				`Failed to remove guild from global chat via API: ${error.message || error}`,
				{
					label: 'globalchat',
				},
			);
			const components = await simpleContainer(
				interaction,
				await t(interaction, 'globalchat.commands.remove.error'),
				{
					color: 'Red',
				},
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
	}
}
exports.default = RemoveCommand;
