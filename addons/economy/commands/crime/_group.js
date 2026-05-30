module.exports = {
	subcommand: true,
	slashCommand: (group) =>
		group
			.setName('crime')
			.setDescription('Commit crimes, bounties, and blackmarket.'),
};
