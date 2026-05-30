/**
 * @namespace: addons/api/routes/pro.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { Hono } = require('hono');
const CloudflareApi = require('../../pro/helpers/CloudflareApi');

const app = new Hono();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const getContainer = (c) => c.get('client').container;
const getModels = (c) => getContainer(c).models;
const getLogger = (c) => getContainer(c).logger;

/** Lazy CloudflareApi — initialised once per request (cheap, stateless after init). */
function getCfApi(c) {
	const container = getContainer(c);
	return new CloudflareApi({
		kythiaConfig: container.kythiaConfig,
		logger: container.logger,
		models: container.models,
	});
}

const FORBIDDEN_NAMES = [
	'www',
	'mail',
	'api',
	'bot',
	'admin',
	'dashboard',
	'kythia',
	'kyth',
	'avalon',
	'hyperion',
	'ftp',
	'smtp',
	'imap',
	'pop',
	'pop3',
	'ns',
	'ns1',
	'ns2',
	'cpanel',
];

const VALID_RECORD_TYPES = ['A', 'AAAA', 'CNAME', 'TXT', 'MX'];
const VALID_STATUSES = ['UP', 'DOWN', 'PENDING'];

function validateSubdomainName(name) {
	if (!name || typeof name !== 'string') return 'name is required';
	const n = name.toLowerCase();
	if (!/^[a-z0-9-]+$/.test(n))
		return 'name may only contain a-z, 0-9, and hyphens';
	if (n.length < 3 || n.length > 32) return 'name must be 3–32 characters';
	if (n.startsWith('-') || n.endsWith('-'))
		return 'name must not start or end with a hyphen';
	if (FORBIDDEN_NAMES.includes(n)) return `name "${n}" is reserved`;
	return null;
}

// ===========================================================================
// SUBDOMAINS
// ===========================================================================

