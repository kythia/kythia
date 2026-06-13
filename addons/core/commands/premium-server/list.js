/**
 * @namespace: addons/core/commands/premium-server/list.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('list')
			.setDescription('List all servers bound to your Premium tier.'),

	async execute(interaction, container) {
		const { helpers, models, translator } = container;
		const { simpleContainer } = helpers.discord;
		const { KythiaUser, PremiumServerBind } = models;
		const userId = interaction.user.id;
		const t = translator.t.bind(translator);

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		let maxSlots = 0;
		let activeTier = 'none';
		const isOwner = helpers.discord.isOwner(userId);

		if (isOwner) {
			maxSlots = 100;
			activeTier = 'yours';
		} else {
			const user = await KythiaUser.getCache({ userId });
			if (
				user?.premiumTier &&
				user?.premiumExpiresAt &&
				new Date(user.premiumExpiresAt) > new Date()
			) {
				activeTier = user.premiumTier;
				if (activeTier === 'yours') maxSlots = 1;
				if (activeTier === 'ecosystem') maxSlots = 3;
			}
		}

		if (maxSlots === 0) {
			const components = await simpleContainer(
				interaction,
				await t(interaction, 'core.premium_server.access_denied'),
				{ color: 'Red' },
			);
			return interaction.editReply({ components });
		}

		const binds = await PremiumServerBind.getAllCache({ where: { userId } });

		let text = await t(interaction, 'core.premium_server.list.header', {
			tier: activeTier.toUpperCase(),
			used: binds.length,
			max: maxSlots,
		});

		if (binds.length === 0) {
			text += await t(interaction, 'core.premium_server.list.empty');
		} else {
			const items = await Promise.all(
				binds.map((b, i) =>
					t(interaction, 'core.premium_server.list.item', {
						index: i + 1,
						guildId: b.guildId,
					}),
				),
			);
			text += items.join('');
		}

		const components = await simpleContainer(interaction, text, {
			color: '#00ffff',
		});
		return interaction.editReply({ components });
	},
};
