const { Op } = require('sequelize');
const date = new Date();
const where = { expiresAt: { [Op.lte]: date } };
console.log('JSON stringify:', JSON.stringify(where));
