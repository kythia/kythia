/**
 * @namespace: addons/economy/commands/crime/rob.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const banks = require('../../helpers/banks');
const { toBigIntSafe } = require('../../helpers/bigint');

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('rob')
			.setDescription('💵 Try to rob money from another user.')
			.addUserOption((option) =>
				option
					.setName('target')
					.setDescription('The user you want to rob')
					.setRequired(true),
			),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t, models, kythiaConfig, helpers } = container;
		const { KythiaUser, Inventory } = models;
		const { simpleContainer } = helpers.discord;
		const { checkCooldown } = helpers.time;

		await interaction.deferReply();

		const targetUser = interaction.options.getUser('target');
		if (targetUser.id === interaction.user.id) {
			const msg = await t(interaction, 'economy.rob.rob.cannot.rob.self');
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const user = await KythiaUser.getCache({ userId: interaction.user.id });
		if (!user) {
			const msg = await t(interaction, 'economy.withdraw.no.account.desc');
			const components = await simpleContainer(interaction, msg, {
				color: kythiaConfig.bot.color,
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const target = await KythiaUser.getCache({ userId: targetUser.id });
		if (!target) {
			const msg = await t(
				interaction,
				'economy.rob.rob.target.no.account.desc',
			);
			const components = await simpleContainer(interaction, msg, {
				color: kythiaConfig.bot.color,
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const cooldown = checkCooldown(
			user.lastRob,
			kythiaConfig.addons.economy.robCooldown || 10800,
			interaction,
		);

		if (cooldown.remaining) {
			const msg = await t(interaction, 'economy.rob.rob.cooldown', {
				time: cooldown.time,
			});
			const components = await simpleContainer(interaction, msg, {
				color: 'Yellow',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const guard = await Inventory.getCache({
			userId: target.userId,
			itemName: '🚓 Guard',
		});
		const padlock = await Inventory.getCache({
			userId: target.userId,
			itemName: '🔒 Padlock',
		});
		const fakeWallet = await Inventory.getCache({
			userId: target.userId,
			itemName: '👛 Fake Wallet',
		});
		const bankVault = await Inventory.getCache({
			userId: target.userId,
			itemName: '🏦 Bank Vault',
		});
		const cctv = await Inventory.getCache({
			userId: target.userId,
			itemName: '📹 CCTV Camera',
		});
		const lockpick = await Inventory.getCache({
			userId: user.userId,
			itemName: '🪛 Lockpick',
		});
		const smokeGrenade = await Inventory.getCache({
			userId: user.userId,
			itemName: '💨 Smoke Grenade',
		});
		const lawyer = await Inventory.getCache({
			userId: user.userId,
			itemName: '👔 Lawyer Contact',
		});

		let poison = null;
		if (!guard && !padlock) {
			poison = await Inventory.getCache({
				userId: target.userId,
				itemName: '🧪 Poison',
			});
		}

		let lockpickMsg = '';
		if (padlock) {
			if (lockpick) {
				await lockpick.destroy();
				if (Math.random() < 0.5) {
					await padlock.destroy();
					lockpickMsg = '\n🪛 *You successfully picked their Padlock!*';
				} else {
					const msg = await t(
						interaction,
						'economy.crime.rob.event.lockpick_fail.desc',
						{
							target: targetUser.username,
						},
					);
					const components = await simpleContainer(interaction, msg, {
						color: 'Red',
					});
					return interaction.editReply({
						components,
						flags: MessageFlags.IsComponentsV2,
					});
				}
			} else {
				await padlock.destroy();
				const msg = await t(
					interaction,
					'economy.crime.rob.event.blocked.desc',
					{
						target: targetUser.username,
					},
				);
				const components = await simpleContainer(interaction, msg, {
					color: 'Red',
				});
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
		}

		const stealthSuit = await Inventory.getCache({
			userId: user.userId,
			itemName: '🥷 Stealth Suit',
		});

		const userBank = banks.getBank(user.bankType);
		let success = false;
		if (guard) {
			success = false;
			await guard.destroy();
		} else if (poison) {
			success = Math.random() < 0.1;
		} else {
			let baseSuccessChance = 0.3;

			const successBonus = userBank.robSuccessBonusPercent / 100;
			baseSuccessChance += successBonus;
			success = Math.random() < baseSuccessChance;
		}

		const baseRobAmount = Math.floor(Math.random() * 201) + 50;

		const robSuccessBonusPercent = userBank.robSuccessBonusPercent;
		const robBonus = Math.floor(baseRobAmount * (robSuccessBonusPercent / 100));
		const robAmount = baseRobAmount + robBonus;

		if (success) {
			if (target.kythiaCoin < robAmount) {
				const msg = await t(
					interaction,
					'economy.rob.rob.target.not.enough.money',
				);
				const components = await simpleContainer(interaction, msg, {
					color: 'Red',
				});
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}

			let finalRobAmount = robAmount;
			let vaultMsg = '';
			if (fakeWallet) {
				await fakeWallet.destroy();
				finalRobAmount = Math.floor(robAmount * 0.1); // Fake wallet reduces to 10%
			} else if (bankVault) {
				finalRobAmount = Math.floor(robAmount * 0.2); // Bank vault reduces to 20%
				vaultMsg = '\n🏦 *Their Bank Vault protected 80% of their cash!*';
			}

			user.kythiaCoin =
				toBigIntSafe(user.kythiaCoin) + toBigIntSafe(finalRobAmount);
			target.kythiaCoin =
				toBigIntSafe(target.kythiaCoin) - toBigIntSafe(finalRobAmount);
			user.lastRob = new Date();

			let bountyIncrease = Math.floor(finalRobAmount * 0.5);
			let stealthMsg = '';
			if (stealthSuit) {
				if (Math.random() < 0.2) {
					await stealthSuit.destroy();
					stealthMsg = '\n🥷 *Your Stealth Suit tore and broke!*';
				} else {
					bountyIncrease = 0; // Bounty doesn't increase if stealth suit works
					stealthMsg =
						'\n🥷 *Your Stealth Suit kept your identity hidden! No bounty added.*';
				}
			}

			user.bountyAmount =
				toBigIntSafe(user.bountyAmount || 0) + toBigIntSafe(bountyIncrease);

			user.changed('kythiaCoin', true);
			user.changed('bountyAmount', true);
			target.changed('kythiaCoin', true);

			await user.save();
			await target.save();

			const msgText = fakeWallet
				? `## 👛 Fake Wallet Triggered!\nYou robbed ${targetUser.username}, but they had a Fake Wallet! You only got 🪙 ${finalRobAmount.toLocaleString()}.\nYour bounty increased by 🪙 ${bountyIncrease.toLocaleString()}!${stealthMsg}${lockpickMsg}`
				: (await t(interaction, 'economy.rob.rob.success.text', {
						amount: finalRobAmount,
						target: targetUser.username,
					})) +
					`\nYour bounty increased by 🪙 ${bountyIncrease.toLocaleString()}!${stealthMsg}${lockpickMsg}${vaultMsg}`;

			const msg = msgText;
			const components = await simpleContainer(interaction, msg, {
				color: kythiaConfig.bot.color,
			});
			await interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});

			const dmMsg = await t(interaction, 'economy.rob.rob.success.dm', {
				robber: cctv ? interaction.user.username : 'Someone (Anonymous)',
				amount: finalRobAmount,
			});
			const dmComponents = await simpleContainer(interaction, dmMsg, {
				color: 'Red',
			});
			await targetUser.send({
				components: dmComponents,
				flags: MessageFlags.IsComponentsV2,
			});
		} else {
			const robPenaltyMultiplier = userBank ? userBank.robPenaltyMultiplier : 1;
			const basePenalty = Math.floor(robAmount * robPenaltyMultiplier);

			if (user.kythiaCoin < basePenalty && !poison) {
				const msg = await t(
					interaction,
					'economy.rob.rob.user.not.enough.money.fail',
				);
				const components = await simpleContainer(interaction, msg, {
					color: 'Red',
				});
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
			let penalty = basePenalty;
			let smokeMsg = '';
			let lawyerMsg = '';

			if (poison) {
				penalty = user.kythiaCoin;

				user.kythiaCoin = toBigIntSafe(user.kythiaCoin) - toBigIntSafe(penalty);
				target.kythiaCoin =
					toBigIntSafe(target.kythiaCoin) + toBigIntSafe(penalty);
				await poison.destroy();
			} else {
				if (smokeGrenade) {
					await smokeGrenade.destroy();
					penalty = 0;
					smokeMsg =
						'\n💨 *You used a Smoke Grenade and escaped without paying a fine!*';
				} else if (lawyer) {
					await lawyer.destroy();
					penalty = Math.floor(basePenalty * 0.5);
					lawyerMsg = '\n👔 *Your Lawyer intervened and cut your fine by 50%!*';
				}

				user.kythiaCoin = toBigIntSafe(user.kythiaCoin) - toBigIntSafe(penalty);
				target.kythiaCoin =
					toBigIntSafe(target.kythiaCoin) + toBigIntSafe(penalty);
			}

			user.lastRob = new Date();

			user.changed('kythiaCoin', true);
			target.changed('kythiaCoin', true);

			await user.save();
			await target.save();

			const msg = `${await t(interaction, 'economy.rob.rob.fail.text', {
				target: targetUser.username,
				penalty: poison
					? await t(interaction, 'economy.rob.rob.fail.penalty.all')
					: `${penalty} kythia coin`,
				guard: guard
					? await t(interaction, 'economy.rob.rob.fail.guard.text')
					: '',
				poison: poison
					? await t(interaction, 'economy.rob.rob.fail.poison')
					: '',
			})}${smokeMsg}${lawyerMsg}${lockpickMsg}`;
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			await interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});

			const dmMsg = await t(interaction, 'economy.rob.rob.fail.dm', {
				robber: cctv ? interaction.user.username : 'Someone (Anonymous)',
				amount: robAmount,
				penalty: penalty,
				guard: guard
					? await t(interaction, 'economy.rob.rob.fail.guard.dm')
					: '',
				poison: poison
					? await t(interaction, 'economy.rob.rob.fail.poison.dm')
					: '',
			});
			const dmComponents = await simpleContainer(interaction, dmMsg, {
				color: kythiaConfig.bot.color,
			});
			await targetUser.send({
				components: dmComponents,
				flags: MessageFlags.IsComponentsV2,
			});
		}
	},
};
