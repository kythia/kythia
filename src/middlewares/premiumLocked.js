const {
	ContainerBuilder,
	TextDisplayBuilder,
	SeparatorBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	MessageFlags,
	SeparatorSpacingSize,
} = require('discord.js');

const TIER_LEVELS = {
	none: 0,
	cute: 1,
	powerful: 2,
	yours: 3,
	ecosystem: 4,
};

module.exports = {
	name: 'premiumLocked',
	priority: 14, // Before voteLocked (priority 15)

	/**
	 * @param {import('discord.js').Interaction} interaction
	 * @param {any} command
	 * @param {KythiaDI.Container} container
	 * @returns {Promise<boolean>}
	 */
	async execute(interaction, command, container) {
		if (!command.isPremium || command.isPremium === 'none') return true;
		if (container.helpers.discord.isOwner(interaction.user.id)) return true;

		const { t, helpers, redis, models, kythiaConfig } = container;
		const { KythiaUser } = models;

		// Skip if user is a team member
		const teamCacheKey = `kythia:middleware:teamOnly:${interaction.user.id}`;
		let isTeamMember = await redis.get(teamCacheKey);
		if (isTeamMember !== null) {
			isTeamMember = JSON.parse(isTeamMember);
		} else {
			isTeamMember = await helpers.discord.isTeam(
				container,
				interaction.user.id,
			);
			await redis.set(
				teamCacheKey,
				JSON.stringify(Boolean(isTeamMember)),
				'EX',
				1800,
			);
		}
		if (isTeamMember) return true;

		const requiredTierLevel = TIER_LEVELS[command.isPremium] || 0;

		// Get user's actual premium tier
		const premiumCacheKey = `kythia:middleware:premiumTier:${interaction.user.id}`;
		let userPremiumTier = await redis.get(premiumCacheKey);

		if (!userPremiumTier) {
			// Fetch from DB
			const user = await KythiaUser.getCache({ userId: interaction.user.id });

			// Check if premium is active
			let activeTier = 'none';
			if (user?.premiumTier) {
				if (
					user.premiumExpiresAt &&
					new Date(user.premiumExpiresAt).getTime() > Date.now()
				) {
					activeTier = user.premiumTier;
				} else if (!user.premiumExpiresAt) {
					// Lifetime or external premium
					activeTier = user.premiumTier;
				} else {
					// Expired
					user.premiumTier = 'none';
					user.premiumExpiresAt = null;
					user.changed('premiumTier', true);
					user.changed('premiumExpiresAt', true);
					await user.save();
				}
			}

			userPremiumTier = activeTier;
			// Cache for 5 minutes
			await redis.set(premiumCacheKey, userPremiumTier, 'EX', 300);
		}

		const userTierLevel = TIER_LEVELS[userPremiumTier] || 0;

		if (userTierLevel < requiredTierLevel) {
			const { convertColor } = helpers.color;
			const errContainer = new ContainerBuilder().setAccentColor(
				convertColor('Red', {
					from: 'discord',
					to: 'decimal',
				}),
			);

			const requiredTierName =
				command.isPremium.charAt(0).toUpperCase() + command.isPremium.slice(1);

			errContainer.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					await t(interaction, 'common.error.premium.locked.text', {
						tier: requiredTierName,
						username: interaction.client.user.username,
					}),
				),
			);

			errContainer.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			);

			errContainer.addActionRowComponents(
				new ActionRowBuilder().addComponents(
					new ButtonBuilder()
						.setLabel(
							await t(interaction, 'common.error.premium.locked.button'),
						)
						.setStyle(ButtonStyle.Link)
						.setURL(kythiaConfig.settings.patreon),
				),
			);

			errContainer.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			);

			errContainer.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					await t(interaction, 'common.container.footer', {
						username: interaction.client.user.username,
					}),
				),
			);

			if (interaction.isRepliable()) {
				await interaction.reply({
					components: [errContainer],
					flags: MessageFlags.IsComponentsV2,
				});
			}
			return false;
		}

		return true;
	},
};
