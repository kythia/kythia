/**
 * @namespace: addons/economy/commands/give.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */

const {
	ButtonStyle,
	MessageFlags,
	ButtonBuilder,
	ActionRowBuilder,
	ContainerBuilder,
	SeparatorBuilder,
	TextDisplayBuilder,
	SeparatorSpacingSize,
} = require('discord.js');
const { toBigIntSafe } = require('../helpers/bigint');

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('give')
			.setDescription('💰 Give kythia coin to another user.')
			.addUserOption((option) =>
				option
					.setName('target')
					.setDescription('User to give kythia coin to')
					.setRequired(true),
			)
			.addIntegerOption((option) =>
				option
					.setName('amount')
					.setDescription('Amount of kythia coin to give')
					.setRequired(true),
			),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t, models, kythiaConfig, helpers } = container;
		const { KythiaUser } = models;
		const { simpleContainer } = helpers.discord;
		const { convertColor } = helpers.color;

		await interaction.deferReply();

		const target = interaction.options.getUser('target');
		const amount = interaction.options.getInteger('amount');

		const giver = await KythiaUser.getCache({ userId: interaction.user.id });
		if (!giver) {
			const msg = await t(interaction, 'economy.withdraw.no.account.desc');
			const components = await simpleContainer(interaction, msg, {
				color: kythiaConfig.bot.color,
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		if (amount <= 0) {
			const msg = await t(interaction, 'economy.give.give.invalid.amount');
			const components = await simpleContainer(interaction, msg, {
				color: 'Yellow',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		if (target.id === interaction.user.id) {
			const msg = await t(interaction, 'economy.give.give.self');
			const components = await simpleContainer(interaction, msg, {
				color: 'Yellow',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const receiver = await KythiaUser.getCache({ userId: target.id });
		if (!receiver) {
			const msg = await t(interaction, 'economy.give.give.no.target.account');
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const fee = Math.floor(amount * 0.05);

		if (giver.kythiaCoin < amount + fee) {
			const msg = await t(interaction, 'economy.give.give.not.enough.cash', {
				fee,
			});
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		// Confirmation with buttons
		const confirmContainer = new ContainerBuilder()
			.setAccentColor(
				convertColor(kythiaConfig.bot.color, { from: 'hex', to: 'decimal' }),
			)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					await t(interaction, 'economy.give.give.confirm', {
						amount,
						target: target.username,
						fee,
					}),
				),
			)
			.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			)
			.addActionRowComponents(
				new ActionRowBuilder().addComponents(
					new ButtonBuilder()
						.setCustomId('confirm')
						.setLabel(await t(interaction, 'economy.give.give.btn.confirm'))
						.setStyle(ButtonStyle.Success),
					new ButtonBuilder()
						.setCustomId('cancel')
						.setLabel(await t(interaction, 'economy.give.give.btn.cancel'))
						.setStyle(ButtonStyle.Danger),
				),
			);

		await interaction.editReply({
			components: [confirmContainer],
			flags: MessageFlags.IsComponentsV2,
		});

		const filter = (i) => i.user.id === interaction.user.id;
		const collector = interaction.channel.createMessageComponentCollector({
			filter,
			time: 15000,
		});

		collector.on('collect', async (i) => {
			if (i.customId === 'confirm') {
				giver.kythiaCoin =
					toBigIntSafe(giver.kythiaCoin) - toBigIntSafe(amount + fee);
				receiver.kythiaCoin =
					toBigIntSafe(receiver.kythiaCoin) + toBigIntSafe(amount);

				giver.changed('kythiaCoin', true);
				receiver.changed('kythiaCoin', true);

				await giver.save();
				await receiver.save();

				const msg = await t(interaction, 'economy.give.give.success', {
					amount,
					target: target.username,
					fee,
				});
				const components = await simpleContainer(i, msg, {
					color: kythiaConfig.bot.color,
				});
				await i.update({ components, flags: MessageFlags.IsComponentsV2 });

				// Send DM to receiver
				const receiverMsg = await t(i, 'economy.give.give.received', {
					amount,
					from: interaction.user.username,
				});
				const receiverComponents = await simpleContainer(i, receiverMsg, {
					color: kythiaConfig.bot.color,
				});
				try {
					const member = await interaction.client.users.fetch(target.id);
					await member.send({
						components: receiverComponents,
						flags: MessageFlags.IsComponentsV2,
					});
				} catch (_e) {}
			} else if (i.customId === 'cancel') {
				const msg = await t(i, 'economy.give.give.cancelled');
				const components = await simpleContainer(i, msg, {
					color: kythiaConfig.bot.color,
				});
				await i.update({ components, flags: MessageFlags.IsComponentsV2 });
			}
		});

		collector.on('end', async (collected) => {
			if (collected.size === 0) {
				const msg = await t(interaction, 'economy.give.give.timeout');
				const components = await simpleContainer(interaction, msg, {
					color: kythiaConfig.bot.color,
				});
				await interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
		});
	},
};
