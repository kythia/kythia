const fs = require('fs');
const path = require('path');

const ecoDir =
	'/media/kenndeclouv/Second/Projects/discord/kythia/addons/economy';
const langFile = path.join(ecoDir, 'lang', 'en-US.json');

const langData = JSON.parse(fs.readFileSync(langFile, 'utf8'));

// Inject new keys
langData.economy.market.view.chart = langData.economy.market.view.chart || {};
langData.economy.market.view.chart.title_md = '## {title}';

fs.writeFileSync(langFile, JSON.stringify(langData, null, '\t'), 'utf8');

// Now process JS files
const filesToProcess = {
	'commands/market/view.js': (content) => {
		content = content.replace(
			/let description = `## \$\{await t\(\s*interaction,\s*'economy\.market\.view\.chart\.title',\s*\{\s*asset: assetName,\s*timeframe: timeframe,\s*\},\s*\)\}\\n\\n`;/g,
			"let description = `${await t(interaction, 'economy.market.view.chart.title_md', {\n\t\t\t\ttitle: await t(interaction, 'economy.market.view.chart.title', { asset: assetName, timeframe }),\n\t\t\t})}\\n\\n`;",
		);
		return content;
	},
	'commands/market/portfolio.js': (content) => {
		content = content.replace(
			/`## \$\{await t\(interaction, 'economy\.market\.portfolio\.title', \{\s*username: interaction\.user\.username,\s*\}\)\}`/g,
			"await t(interaction, 'economy.market.portfolio.title_md', {\n\t\t\t\ttitle: await t(interaction, 'economy.market.portfolio.title', { username: interaction.user.username })\n\t\t\t})",
		);
		return content;
	},
	'commands/market/history.js': (content) => {
		content = content.replace(
			/const msg = `## \$\{await t\(interaction, 'economy\.market\.history\.title', \{\s*username: interaction\.user\.username,\s*\}\)\}\\n\\n\$\{description\}`;/g,
			"const msg = await t(interaction, 'economy.market.history.title_md', {\n\t\t\t\ttitle: await t(interaction, 'economy.market.history.title', { username: interaction.user.username }),\n\t\t\t\tdesc: description\n\t\t\t});",
		);
		return content;
	},
};

for (const [file, processor] of Object.entries(filesToProcess)) {
	const fullPath = path.join(ecoDir, file);
	if (fs.existsSync(fullPath)) {
		const content = fs.readFileSync(fullPath, 'utf8');
		const newContent = processor(content);
		if (newContent !== content) {
			fs.writeFileSync(fullPath, newContent, 'utf8');
			console.log(`Updated ${file}`);
		} else {
			console.log(`No changes made to ${file}`);
		}
	}
}
