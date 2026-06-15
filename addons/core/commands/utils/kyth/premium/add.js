/**
 * @namespace: addons/core/commands/utils/kyth/premium/add.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class AddCommand extends BaseCommand {
	slashCommand = (subcommand) =>
		subcommand
			.setName('add')
			.setDescription('Add a user to premium')
			.addUserOption((option) =>
				option
					.setName('user')
					.setDescription('User to grant premium')
					.setRequired(true),
			)
			.addIntegerOption((option) =>
				option
					.setName('days')
					.setDescription('Number of premium days (default 30)')
					.setRequired(false),
			);

	async execute(interaction) {
		const container = this.container;
		const { t, models, helpers } = container;
		const { KythiaUser } = models;
		const { simpleContainer } = helpers.discord;

		await interaction.deferReply();

		const user = interaction.options.getUser('user');
		const days = interaction.options.getInteger('days') ?? 30;
		const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

		await KythiaUser.updateOrCreateCache(
			{ userId: user.id },
			{ isPremium: true, premiumExpiresAt: expiresAt },
		);

		const msg = await t(interaction, 'core.premium.premium.add.success', {
			user: `<@${user.id}>`,
			days,
			expires: `<t:${Math.floor(expiresAt.getTime() / 1000)}:R>`,
		});

		const components = await simpleContainer(interaction, msg, {
			color: 'Red',
		});

		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

exports.default = AddCommand;
