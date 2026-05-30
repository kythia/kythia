module.exports = {
	subcommand: true,
	slashCommand: (group) =>
		group.setName('job').setDescription('Manage your job and work for coins.'),
};
