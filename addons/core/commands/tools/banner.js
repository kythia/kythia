/**
 * @namespace: addons/core/commands/tools/banner.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	MessageFlags,
	SlashCommandBuilder,
	ApplicationCommandType,
	ContextMenuCommandBuilder,
} = require('discord.js');
const { BaseCommand } = require('kythia-core');
class BannerCommand extends BaseCommand {
	slashCommand = new SlashCommandBuilder()
		.setName('banner')
		.setDescription('Show user banner.')
		.addUserOption((option) =>
			option
				.setName('user')
				.setDescription('The user whose banner you want to see.')
				.setRequired(false),
		);
	contextMenuCommand = new ContextMenuCommandBuilder()
		.setName('User Banner')
		.setType(ApplicationCommandType.User);
	contextMenuDescription = '🖼️ Show user banner.';
	async execute(interaction) {
		const container = this.container;
		const { t, kythiaConfig, helpers } = container;
		const { createContainer, simpleContainer } = helpers.discord;
		await interaction.deferReply();
		const user =
			interaction.options.getUser('user') ||
			interaction.targetUser ||
			interaction.user;

		// Banner is only available on the full user object (fetch required)
		const fetchedUser = await helpers.discord.refreshObjectSafe(user);
		const bannerURL = fetchedUser.bannerURL({
			dynamic: true,
			size: 1024,
		});
		if (!bannerURL) {
			const nobannerComponents = await simpleContainer(
				interaction,
				await t(interaction, 'core.tools.banner.no_banner', {
					user: user.tag,
				}),
				{
					color: kythiaConfig.bot.color,
				},
			);
			return interaction.editReply({
				components: nobannerComponents,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		const components = await createContainer(interaction, {
			title: user.tag,
			description: await t(interaction, 'core.tools.banner.embed.desc', {
				url: bannerURL,
			}),
			media: [bannerURL],
			color: kythiaConfig.bot.color,
		});
		await interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}
exports.default = BannerCommand;
