/**
 * @namespace: addons/streak/commands/setting/emoji.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags, PermissionFlagsBits } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class EmojiCommand extends BaseCommand {
	subcommand = true;
	permissions = [PermissionFlagsBits.ManageGuild];

	slashCommand = (subcommand) =>
		subcommand
			.setName('emoji')
			.setDescription('🔥 Set streak emoji')
			.addStringOption((option) =>
				option.setName('emoji').setDescription('Emoji').setRequired(true),
			);

	async execute(interaction) {
		const container = this.container;
		const { t, models, helpers } = container;
		const { ServerSetting } = models;
		const { simpleContainer } = helpers.discord;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const guildId = interaction.guild.id;
		const guildName = interaction.guild.name;
		const emoji = interaction.options.getString('emoji');

		const [serverSetting] = await ServerSetting.findOrCreateCache({
			where: { guildId },
			defaults: { guildId, guildName },
		});

		serverSetting.streakEmoji = emoji;
		await serverSetting.save();

		const components = await simpleContainer(
			interaction,
			await t(interaction, 'streak.streak.setting.emoji.set', {
				emoji,
			}),
			{ color: 'Green' },
		);
		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

exports.default = EmojiCommand;
