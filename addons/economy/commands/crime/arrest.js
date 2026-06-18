/**
 * @namespace: addons/economy/commands/crime/arrest.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { toBigIntSafe } = require('../../helpers/bigint');
const { BaseCommand } = require('kythia-core');
class ArrestCommand extends BaseCommand {
	subcommand = true;
	slashCommand = (subcommand) =>
		subcommand
			.setName('arrest')
			.setDescription('(Police Only) Arrest a wanted criminal!')
			.addUserOption((option) =>
				option
					.setName('target')
					.setDescription('The wanted criminal you want to arrest')
					.setRequired(true),
			);
	async execute(interaction) {
		const container = this.container;
		const { t, models, kythiaConfig, helpers } = container;
		const { KythiaUser } = models;
		const { simpleContainer } = helpers.discord;
		await interaction.deferReply();
		const user = await KythiaUser.getCache({
			userId: interaction.user.id,
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
		if (user.profession !== 'economy.jobs.police_officer.name') {
			const msg = await t(interaction, 'economy.crime.arrest.error.not_police');
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		const targetUser = interaction.options.getUser('target');
		if (targetUser.id === interaction.user.id) {
			const msg = await t(interaction, 'economy.crime.arrest.error.self');
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		const target = await KythiaUser.getCache({
			userId: targetUser.id,
		});
		if (!target) {
			const msg = await t(
				interaction,
				'economy.rob.rob.target.no.account.desc',
			);
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		const bounty = target.bountyAmount ? BigInt(target.bountyAmount) : 0n;
		if (bounty <= 0n) {
			const msg = await t(interaction, 'economy.crime.arrest.error.no_bounty', {
				target: targetUser.username,
			});
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		// Success! Arrest the criminal
		// Give officer the bounty
		user.kythiaCoin = toBigIntSafe(user.kythiaCoin) + bounty;

		// Clear criminal bounty and send to jail for 2 hours
		target.bountyAmount = 0;
		target.jailTimeUntil = Date.now() + 2 * 60 * 60 * 1000; // 2 hours

		user.changed('kythiaCoin', true);
		target.changed('bountyAmount', true);
		target.changed('jailTimeUntil', true);
		await user.save();
		await target.save();
		const msg = await t(interaction, 'economy.crime.arrest.success.text', {
			target: targetUser.username,
			bounty: bounty.toLocaleString(),
		});
		const components = await simpleContainer(interaction, msg, {
			color: 'Green',
		});

		// DM the criminal
		const dmMsg = await t(interaction, 'economy.crime.arrest.success.dm', {
			officer: interaction.user.username,
		});
		const dmComponents = await simpleContainer(interaction, dmMsg, {
			color: 'Red',
		});
		targetUser
			.send({
				components: dmComponents,
				flags: MessageFlags.IsComponentsV2,
			})
			.catch(() => {});
		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}
exports.default = ArrestCommand;
