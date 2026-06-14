/**
 * @namespace: addons/core/commands/tools/avatar.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	SlashCommandBuilder,
	MessageFlags,
	ApplicationCommandType,
	ContextMenuCommandBuilder,
} = require('discord.js');

const { BaseCommand } = require('kythia-core');

class AvatarCommand extends BaseCommand {
	slashCommand = new SlashCommandBuilder()
		.setName('avatar')
		.setDescription('🖼️ Show user avatar.')
		.addUserOption((option) =>
			option
				.setName('user')
				.setDescription('The user whose avatar you want to see.')
				.setRequired(false),
		);

	contextMenuCommand = new ContextMenuCommandBuilder()
		.setName('User Avatar')
		.setType(ApplicationCommandType.User);

	contextMenuDescription = '🖼️ Show user avatar.';

	async execute(interaction) {
		const container = this.container;
		const { t, kythiaConfig, helpers } = container;
		const { createContainer } = helpers.discord;

		await interaction.deferReply();

		const user =
			interaction.options.getUser('user') ||
			interaction.targetUser ||
			interaction.user;

		const avatarURL = user.displayAvatarURL({ dynamic: true, size: 1024 });

		const components = await createContainer(interaction, {
			title: user.tag,
			description: await t(interaction, 'core.tools.avatar.embed.desc', {
				url: avatarURL,
			}),
			media: [avatarURL],
			color: kythiaConfig.bot.color,
		});

		await interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

exports.default = AvatarCommand;
