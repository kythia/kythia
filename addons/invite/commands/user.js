/**
 * @namespace: addons/invite/commands/user.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class UserCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('user')
			.setDescription('Check user invites')
			.addUserOption((option) =>
				option.setName('user').setDescription('User').setRequired(false),
			);

	async execute(interaction) {
		const container = this.container;
		await interaction.deferReply();
		const guildId = interaction.guild.id;
		const { t, models, helpers, kythiaConfig } = container;
		const { convertColor } = helpers.color;
		const { simpleContainer } = helpers.discord;
		const { Invite } = models;

		const target = interaction.options.getUser('user') || interaction.user;

		const row = await Invite.getCache({ guildId, userId: target.id });
		const invites = row?.invites || 0;
		const leaves = row?.leaves || 0;
		const fake = row?.fake || 0;

		const title = await t(interaction, 'invite.invite.command.title');
		const stats = await t(interaction, 'invite.invite.command.user.stats', {
			user: `<@${target.id}>`,
			invites,
			fake,
			leaves,
		});
		const content = `## ${title}\n${stats}`;

		const containers = await simpleContainer(interaction, content, {
			color: convertColor(kythiaConfig.bot.color, {
				from: 'hex',
				to: 'decimal',
			}),
		});

		return interaction.editReply({
			components: containers,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

exports.default = UserCommand;
