/**
 * @namespace: addons/economy/commands/marry/divorce.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { Op } = require('sequelize');

const divorceConfirmations = new Map();
const DIVORCE_CONFIRM_EXPIRE = 1000 * 60 * 2;

module.exports = {
	slashCommand: (subcommand) =>
		subcommand
			.setName('divorce')
			.setDescription('💔 End your current marriage'),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t, models, kythiaConfig, helpers } = container;
		const { Marriage } = models;
		const { simpleContainer } = helpers.discord;
		const userId = interaction.user.id;

		const marriages = await Marriage.getAllCache({
			where: {
				[Op.or]: [
					{ user1Id: userId, status: 'married' },
					{ user2Id: userId, status: 'married' },
				],
			},
			limit: 1,
		});

		const marriage = marriages && marriages.length > 0 ? marriages[0] : null;

		if (!marriage) {
			const components = await simpleContainer(
				interaction,
				await t(interaction, 'fun.marry.not.married.default'),
				{ color: 'Red' },
			);
			return interaction.reply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const partnerId =
			marriage.user1Id === userId ? marriage.user2Id : marriage.user1Id;
		const key = [marriage.user1Id, marriage.user2Id].sort().join('-');
		const now = Date.now();

		const confirmation = divorceConfirmations.get(key);

		if (
			!confirmation ||
			now - confirmation.startedAt > DIVORCE_CONFIRM_EXPIRE
		) {
			divorceConfirmations.set(key, {
				confirmedBy: new Set([userId]),
				startedAt: now,
			});

			let partner;
			try {
				partner = await interaction.client.users.fetch(partnerId);
			} catch {
				partner = null;
			}

			if (partner) {
				const components = await simpleContainer(
					interaction,
					await t(interaction, 'fun.marry.divorce.partner.confirm', {
						partnerName: interaction.user.username,
						serverName: interaction.guild
							? interaction.guild.name
							: 'the server',
					}),
					{ color: kythiaConfig.bot.color },
				);
				partner
					.send({ components, flags: MessageFlags.IsComponentsV2 })
					.catch(() => {});
			}

			const components = await simpleContainer(
				interaction,
				await t(interaction, 'fun.marry.divorce.confirmation.needed', {
					partner: partner ? partner.tag : `ID: ${partnerId}`,
				}),
				{ color: 'Red' },
			);
			return interaction.reply({
				components,
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}

		if (confirmation.confirmedBy.has(userId)) {
			return interaction.reply({
				content: await t(interaction, 'fun.marry.divorce.already.confirmed'),
				flags: MessageFlags.Ephemeral,
			});
		}

		confirmation.confirmedBy.add(userId);

		if (
			confirmation.confirmedBy.has(marriage.user1Id) &&
			confirmation.confirmedBy.has(marriage.user2Id)
		) {
			await marriage.update({ status: 'divorced' });
			divorceConfirmations.delete(key);

			// Asset Split (Harta Gono-Gini)
			const { KythiaUser } = models;
			const ecoUser1 = await KythiaUser.getCache({ userId: marriage.user1Id });
			const ecoUser2 = await KythiaUser.getCache({ userId: marriage.user2Id });

			let splitMsg = '';
			if (ecoUser1 && ecoUser2) {
				const bal1 = BigInt(ecoUser1.kythiaBank || 0n);
				const bal2 = BigInt(ecoUser2.kythiaBank || 0n);

				if (bal1 > bal2) {
					const diff = bal1 - bal2;
					const splitAmount = diff / 2n;
					ecoUser1.kythiaBank = bal1 - splitAmount;
					ecoUser2.kythiaBank = bal2 + splitAmount;
					splitMsg = `\n\n⚖️ **Asset Split**: 🪙 ${splitAmount.toLocaleString()} was transferred from <@${ecoUser1.userId}> to <@${ecoUser2.userId}>.`;
				} else if (bal2 > bal1) {
					const diff = bal2 - bal1;
					const splitAmount = diff / 2n;
					ecoUser2.kythiaBank = bal2 - splitAmount;
					ecoUser1.kythiaBank = bal1 + splitAmount;
					splitMsg = `\n\n⚖️ **Asset Split**: 🪙 ${splitAmount.toLocaleString()} was transferred from <@${ecoUser2.userId}> to <@${ecoUser1.userId}>.`;
				}

				ecoUser1.changed('kythiaBank', true);
				ecoUser2.changed('kythiaBank', true);
				await ecoUser1.save();
				await ecoUser2.save();
			}

			let userA, userB;
			try {
				userA = await interaction.client.users.fetch(marriage.user1Id);
			} catch {}
			try {
				userB = await interaction.client.users.fetch(marriage.user2Id);
			} catch {}

			const components = await simpleContainer(
				interaction,
				`## ${await t(interaction, 'fun.marry.divorced.title')}\n${await t(interaction, 'fun.marry.divorced.description')}${splitMsg}`,
				{ color: 'Red' },
			);

			for (const user of [userA, userB]) {
				if (user) {
					user
						.send({ components, flags: MessageFlags.IsComponentsV2 })
						.catch(() => {});
				}
			}

			return interaction.reply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		} else {
			return interaction.reply({
				content: await t(
					interaction,
					'fun.marry.divorce.confirmed.on.your.side',
				),
				flags: MessageFlags.Ephemeral,
			});
		}
	},
};
