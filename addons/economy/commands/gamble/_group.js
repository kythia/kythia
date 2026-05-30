module.exports = {
	subcommand: true,
	slashCommand: (group) =>
		group
			.setName('gamble')
			.setDescription('Gamble your coins in various games.'),
};
