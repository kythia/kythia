const { Op } = require('sequelize');
function getCacheKey(query) {
	// simplified stringify that kythia might use
	const cacheKey = JSON.stringify(query, (key, value) => {
		if (typeof value === 'symbol') return value.toString();
		return value;
	});
	return cacheKey;
}

const date1 = new Date('2026-06-14T11:29:00Z');
const q1 = { where: { expiresAt: { [Op.lte]: date1 } } };

const date2 = new Date('2026-06-14T11:30:00Z');
const q2 = { where: { expiresAt: { [Op.lte]: date2 } } };

console.log('q1 stringify:', JSON.stringify(q1));
console.log('q2 stringify:', JSON.stringify(q2));

// wait, Kythia might be using something that converts symbols?