// ---------------------------------------------------------------------------
// GET /api/pro/subdomains — list all (optional ?userId=)
// ---------------------------------------------------------------------------
app.get('/subdomains', async (c) => {
	const { Subdomain } = getModels(c);
	const where = {};
	const userId = c.req.query('userId');
	if (userId) where.userId = userId;
	try {
		const rows = await Subdomain.getAllCache({
			where,
			order: [['createdAt', 'ASC']],
		});
		return c.json({ status: 'ok', count: rows.length, data: rows });
	} catch (err) {
		getLogger(c).error('GET /api/pro/subdomains error:', err);
		return c.json({ status: 'error', error: err.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// GET /api/pro/subdomains/:id — single subdomain with its DNS records
// ---------------------------------------------------------------------------
app.get('/subdomains/:id', async (c) => {
	const { Subdomain, DnsRecord } = getModels(c);
	const id = parseInt(c.req.param('id'), 10);
	if (!id) return c.json({ status: 'error', error: 'Invalid id' }, 400);
	try {
		const row = await Subdomain.getCache({
			id: id,
			include: [{ model: DnsRecord, as: 'dnsRecords' }],
		});
		if (!row)
			return c.json(
				{ status: 'error', error: 'Subdomain not found', code: 'NOT_FOUND' },
				404,
			);
		return c.json({ status: 'ok', data: row });
	} catch (err) {
		return c.json({ status: 'error', error: err.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// POST /api/pro/subdomains — claim a new subdomain
// Body: { userId, name }
// ---------------------------------------------------------------------------
app.post('/subdomains', async (c) => {
	const { Subdomain } = getModels(c);
	let body;
	try {
		body = await c.req.json();
	} catch {
		return c.json({ status: 'error', error: 'Invalid JSON' }, 400);
	}

	const { userId, name } = body;
	if (!userId)
		return c.json({ status: 'error', error: '"userId" is required' }, 400);

	const nameError = validateSubdomainName(name);
	if (nameError) return c.json({ status: 'error', error: nameError }, 400);

	const normalizedName = name.toLowerCase();

	// Check quota (max from config, default 5)
	const container = getContainer(c);
	const maxSubdomains = container.kythiaConfig?.addons?.pro?.maxSubdomains ?? 5;
	const userCount = await Subdomain.count({ where: { userId } });
	if (userCount >= maxSubdomains) {
		return c.json(
			{
				status: 'error',
				error: `Subdomain quota reached (${maxSubdomains} max)`,
				code: 'QUOTA_EXCEEDED',
			},
			422,
		);
	}

	try {
		const [record, created] = await Subdomain.findOrCreate({
			where: { name: normalizedName },
			defaults: { userId, name: normalizedName },
		});
		if (!created) {
			return c.json(
				{
					status: 'error',
					error: `Subdomain "${normalizedName}" is already taken`,
					code: 'CONFLICT',
				},
				409,
			);
		}
		return c.json({ status: 'ok', data: record }, 201);
	} catch (err) {
		if (err.name === 'SequelizeUniqueConstraintError') {
			return c.json(
				{ status: 'error', error: 'Subdomain already taken', code: 'CONFLICT' },
				409,
			);
		}
		getLogger(c).error('POST /api/pro/subdomains error:', err);
		return c.json({ status: 'error', error: err.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// DELETE /api/pro/subdomains/:id — release subdomain (cascades DNS records in DB)
// Note: does NOT auto-delete Cloudflare records. Use DELETE /api/pro/dns/:id first.
// ---------------------------------------------------------------------------
app.delete('/subdomains/:id', async (c) => {
	const { Subdomain } = getModels(c);
	const id = parseInt(c.req.param('id'), 10);
	if (!id) return c.json({ status: 'error', error: 'Invalid id' }, 400);
	try {
		const row = await Subdomain.getCache({ id: id });
		if (!row)
			return c.json(
				{ status: 'error', error: 'Subdomain not found', code: 'NOT_FOUND' },
				404,
			);
		await row.destroy();
		return c.json({
			status: 'ok',
			message: `Subdomain "${row.name}" released`,
		});
	} catch (err) {
		return c.json({ status: 'error', error: err.message }, 500);
	}
});

// ===========================================================================
// DNS RECORDS  (Cloudflare-backed)
// ===========================================================================

// ---------------------------------------------------------------------------
// GET /api/pro/subdomains/:id/dns — list DNS records for a subdomain
// ---------------------------------------------------------------------------
app.get('/subdomains/:id/dns', async (c) => {
	const { Subdomain, DnsRecord } = getModels(c);
	const id = parseInt(c.req.param('id'), 10);
	if (!id) return c.json({ status: 'error', error: 'Invalid id' }, 400);
	try {
		const subdomain = await Subdomain.getCache({ id: id });
		if (!subdomain)
			return c.json(
				{ status: 'error', error: 'Subdomain not found', code: 'NOT_FOUND' },
				404,
			);
		const records = await DnsRecord.getAllCache({ where: { subdomainId: id } });
		return c.json({
			status: 'ok',
			subdomain: subdomain.name,
			count: records.length,
			data: records,
		});
	} catch (err) {
		return c.json({ status: 'error', error: err.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// POST /api/pro/subdomains/:id/dns — add a DNS record (Cloudflare + DB)
// Body: { type, name, value, priority? }
// ---------------------------------------------------------------------------
app.post('/subdomains/:id/dns', async (c) => {
	const { Subdomain } = getModels(c);
	const subdomainId = parseInt(c.req.param('id'), 10);
	if (!subdomainId)
		return c.json({ status: 'error', error: 'Invalid subdomain id' }, 400);

	let body;
	try {
		body = await c.req.json();
	} catch {
		return c.json({ status: 'error', error: 'Invalid JSON' }, 400);
	}

	const { type, name, value, priority } = body;

	if (!type || !name || !value)
		return c.json(
			{ status: 'error', error: '"type", "name", and "value" are required' },
			400,
		);
	if (!VALID_RECORD_TYPES.includes(type.toUpperCase())) {
		return c.json(
			{
				status: 'error',
				error: `type must be one of: ${VALID_RECORD_TYPES.join(', ')}`,
			},
			400,
		);
	}

	try {
		const subdomain = await Subdomain.getCache({ id: subdomainId });
		if (!subdomain)
			return c.json(
				{ status: 'error', error: 'Subdomain not found', code: 'NOT_FOUND' },
				404,
			);

		const cf = getCfApi(c);
		const result = await cf.createRecord(subdomainId, subdomain.name, {
			type: type.toUpperCase(),
			name,
			value,
			priority,
		});

		if (!result.success) {
			return c.json(
				{ status: 'error', error: result.error ?? 'Cloudflare API error' },
				502,
			);
		}
		return c.json({ status: 'ok', data: result.record }, 201);
	} catch (err) {
		getLogger(c).error('POST /api/pro/subdomains/:id/dns error:', err);
		return c.json({ status: 'error', error: err.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// PATCH /api/pro/dns/:recordId — update record value (Cloudflare + DB)
// Body: { value, priority? }
// ---------------------------------------------------------------------------
app.patch('/dns/:recordId', async (c) => {
	const { DnsRecord } = getModels(c);
	const recordId = parseInt(c.req.param('recordId'), 10);
	if (!recordId)
		return c.json({ status: 'error', error: 'Invalid recordId' }, 400);

	let body;
	try {
		body = await c.req.json();
	} catch {
		return c.json({ status: 'error', error: 'Invalid JSON' }, 400);
	}
	if (!body.value)
		return c.json({ status: 'error', error: '"value" is required' }, 400);

	try {
		const record = await DnsRecord.getCache({ id: recordId });
		if (!record)
			return c.json(
				{ status: 'error', error: 'DNS record not found', code: 'NOT_FOUND' },
				404,
			);

		// If no cloudflareId, this is a DB-only record — update just DB
		if (!record.cloudflareId) {
			await record.update({ value: body.value });
			return c.json({
				status: 'ok',
				data: record,
				note: 'DB-only update (no Cloudflare ID)',
			});
		}

		const cf = getCfApi(c);
		const result = await cf.updateRecord(record, {
			value: body.value,
			priority: body.priority,
		});
		if (!result.success) {
			return c.json(
				{ status: 'error', error: result.error ?? 'Cloudflare API error' },
				502,
			);
		}
		return c.json({ status: 'ok', data: result.record });
	} catch (err) {
		getLogger(c).error('PATCH /api/pro/dns/:recordId error:', err);
		return c.json({ status: 'error', error: err.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// DELETE /api/pro/dns/:recordId — delete record (Cloudflare + DB)
// ---------------------------------------------------------------------------
app.delete('/dns/:recordId', async (c) => {
	const { DnsRecord } = getModels(c);
	const recordId = parseInt(c.req.param('recordId'), 10);
	if (!recordId)
		return c.json({ status: 'error', error: 'Invalid recordId' }, 400);

	try {
		const record = await DnsRecord.getCache({ id: recordId });
		if (!record)
			return c.json(
				{ status: 'error', error: 'DNS record not found', code: 'NOT_FOUND' },
				404,
			);

		// If no cloudflareId, just remove from DB
		if (!record.cloudflareId) {
			await record.destroy();
			return c.json({
				status: 'ok',
				message: 'Record deleted (DB-only, no Cloudflare ID)',
			});
		}

		const cf = getCfApi(c);
		const result = await cf.deleteRecord(recordId);
		if (!result.success) {
			return c.json(
				{ status: 'error', error: result.error ?? 'Cloudflare API error' },
				502,
			);
		}
		return c.json({
			status: 'ok',
			message: `DNS record (id=${recordId}) deleted from Cloudflare and database`,
		});
	} catch (err) {
		getLogger(c).error('DELETE /api/pro/dns/:recordId error:', err);
		return c.json({ status: 'error', error: err.message }, 500);
	}
});

// ===========================================================================
// MONITORS (uptime ping — one per user)
// ===========================================================================

// ---------------------------------------------------------------------------
// GET /api/pro/monitors — list all (optional ?userId= ?lastStatus=)
// ---------------------------------------------------------------------------
app.get('/monitors', async (c) => {
	const { Monitor } = getModels(c);
	const where = {};
	const userId = c.req.query('userId');
	const lastStatus = c.req.query('lastStatus');
	if (userId) where.userId = userId;
	if (lastStatus) where.lastStatus = lastStatus.toUpperCase();
	try {
		const rows = await Monitor.getAllCache({ where });
		return c.json({ status: 'ok', count: rows.length, data: rows });
	} catch (err) {
		return c.json({ status: 'error', error: err.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// GET /api/pro/monitors/:userId — single monitor for a user
// ---------------------------------------------------------------------------
app.get('/monitors/:userId', async (c) => {
	const { Monitor } = getModels(c);
	const { userId } = c.req.param();
	try {
		const row = await Monitor.getCache({ userId });
		if (!row)
			return c.json(
				{ status: 'error', error: 'Monitor not found', code: 'NOT_FOUND' },
				404,
			);
		return c.json({ status: 'ok', data: row });
	} catch (err) {
		return c.json({ status: 'error', error: err.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// POST /api/pro/monitors — create or upsert monitor
// Body: { userId, urlToPing, lastStatus? }
// ---------------------------------------------------------------------------
app.post('/monitors', async (c) => {
	const { Monitor } = getModels(c);
	let body;
	try {
		body = await c.req.json();
	} catch {
		return c.json({ status: 'error', error: 'Invalid JSON' }, 400);
	}

	const { userId, urlToPing, lastStatus } = body;
	if (!userId || !urlToPing)
		return c.json(
			{ status: 'error', error: '"userId" and "urlToPing" are required' },
			400,
		);
	if (lastStatus && !VALID_STATUSES.includes(lastStatus.toUpperCase())) {
		return c.json(
			{
				status: 'error',
				error: `lastStatus must be: ${VALID_STATUSES.join(', ')}`,
			},
			400,
		);
	}

	try {
		const [row, created] = await Monitor.findOrCreate({
			where: { userId },
			defaults: {
				userId,
				urlToPing,
				lastStatus: lastStatus?.toUpperCase() ?? 'PENDING',
			},
		});
		if (!created) {
			await row.update({
				urlToPing,
				lastStatus: lastStatus?.toUpperCase() ?? row.lastStatus,
			});
		}
		return c.json({ status: 'ok', created, data: row }, created ? 201 : 200);
	} catch (err) {
		getLogger(c).error('POST /api/pro/monitors error:', err);
		return c.json({ status: 'error', error: err.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// PATCH /api/pro/monitors/:userId — update urlToPing or lastStatus
// Body: { urlToPing?, lastStatus? }
// ---------------------------------------------------------------------------
app.patch('/monitors/:userId', async (c) => {
	const { Monitor } = getModels(c);
	const { userId } = c.req.param();
	let body;
	try {
		body = await c.req.json();
	} catch {
		return c.json({ status: 'error', error: 'Invalid JSON' }, 400);
	}

	if (
		body.lastStatus &&
		!VALID_STATUSES.includes(body.lastStatus.toUpperCase())
	) {
		return c.json(
			{
				status: 'error',
				error: `lastStatus must be: ${VALID_STATUSES.join(', ')}`,
			},
			400,
		);
	}
	try {
		const row = await Monitor.getCache({ userId });
		if (!row)
			return c.json(
				{ status: 'error', error: 'Monitor not found', code: 'NOT_FOUND' },
				404,
			);
		await row.update({
			urlToPing: body.urlToPing ?? row.urlToPing,
			lastStatus: body.lastStatus?.toUpperCase() ?? row.lastStatus,
		});
		return c.json({ status: 'ok', data: row });
	} catch (err) {
		return c.json({ status: 'error', error: err.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// DELETE /api/pro/monitors/:userId — delete monitor
// ---------------------------------------------------------------------------
app.delete('/monitors/:userId', async (c) => {
	const { Monitor } = getModels(c);
	const { userId } = c.req.param();
	try {
		const row = await Monitor.getCache({ userId });
		if (!row)
			return c.json(
				{ status: 'error', error: 'Monitor not found', code: 'NOT_FOUND' },
				404,
			);
		await row.destroy();
		return c.json({
			status: 'ok',
			message: `Monitor for user ${userId} deleted`,
		});
	} catch (err) {
		return c.json({ status: 'error', error: err.message }, 500);
	}
});

module.exports = app;
