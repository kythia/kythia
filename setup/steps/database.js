/**
 * @file setup/steps/database.js
 * @description Setup Step 3 - Database Configuration
 * @copyright © 2026 kenndeclouv
 */

/** biome-ignore-all lint/suspicious/noConsole: not the bot log, ignore console warn */
const { ask, select, _confirm, header, hint, warn } = require('../prompt');

module.exports = async (totalSteps = 6) => {
	header(`Step 3 / ${totalSteps}`, '🗄️  Database');

	const driver = await select(
		'Database driver',
		[
			{ label: 'SQLite (default, no setup needed)', value: 'sqlite' },
			{ label: 'MySQL', value: 'mysql' },
			{ label: 'MariaDB', value: 'mariadb' },
			{ label: 'PostgreSQL', value: 'postgres' },
			{ label: 'MSSQL', value: 'mssql' },
		],
		'sqlite',
	);

	if (driver === 'sqlite') {
		hint(
			'SQLite will create a local file automatically — no further setup needed.',
		);
		const dbName = await ask('SQLite file name', 'kythia.sqlite');
		return { driver, dbName };
	}

	warn(
		`Make sure you have the ${driver} driver installed: npm install ${driver === 'postgres' ? 'pg pg-hstore' : driver === 'mssql' ? 'tedious' : `${driver}2`}`,
	);

	const dbHost = await ask('Database host', 'localhost');
	const dbPort = await ask(
		'Database port',
		driver === 'postgres' ? '5432' : driver === 'mssql' ? '1433' : '3306',
	);
	const dbName = await ask('Database name', 'kythia');
	const dbUser = await ask('Database username', 'root');
	const dbPass = await ask('Database password', '', true);

	return { driver, dbHost, dbPort, dbName, dbUser, dbPass };
};
