/**
 * @namespace: addons/economy/commands/coinflip.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */

const { MessageFlags } = require('discord.js');
const { toBigIntSafe } = require('../../helpers/bigint');

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('coinflip')
			.setDescription('🪙 Flip a coin and test your luck.')
			.addIntegerOption((option) =>
				option.setName('bet').setDescription('Amount to bet').setRequired(true),
			)
			.addStringOption((option) =>
				option
					.setName('side')
					.setDescription('Heads or Tails')
					.setRequired(true)
					.addChoices(
						{ name: 'Heads', value: 'heads' },
						{ name: 'Tails', value: 'tails' },
					),
			),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t, models, kythiaConfig, helpers } = container;
		const { KythiaUser } = models;
		const { simpleContainer } = helpers.discord;

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
		const bet = interaction.options.getInteger('bet');
		const side = interaction.options.getString('side').toLowerCase();

		if (user.kythiaCoin < bet) {
			const msg = await t(
				interaction,
				'economy.coinflip.coinflip.not.enough.cash',
			);
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const flip = Math.random() < 0.5 ? 'heads' : 'tails';

		if (side === flip) {
			user.kythiaCoin = toBigIntSafe(user.kythiaCoin) + toBigIntSafe(bet);

			user.changed('kythiaCoin', true);

			await user.save();
			const msg = await t(interaction, 'economy.coinflip.coinflip.win', {
				flip: flip.charAt(0).toUpperCase() + flip.slice(1),
				amount: bet,
			});
			const components = await simpleContainer(interaction, msg, {
				color: kythiaConfig.bot.color,
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		} else {
			user.kythiaCoin = toBigIntSafe(user.kythiaCoin) - toBigIntSafe(bet);

			user.changed('kythiaCoin', true);

			await user.save();
			const msg = await t(interaction, 'economy.coinflip.coinflip.lose', {
				flip: flip.charAt(0).toUpperCase() + flip.slice(1),
				amount: bet,
			});
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
	},
};
