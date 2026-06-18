/**
 * @namespace: addons/economy/commands/bank/upgrade.js
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
const { toBigIntSafe } = require('../../helpers/bigint');
const { BaseCommand } = require('kythia-core');
class UpgradeCommand extends BaseCommand {
	subcommand = true;
	slashCommand = (subcommand) =>
		subcommand
			.setName('upgrade')
			.setDescription('Upgrade your maximum bank capacity.');
	async execute(interaction) {
		const container = this.container;
		const { t, models, kythiaConfig, helpers } = container;
		const { KythiaUser } = models;
		const { simpleContainer, createContainer } = helpers.discord;
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
		const UPGRADE_COST = 500000;
		const CAPACITY_INCREASE = 100000;
		if (user.kythiaCoin < UPGRADE_COST) {
			const msg = await t(
				interaction,
				'economy.bank.upgrade.error.insufficient_funds.desc',
				{
					cost: UPGRADE_COST.toLocaleString(),
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
		const row = new ActionRowBuilder().addComponents(
			new ButtonBuilder()
				.setCustomId('confirm_upgrade')
				.setLabel(`Upgrade (+${CAPACITY_INCREASE.toLocaleString()})`)
				.setStyle(ButtonStyle.Success),
			new ButtonBuilder()
				.setCustomId('cancel')
				.setLabel('Cancel')
				.setStyle(ButtonStyle.Danger),
		);
		const confirmContainer = await createContainer(interaction, {
			description: await t(interaction, 'economy.bank.upgrade.prompt.desc', {
				cost: UPGRADE_COST.toLocaleString(),
				increase: CAPACITY_INCREASE.toLocaleString(),
				current: (user.extraBankCapacity || 0).toLocaleString(),
			}),
			components: [row],
		});
		await interaction.editReply({
			components: confirmContainer,
			flags: MessageFlags.IsComponentsV2,
		});
		const filter = (i) => i.user.id === interaction.user.id;
		const collector = interaction.channel.createMessageComponentCollector({
			filter,
			time: 15000,
		});
		collector.on('collect', async (i) => {
			if (i.customId === 'confirm_upgrade') {
				user.kythiaCoin =
					toBigIntSafe(user.kythiaCoin) - toBigIntSafe(UPGRADE_COST);
				user.extraBankCapacity =
					toBigIntSafe(user.extraBankCapacity || 0) +
					toBigIntSafe(CAPACITY_INCREASE);
				user.changed('kythiaCoin', true);
				user.changed('extraBankCapacity', true);
				await user.save();
				const msg = await t(i, 'economy.bank.upgrade.success.desc', {
					cost: UPGRADE_COST.toLocaleString(),
					capacity: CAPACITY_INCREASE.toLocaleString(),
					newCapacity: user.extraBankCapacity.toLocaleString(),
				});
				const components = await simpleContainer(i, msg, {
					color: 'Green',
				});
				await i.update({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			} else if (i.customId === 'cancel') {
				const components = await simpleContainer(
					i,
					await t(i, 'economy.bank.upgrade.cancel.desc'),
					{
						color: kythiaConfig.bot.color,
					},
				);
				await i.update({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
		});
		collector.on('end', async (collected) => {
			if (collected.size === 0) {
				const components = await simpleContainer(
					interaction,
					await t(interaction, 'economy.bank.upgrade.timeout.desc'),
					{
						color: kythiaConfig.bot.color,
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
exports.default = UpgradeCommand;
