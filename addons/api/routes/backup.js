/**
 * @namespace: addons/api/routes/backup.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { Hono } = require('hono');
const { execFile } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const archiver = require('archiver');
const os = require('node:os');

const app = new Hono();

const ROOT = process.cwd();

/**
 * Runs mysqldump and returns the SQL as a string.
 */
function runMysqlDump(args) {
	return new Promise((resolve, reject) => {
		execFile(
			'mysqldump',
			args,
			{ maxBuffer: 512 * 1024 * 1024 },
			(err, stdout) => {
				if (err) return reject(err);
				resolve(stdout);
			},
		);
	});
}

/**
 * Creates a ZIP archive at `destPath` containing the given file entries.
 * @param {string} destPath - Absolute path to write the ZIP file.
 * @param {{ filePath: string, name: string }[]} entries - Files to include.
 */
function createZip(destPath, entries) {
	return new Promise((resolve, reject) => {
		const output = fs.createWriteStream(destPath);
		const archive = archiver('zip', { zlib: { level: 9 } });

		output.on('close', resolve);
		archive.on('error', reject);

		archive.pipe(output);

		for (const { filePath, name } of entries) {
			if (fs.existsSync(filePath)) {
				archive.file(filePath, { name });
			}
		}

		archive.finalize();
	});
}

// =============================================================================
// GET /api/backup
// Creates a ZIP archive containing:
//   - db-dump.sql      — full mysqldump of the configured database
//   - .env             — environment variables file
//   - kythia.config.js — bot configuration file
//
// Protected by the standard Bearer token like all /api/* routes.
// =============================================================================

app.get('/', async (c) => {
	const config = c.get('config');
	const container = c.get('container');
	const logger = container?.logger;

	const db = config?.db ?? {};
	const driver = db.driver ?? process.env.DB_DRIVER ?? 'mysql';

	if (driver !== 'mysql' && driver !== 'mariadb') {
		return c.json(
			{
				success: false,
				error: `Backup for DB driver '${driver}' is not supported. Only mysql/mariadb is supported.`,
			},
			400,
		);
	}

	const host = db.host ?? process.env.DB_HOST ?? '127.0.0.1';
	const port = String(db.port ?? process.env.DB_PORT ?? '3306');
	const dbName = db.name ?? process.env.DB_NAME;
	const user = db.user ?? process.env.DB_USER;
	const pass = db.pass ?? process.env.DB_PASSWORD ?? '';
	const socketPath = db.socketPath ?? process.env.DB_SOCKET_PATH;

	if (!dbName || !user) {
		return c.json(
			{ success: false, error: 'DB_NAME or DB_USER is not configured.' },
			500,
		);
	}

	const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
	const tmpDir = os.tmpdir();
	const tmpDump = path.join(tmpDir, `kythia-db-${timestamp}.sql`);
	const tmpZip = path.join(tmpDir, `kythia-backup-${timestamp}.zip`);

	try {
		// --- 1. Run mysqldump ---
		const dumpArgs = [
			`-u${user}`,
			'--single-transaction',
			'--routines',
			'--triggers',
			'--no-tablespaces',
		];

		if (pass) dumpArgs.push(`-p${pass}`);

		if (socketPath) {
			dumpArgs.push(`--socket=${socketPath}`);
		} else {
			dumpArgs.push(`-h${host}`, `-P${port}`);
		}

		dumpArgs.push(dbName);

		logger?.info(`[backup] Running mysqldump for database '${dbName}'...`);
		const sqlDump = await runMysqlDump(dumpArgs);
		fs.writeFileSync(tmpDump, sqlDump, 'utf-8');
		logger?.info(
			`[backup] mysqldump complete (${(sqlDump.length / 1024).toFixed(1)} KB)`,
		);

		// --- 2. Bundle into ZIP ---
		await createZip(tmpZip, [
			{ filePath: tmpDump, name: 'db-dump.sql' },
			{ filePath: path.join(ROOT, '.env'), name: '.env' },
			{
				filePath: path.join(ROOT, 'kythia.config.js'),
				name: 'kythia.config.js',
			},
		]);

		logger?.info('[backup] ZIP created, sending download...');

		// --- 3. Stream ZIP to client ---
		const zipBuffer = fs.readFileSync(tmpZip);
		const zipFilename = `kythia-backup-${timestamp}.zip`;

		return new Response(zipBuffer, {
			status: 200,
			headers: {
				'Content-Type': 'application/zip',
				'Content-Disposition': `attachment; filename="${zipFilename}"`,
				'Content-Length': String(zipBuffer.length),
			},
		});
	} catch (err) {
		logger?.error('[backup] Backup failed:', err);
		return c.json(
			{ success: false, error: `Backup failed: ${err.message ?? String(err)}` },
			500,
		);
	} finally {
		// Clean up temp files
		for (const f of [tmpDump, tmpZip]) {
			fs.unlink(f, () => {});
		}
	}
});

module.exports = app;
