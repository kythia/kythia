const { MessageFlags } = require('discord.js');

function formatMarketTable(rows) {
	return [
		'```',
		'SYMBOL   |    PRICE (USD)  |  24H CHANGE',
		'----------------------------------------',
		...rows,
		'```',
	].join('\n');
}

function getChangeEmoji(percent) {
	if (percent > 0) return '🟢 ▲';
	if (percent < 0) return '🔴 ▼';
	return '⏹️';
}

async function assetNotFound(interaction, assetId, t, helpers) {
	const msg = await t(interaction, 'economy.market.view.asset.not.found.desc', {
		asset: assetId.toUpperCase(),
	});
	const components = await helpers.discord.simpleContainer(interaction, msg, {
		color: 'Red',
	});
	return interaction.editReply({
		components,
		flags: MessageFlags.IsComponentsV2,
	});
}

module.exports = {
	formatMarketTable,
	getChangeEmoji,
	assetNotFound,
};
