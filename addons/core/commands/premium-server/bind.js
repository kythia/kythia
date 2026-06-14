/**
 * @namespace: addons/core/commands/premium-server/bind.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class BindCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('bind')
			.setDescription('Bind your Premium tier to a server.')
			.addStringOption((option) =>
				option
					.setName('server_id')
					.setDescription(
						'The ID of the server (leave empty to bind current server)',
					)
					.setRequired(false),
			);

	async execute(interaction) {
		const container = this.container;
		const { helpers, models, translator } = container;
		const { simpleContainer } = helpers.discord;
		const { KythiaUser, PremiumServerBind } = models;
		const t = translator.t.bind(translator);

		const targetGuildId =
			interaction.options.getString('server_id') || interaction.guildId;
		const userId = interaction.user.id;

		if (!targetGuildId) {
			const components = await simpleContainer(
				interaction,
				await t(interaction, 'core.premium_server.no_server_id'),
				{ color: 'Red' },
			);
			return interaction.reply({ components, flags: MessageFlags.Ephemeral });
		}

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

		const existingBinds = await PremiumServerBind.getAllCache({
			where: { userId },
		});
		if (existingBinds.length >= maxSlots) {
			const components = await simpleContainer(
				interaction,
				await t(interaction, 'core.premium_server.bind.limit_reached', {
					used: maxSlots,
					max: maxSlots,
				}),
				{ color: 'Red' },
			);
			return interaction.editReply({ components });
		}

		const existingGuildBind = await PremiumServerBind.getCache({
			guildId: targetGuildId,
		});
		if (existingGuildBind) {
			if (existingGuildBind.userId === userId) {
				const components = await simpleContainer(
					interaction,
					await t(interaction, 'core.premium_server.bind.already_bound_self'),
					{ color: 'Yellow' },
				);
				return interaction.editReply({ components });
			}
			const components = await simpleContainer(
				interaction,
				await t(interaction, 'core.premium_server.bind.already_bound_other'),
				{ color: 'Red' },
			);
			return interaction.editReply({ components });
		}

		await PremiumServerBind.create({ guildId: targetGuildId, userId });

		const components = await simpleContainer(
			interaction,
			await t(interaction, 'core.premium_server.bind.success', {
				tier: activeTier.toUpperCase(),
				guildId: targetGuildId,
			}),
			{ color: 'Green' },
		);
		return interaction.editReply({ components });
	}
}

exports.default = BindCommand;
