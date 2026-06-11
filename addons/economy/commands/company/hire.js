/**
 * @namespace: addons/economy/commands/company/hire.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	MessageFlags,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
} = require('discord.js');

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('hire')
			.setDescription('🏢 (Company Owner) Hire a player to work for you.')
			.addUserOption((option) =>
				option
					.setName('target')
					.setDescription('The player you want to hire')
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

		// Verify user owns a Company
		const companyItem = await Inventory.getCache({
			userId: interaction.user.id,
			itemName: '🏢 Company',
		});

		if (!companyItem || companyItem.quantity <= 0) {
			const msg = await t(interaction, 'economy.company.hire.error.no_company');
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const targetUser = interaction.options.getUser('target');
		if (targetUser.bot || targetUser.id === interaction.user.id) {
			const msg = await t(
				interaction,
				'economy.company.hire.error.invalid_target',
			);
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
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
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		if (target.employerId) {
			const msg = await t(
				interaction,
				'economy.company.hire.error.already_employed',
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

		const promptMsg = await t(interaction, 'economy.company.hire.prompt', {
			employer: interaction.user.username,
			target: targetUser.username,
		});

		const row = new ActionRowBuilder().addComponents(
			new ButtonBuilder()
				.setCustomId('hire_accept')
				.setLabel('Accept Job')
				.setStyle(ButtonStyle.Success),
			new ButtonBuilder()
				.setCustomId('hire_decline')
				.setLabel('Decline')
				.setStyle(ButtonStyle.Danger),
		);

		const components = await simpleContainer(interaction, promptMsg, {
			color: 'Blue',
		});

		const message = await interaction.editReply({
			content: `<@${targetUser.id}>`,
			components: [...components, row],
		});

		const filter = (i) => i.user.id === targetUser.id;
		const collector = message.createMessageComponentCollector({
			filter,
			time: 60000,
		});

		collector.on('collect', async (i) => {
			if (i.customId === 'hire_accept') {
				target.employerId = interaction.user.id;
				target.changed('employerId', true);
				await target.save();

				const successMsg = await t(
					interaction,
					'economy.company.hire.success',
					{
						target: targetUser.username,
						employer: interaction.user.username,
					},
				);
				const successComponents = await simpleContainer(
					interaction,
					successMsg,
					{
						color: 'Green',
					},
				);
				await i.update({
					content: '',
					components: successComponents,
				});
			} else {
				const declineMsg = await t(
					interaction,
					'economy.company.hire.decline',
					{
						target: targetUser.username,
					},
				);
				const declineComponents = await simpleContainer(
					interaction,
					declineMsg,
					{
						color: 'Red',
					},
				);
				await i.update({
					content: '',
					components: declineComponents,
				});
			}
			collector.stop('responded');
		});

		collector.on('end', async (_collected, reason) => {
			if (reason !== 'responded') {
				const timeoutMsg = await t(interaction, 'economy.company.hire.timeout');
				const timeoutComponents = await simpleContainer(
					interaction,
					timeoutMsg,
					{
						color: 'Yellow',
					},
				);
				await interaction.editReply({
					content: '',
					components: timeoutComponents,
				});
			}
		});
	},
};
