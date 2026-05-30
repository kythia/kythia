/**
 * @namespace: addons/economy/commands/work.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */

const {
	MessageFlags,
	ContainerBuilder,
	TextDisplayBuilder,
	SeparatorBuilder,
	SeparatorSpacingSize,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
} = require('discord.js');
const banks = require('../../helpers/banks');
const jobs = require('../../helpers/jobs');
const { toBigIntSafe } = require('../../helpers/bigint');

module.exports = {
	subcommand: true,
	aliases: ['work'],
	slashCommand: (subcommand) =>
		subcommand
			.setName('work')
			.setDescription('⚒️ Work to earn money with various scenarios!'),

	async execute(interaction, container) {
		const { t, models, kythiaConfig, helpers } = container;
		const { KythiaUser, Inventory } = models;
		const { simpleContainer, createContainer } = helpers.discord;
		const { checkCooldown } = helpers.time;
		await interaction.deferReply();

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

		const userInventory = await Inventory.getAllCache({ userId: user.userId });

		const cooldown = checkCooldown(
			user.lastWork,
			kythiaConfig.addons.economy.workCooldown || 28800,
			interaction,
		);

		if (cooldown.remaining) {
			const msg = `## ${await t(interaction, 'economy.work.work.cooldown.title')}\n${await t(interaction, 'economy.work.work.cooldown.desc', { time: cooldown.time })}`;
			const components = await simpleContainer(interaction, msg, {
				color: 'Yellow',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		if (!user.profession) {
			const msg = `## 👨‍💼 Unemployed\nYou don't have a profession yet! Use \`/eco job_apply\` to select a job.`;
			const components = await simpleContainer(interaction, msg, {
				color: 'Yellow',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		let job = null;
		let tierObj = null;

		for (const tierKey of Object.keys(jobs)) {
			const tier = jobs[tierKey];
			for (const j of tier.jobs) {
				if (j.nameKey === user.profession) {
					job = j;
					tierObj = tier;
					break;
				}
			}
			if (job) break;
		}

		if (!job) {
			user.profession = null;
			user.changed('profession', true);
			await user.save();
			const msg = `## ⚠️ Invalid Profession\nYour chosen profession is no longer valid. Please apply for a new one using \`/eco job_apply\`.`;
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const userItemNames = new Set(userInventory.map((item) => item.itemName));
		let hasRequirement = false;
		let requiredItemFound = null;

		if (tierObj.requiredItem === null) {
			hasRequirement = true;
		} else if (Array.isArray(tierObj.requiredItem)) {
			for (const item of tierObj.requiredItem) {
				if (userItemNames.has(item)) {
					hasRequirement = true;
					requiredItemFound = item;
					break;
				}
			}
		} else {
			if (userItemNames.has(tierObj.requiredItem)) {
				hasRequirement = true;
				requiredItemFound = tierObj.requiredItem;
			}
		}

		if (!hasRequirement) {
			const reqStr = Array.isArray(tierObj.requiredItem)
				? tierObj.requiredItem.join(' / ')
				: tierObj.requiredItem;
			const msg = `## 🛠️ Missing Tool\nYou cannot work as a ${await t(interaction, job.nameKey)} because you are missing the required item(s): **${reqStr}**!`;
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		// Update last work immediately to prevent spam
		user.lastWork = new Date();
		user.changed('lastWork', true);
		await user.save();

		// Check for Crossroads Event (20% chance)
		if (Math.random() < 0.2) {
			const row = new ActionRowBuilder().addComponents(
				new ButtonBuilder()
					.setCustomId('event_accept')
					.setLabel('Accept Offer')
					.setStyle(ButtonStyle.Danger),
				new ButtonBuilder()
					.setCustomId('event_decline')
					.setLabel('Decline (Stay Safe)')
					.setStyle(ButtonStyle.Primary),
			);

			const eventContainer = await createContainer(interaction, {
				description: `## ⚠️ Crossroads Event!\nWhile working as a ${await t(interaction, job.nameKey)}, you encounter a strange client who offers you a bribe to do something highly unethical. They will pay you **🪙 50,000**, but there is a 25% chance you will be caught, lose your job, and your bounty will increase!\n\nDo you accept?`,
				components: [row],
			});

			const message = await interaction.editReply({
				components: eventContainer,
				flags: MessageFlags.IsComponentsV2,
			});
			const filter = (i) => i.user.id === interaction.user.id;
			const collector = message.createMessageComponentCollector({
				filter,
				time: 30000,
			});

			collector.on('collect', async (i) => {
				let outcomeMsg = '';
				if (i.customId === 'event_accept') {
					if (Math.random() < 0.25) {
						// Caught
						user.profession = null; // Fired
						user.bountyAmount =
							toBigIntSafe(user.bountyAmount || 0) + toBigIntSafe(25000);
						user.jobExp = 0; // Reset EXP
						user.changed('profession', true);
						user.changed('bountyAmount', true);
						user.changed('jobExp', true);
						await user.save();
						outcomeMsg = `## 🚨 Busted!\nYou accepted the bribe but got caught by the authorities! You have been **fired**, lost all your Job EXP, and your bounty increased by **🪙 25,000**!`;
					} else {
						// Success
						user.kythiaCoin =
							toBigIntSafe(user.kythiaCoin) + toBigIntSafe(50000);
						user.changed('kythiaCoin', true);
						await user.save();
						outcomeMsg = `## 💰 Paid Off!\nYou accepted the bribe and successfully got away with it! You earned **🪙 50,000**!`;
					}
				} else {
					// Decline
					user.jobExp = toBigIntSafe(user.jobExp || 0) + toBigIntSafe(50);
					user.changed('jobExp', true);
					await user.save();
					outcomeMsg = `## 🛡️ Honest Work\nYou declined the shady offer. Your integrity earned you **+50 Job EXP**!`;
				}
				const components = await simpleContainer(i, outcomeMsg, {
					color: i.customId === 'event_accept' ? 'Red' : 'Green',
				});
				await i.update({ components, flags: MessageFlags.IsComponentsV2 });
			});

			collector.on('end', async (collected) => {
				if (collected.size === 0) {
					const components = await simpleContainer(
						interaction,
						'You took too long to decide. The opportunity passed.',
						{ color: 'Yellow' },
					);
					await interaction.editReply({
						components,
						flags: MessageFlags.IsComponentsV2,
					});
				}
			});
			return; // Exit here if event triggers
		}

		// Normal Work Flow
		const scenario =
			job.scenarios[Math.floor(Math.random() * job.scenarios.length)];
		const jobName = await t(interaction, job.nameKey);
		const scenarioDesc = await t(interaction, scenario.descKey);

		// Titles based on EXP
		const jobExpNum = Number(user.jobExp || 0);
		let jobTitlePrefix = 'Junior';
		let expBonusMultiplier = 1.0;

		if (jobExpNum >= 1000) {
			jobTitlePrefix = 'Master';
			expBonusMultiplier = 2.0;
		} else if (jobExpNum >= 500) {
			jobTitlePrefix = 'Lead';
			expBonusMultiplier = 1.5;
		} else if (jobExpNum >= 100) {
			jobTitlePrefix = 'Senior';
			expBonusMultiplier = 1.25;
		}

		const fullJobTitle = `${jobTitlePrefix} ${jobName}`;

		const baseEarningRaw =
			Math.floor(Math.random() * (job.basePay[1] - job.basePay[0] + 1)) +
			job.basePay[0];
		const baseEarning = Math.floor(baseEarningRaw * expBonusMultiplier);

		const userBank = banks.getBank(user.bankType);
		const bankBonus = Math.floor(
			baseEarning * (userBank.incomeBonusPercent / 100),
		);
		const finalEarning =
			Math.floor(baseEarning * scenario.modifier) + bankBonus;

		user.kythiaCoin =
			toBigIntSafe(user.kythiaCoin) + toBigIntSafe(finalEarning);
		user.jobExp = toBigIntSafe(user.jobExp || 0) + toBigIntSafe(10); // Gain 10 EXP per work

		let extraText = `\n\n📈 You gained **+10 Job EXP**! (Total: ${Number(user.jobExp || 0) + 10})`;

		if (requiredItemFound && Math.random() < 0.05) {
			const toolToBreak = await Inventory.getCache({
				userId: user.userId,
				itemName: requiredItemFound,
			});
			if (toolToBreak) await toolToBreak.destroy();
			extraText += `\n⚠️ **Oh no! Your ${requiredItemFound} broke while working!**`;
		}

		user.changed('kythiaCoin', true);
		user.changed('jobExp', true);
		await user.save();

		const outcomeColors = { success: 'Green', neutral: 'Blue', failure: 'Red' };
		const { convertColor } = helpers.color;
		const accentColor = convertColor(outcomeColors[scenario.outcome], {
			from: 'discord',
			to: 'decimal',
		});

		const resultContainer = new ContainerBuilder()
			.setAccentColor(accentColor)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					`## ${job.emoji} You worked as a **${fullJobTitle}**!`,
				),
			)
			.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					`${await t(interaction, 'economy.work.result.title.outcome')}\n*${scenarioDesc}*${extraText}`,
				),
			)
			.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					`**${await t(interaction, 'economy.work.work.basepay.field')}:** 🪙 ${baseEarning.toLocaleString()}\n` +
						`**${await t(interaction, 'economy.work.work.bonus.field', { modifier: scenario.modifier })}:** 🪙 ${(finalEarning - baseEarning).toLocaleString()}\n` +
						`**${await t(interaction, 'economy.work.work.total.field')}:** 💰 ${finalEarning.toLocaleString()}`,
				),
			);

		await interaction.editReply({
			components: [resultContainer],
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
