/**
 * @namespace: addons/fun/commands/8ball.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags, SlashCommandBuilder } = require('discord.js');
const { BaseCommand } = require('kythia-core');
class EightballCommand extends BaseCommand {
	slashCommand = new SlashCommandBuilder()
		.setName('8ball')
		.setDescription('Ask the magic 8 ball anything')
		.addStringOption((option) =>
			option
				.setName('question')
				.setDescription('What do you want to ask?')
				.setRequired(true),
		);
	async execute(interaction) {
		const container = this.container;
		const { t, kythiaConfig, helpers } = container;
		const { simpleContainer } = helpers.discord;
		const question = interaction.options.getString('question');

		// All answers are now keys for translation
		const answerKeys = [
			'fun.8ball.answer.yes',
			'fun.8ball.answer.maybe.yes',
			'fun.8ball.answer.no',
			'fun.8ball.answer.maybe.no',
			'fun.8ball.answer.idk',
			'fun.8ball.answer.definitely.yes',
			'fun.8ball.answer.definitely.no',
			'fun.8ball.answer.secret',
			'fun.8ball.answer.ask.later',
		];
		const randomIndex = Math.floor(Math.random() * answerKeys.length);
		const answer = await t(interaction, answerKeys[randomIndex]);
		const thinkingComponents = await simpleContainer(
			interaction,
			await t(interaction, 'fun.commands.8ball.thinking.desc'),
			{
				color: kythiaConfig.bot.color,
			},
		);
		await interaction.reply({
			components: thinkingComponents,
			flags: MessageFlags.IsComponentsV2,
		});
		setTimeout(async () => {
			const resultComponents = await simpleContainer(
				interaction,
				await t(interaction, 'fun.commands.8ball.result.desc', {
					question,
					answer,
				}),
				{
					color: kythiaConfig.bot.color,
				},
			);
			await interaction.editReply({
				components: resultComponents,
				flags: MessageFlags.IsComponentsV2,
			});
		}, 2000);
	}
}
exports.default = EightballCommand;
