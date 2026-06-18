/**
 * @namespace: addons/economy/commands/crime/hack.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	ButtonStyle,
	MessageFlags,
	ButtonBuilder,
	ActionRowBuilder,
} = require('discord.js');
const banks = require('../../helpers/banks');
const { toBigIntSafe } = require('../../helpers/bigint');
const { BaseCommand } = require('kythia-core');
class HackCommand extends BaseCommand {
	subcommand = true;
	slashCommand = (subcommand) =>
		subcommand
			.setName('hack')
			.setDescription('Hack another user (Initiates a hacking sequence).')
			.addUserOption((option) =>
				option
					.setName('target')
					.setDescription('User you want to hack')
					.setRequired(true),
			);
	guildOnly = true;
	async execute(interaction) {
		const container = this.container;
		const { t, models, kythiaConfig, helpers } = container;
		const { KythiaUser, Inventory } = models;
		const { simpleContainer, createContainer } = helpers.discord;
		const { checkCooldown } = helpers.time;
		await interaction.deferReply();
		const targetUser = interaction.options.getUser('target');
		const user = await KythiaUser.getCache({
			userId: interaction.user.id,
		});
		const target = await KythiaUser.getCache({
			userId: targetUser.id,
		});
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
		const cooldown = checkCooldown(
			user.lastHack,
			kythiaConfig.addons.economy.hackCooldown || 7200,
			interaction,
		);
		if (cooldown.remaining) {
			const msg = await t(interaction, 'economy.hack.hack.cooldown', {
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
		if (!user || !target) {
			const msg = await t(
				interaction,
				'economy.hack.hack.user.or.target.not.found',
			);
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		if (targetUser.id === interaction.user.id) {
			const msg = await t(interaction, 'economy.hack.hack.self');
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		if (target.kythiaBank <= 0) {
			const msg = await t(interaction, 'economy.hack.hack.target.no.bank');
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		if (user.kythiaBank <= 20) {
			const msg = await t(interaction, 'economy.hack.hack.user.no.bank');
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		const antivirus = await Inventory.getCache({
			userId: target.userId,
			itemName: '🛡️ Antivirus',
		});
		let currentNode = 1;
		const totalNodes = 3;
		const renderNode = async (nodeNum) => {
			const row = new ActionRowBuilder().addComponents(
				new ButtonBuilder()
					.setCustomId('hack_opt_1')
					.setLabel('Exploit Protocol A')
					.setStyle(ButtonStyle.Primary),
				new ButtonBuilder()
					.setCustomId('hack_opt_2')
					.setLabel('Inject Payload B')
					.setStyle(ButtonStyle.Primary),
				new ButtonBuilder()
					.setCustomId('hack_opt_3')
					.setLabel('Bruteforce Port C')
					.setStyle(ButtonStyle.Primary),
			);
			const difficultyText = antivirus
				? '⚠️ **WARNING: ACTIVE ANTIVIRUS DETECTED! DEFENSES ARE EXTREMELY HIGH!**'
				: 'Network seems standard.';
			const nodeNames = ['Proxy Server', 'Firewall Bypass', 'Mainframe Access'];
			const containerDef = await createContainer(interaction, {
				description: await t(interaction, 'economy.crime.hack.sequence', {
					nodeNum,
					totalNodes,
					nodeName: nodeNames[nodeNum - 1],
					difficultyText,
				}),
				components: [row],
			});
			return containerDef;
		};
		const message = await interaction.editReply({
			components: await renderNode(1),
			flags: MessageFlags.IsComponentsV2,
		});
		const filter = (i) => i.user.id === interaction.user.id;
		const collector = message.createMessageComponentCollector({
			filter,
			time: 20000,
		});
		let failed = false;
		collector.on('collect', async (i) => {
			// Probability logic
			// Normal: 1 safe (100%), 1 risky (50%), 1 fail (0%)
			// Antivirus: 0 safe, 1 risky (50%), 1 hard (25%), 1 fail (0%)
			let chances = antivirus ? [0.5, 0.25, 0.0] : [1.0, 0.5, 0.0];
			chances = chances.sort(() => Math.random() - 0.5); // Shuffle

			let selectedIndex = 0;
			if (i.customId === 'hack_opt_2') selectedIndex = 1;
			if (i.customId === 'hack_opt_3') selectedIndex = 2;
			const successChance =
				chances[selectedIndex] + (user.hackMastered || 0) / 200; // Slight boost from mastery
			const isSuccess = Math.random() < successChance;
			if (!isSuccess) {
				failed = true;
				collector.stop();
				if (antivirus) await antivirus.destroy(); // Antivirus is consumed if it caught them

				// Apply Penalty
				const userBank = banks.getBank(user.bankType || 'solara_mutual');
				const basePenalty = Math.floor(Math.random() * 20) + 1;
				const penalty = Math.floor(
					basePenalty * (userBank ? userBank.robPenaltyMultiplier : 1),
				);
				if (user.kythiaBank >= penalty) {
					user.kythiaBank =
						toBigIntSafe(user.kythiaBank) - toBigIntSafe(penalty);
					target.kythiaBank =
						toBigIntSafe(target.kythiaBank) + toBigIntSafe(penalty);
					user.changed('kythiaBank', true);
					target.changed('kythiaBank', true);
					await target.save();
				}
				user.lastHack = Date.now();
				user.changed('lastHack', true);
				await user.save();
				const msg = await t(
					interaction,
					'economy.crime.hack.event.busted.desc',
					{
						node: currentNode,
						penalty,
					},
				);
				const components = await simpleContainer(i, msg, {
					color: 'Red',
				});
				return i.update({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
			if (currentNode < totalNodes) {
				currentNode++;
				collector.resetTimer({
					time: 20000,
				}); // reset time for next node
				await i.update({
					components: await renderNode(currentNode),
					flags: MessageFlags.IsComponentsV2,
				});
			} else {
				// HACK SUCCESSFUL
				collector.stop();
				if (antivirus) await antivirus.destroy(); // Consumed

				const userBank = banks.getBank(user.bankType);
				const hackBonus = Math.floor(
					target.kythiaBank * (userBank.robSuccessBonusPercent / 100),
				);
				const totalHacked = target.kythiaBank + hackBonus;
				user.kythiaBank =
					toBigIntSafe(user.kythiaBank) + toBigIntSafe(totalHacked);
				if ((user.hackMastered || 0) < 100) {
					user.hackMastered = (user.hackMastered || 10) + 1;
				}
				target.kythiaBank = 0;
				user.lastHack = Date.now();
				user.bountyAmount =
					toBigIntSafe(user.bountyAmount || 0) +
					toBigIntSafe(Math.floor(totalHacked * 0.5));
				user.changed('kythiaBank', true);
				user.changed('lastHack', true);
				user.changed('bountyAmount', true);
				target.changed('kythiaBank', true);
				await user.save();
				await target.save();
				try {
					const targetDiscord = await helpers.discord.getUserSafe(
						interaction.client,
						targetUser.id,
					);
					const dmComponents = await simpleContainer(
						i,
						await t(interaction, 'economy.crime.hack.compromised', {
							user: interaction.user.username,
							hacked: totalHacked.toLocaleString(),
						}),
						{
							color: 'Red',
						},
					);
					await targetDiscord.send({
						components: dmComponents,
						flags: MessageFlags.IsComponentsV2,
					});
				} catch (_e) {}
				const successMsg = await t(interaction, 'economy.crime.hack.breached', {
					target: targetUser.username,
					hacked: totalHacked.toLocaleString(),
					bounty: Math.floor(totalHacked * 0.5).toLocaleString(),
				});
				const components = await simpleContainer(i, successMsg, {
					color: 'Green',
				});
				await i.update({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
		});
		collector.on('end', async (_collected, reason) => {
			if (reason === 'time' && !failed) {
				const components = await simpleContainer(
					interaction,
					await t(interaction, 'economy.crime.hack.timeout'),
					{
						color: 'Yellow',
					},
				);
				await interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
		});
	}
}
exports.default = HackCommand;
