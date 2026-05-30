/**
 * @namespace: addons/adventure/commands/recall.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('recall')
			.setNameLocalizations({ id: 'kembali', fr: 'retour', ja: 'リコール' })
			.setDescription('🏙️ Get back to the city!')
			.setDescriptionLocalizations({
				id: '🏙️ kembali ke kota',
				fr: '🏙️ Retourne en ville !',
				ja: '🏙️ 街へ戻ろう！',
			}),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t, models, kythiaConfig, helpers } = container;
		const { UserAdventure } = models;
		const { simpleContainer } = helpers.discord;

		await interaction.deferReply();
		const user = await UserAdventure.getCache({ userId: interaction.user.id });

		if (!user) {
			const msg = await t(interaction, 'adventure.no.character');
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		user.hp = user.maxHp;
		user.monsterName = null;
		user.monsterHp = 0;
		user.monsterStrength = 0;
		user.monsterGoldDrop = 0;
		user.monsterXpDrop = 0;
		await user.save();
		const msg = await t(interaction, 'adventure.recall.recalled');
		const components = await simpleContainer(interaction, msg, {
			color: kythiaConfig.bot.color,
		});
		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
