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

module.exports = {
	name: 'voteLocked',
	priority: 15,

	/**
	 * @param {import('discord.js').Interaction} interaction
	 * @param {any} command
	 * @param {KythiaDI.Container} container
	 * @returns {Promise<boolean>}
	 */
	async execute(interaction, command, container) {
		if (!command.voteLocked) return true;
		if (container.helpers.discord.isOwner(interaction.user.id)) return true;

		const { kythiaConfig, t, helpers, redis } = container;

		// Skip vote lock if user is a team member
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

		// Skip vote lock if user is premium
		const premiumCacheKey = `kythia:middleware:premium:${interaction.user.id}`;
		let isPremiumUser = await redis.get(premiumCacheKey);
		if (isPremiumUser !== null) {
			isPremiumUser = JSON.parse(isPremiumUser);
		} else {
			isPremiumUser = await helpers.discord.isPremium(
				container,
				interaction.user.id,
			);
			await redis.set(
				premiumCacheKey,
				JSON.stringify(Boolean(isPremiumUser)),
				'EX',
				1800,
			);
		}
		if (isPremiumUser) return true;

		const { KythiaVoter } = container.models;
		const { convertColor } = helpers.color;

		if (!kythiaConfig.api.topgg.authToken) return true;

		const cacheKey = `kythia:middleware:voteLocked:${interaction.user.id}`;
		let isVoteLocked = await redis.get(cacheKey);

		if (isVoteLocked !== null) {
			isVoteLocked = JSON.parse(isVoteLocked);
		} else {
			const voter = await KythiaVoter.getCache({
				userId: interaction.user.id,
			});
			const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
			isVoteLocked = !voter || new Date(voter.votedAt) < twelveHoursAgo;

			if (!isVoteLocked) {
				// Cache that they are NOT vote locked for 30 minutes
				await redis.set(cacheKey, JSON.stringify(false), 'EX', 1800);
			} else {
				// Cache that they ARE vote locked for a short time (60s) so they can vote and retry quickly
				await redis.set(cacheKey, JSON.stringify(true), 'EX', 60);
			}
		}

		if (isVoteLocked) {
			const errContainer = new ContainerBuilder().setAccentColor(
				convertColor(kythiaConfig.bot.color, {
					from: 'hex',
					to: 'decimal',
				}),
			);

			errContainer.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					await t(interaction, 'common.error.vote.locked.text'),
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
							await t(interaction, 'common.error.vote.locked.button', {
								username: interaction.client.user.username,
							}),
						)
						.setStyle(ButtonStyle.Link)
						.setURL(`https://top.gg/bot/${kythiaConfig.bot.clientId}/vote`),
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
