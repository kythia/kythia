const fs = require('fs');
const path = require('path');

const ecoDir =
	'/media/kenndeclouv/Second/Projects/discord/kythia/addons/economy';
const langFile = path.join(ecoDir, 'lang', 'en-US.json');

const langData = JSON.parse(fs.readFileSync(langFile, 'utf8'));

// Inject new keys
langData.economy.market = langData.economy.market || {};
langData.economy.market.view = langData.economy.market.view || {};
langData.economy.market.view.pool_not_found_md =
	'## ❌ KYTH Pool Not Found\nThe AMM has not been initialized.';
langData.economy.market.view.title_md = '## 💎 KYTH Coin — AMM Market Data';
langData.economy.market.view.token_title_md =
	'## {title}\n**Token Address:** `{contractAddress}`\n\n**Current Price:** 🪙 {price}\n**Market Cap:** 🪙 {cap}\n**Total Supply:** {supply}\n\n**Price Change (24h):** {priceChange24h}\n**Volume (24h):** {volume24h}\n**Holders:** {holders}';

langData.economy.market.stoploss = langData.economy.market.stoploss || {};
langData.economy.market.stoploss.unsupported_md =
	'## ❌ Unsupported Asset\nStop-loss orders are **not supported** for the `KYTH` token due to the real-time Automated Market Maker mechanics. Please use `/eco market sell` directly.';

langData.economy.market.sell = langData.economy.market.sell || {};
langData.economy.market.sell.insufficient_kyth_md =
	'## ❌ Insufficient KYTH\nYou only have **{userKyth} KYTH**. Cannot sell **{sellQuantity} KYTH**.';
langData.economy.market.sell.amm_unavailable_md =
	'## ❌ AMM Unavailable\nThe KYTH liquidity pool is not initialized.';
langData.economy.market.sell.insufficient_liquidity_md =
	'## ❌ Insufficient Pool Liquidity\nThe pool does not have enough Coin to fill your sell order.';

langData.economy.market.portfolio = langData.economy.market.portfolio || {};
langData.economy.market.portfolio.holding_md = '### 💠 {assetId}\n{desc}';
langData.economy.market.portfolio.holding_pnl_md =
	'### 💠 {assetId}{pnlIndicator}';

langData.economy.market.limit = langData.economy.market.limit || {};
langData.economy.market.limit.unsupported_md =
	'## ❌ Unsupported Asset\nLimit orders are **not supported** for the `KYTH` token due to the real-time Automated Market Maker mechanics. Please use `/eco market buy` or `/eco market sell` directly.';

langData.economy.market.history = langData.economy.market.history || {};
langData.economy.market.history.title_md = '## {title}\n{desc}';

langData.economy.guild_stock = langData.economy.guild_stock || {};
langData.economy.guild_stock.view = langData.economy.guild_stock.view || {};
langData.economy.guild_stock.view.title_md =
	'## {title}\n{status}\n\n**Current Price:** {priceStr}\n**Market Cap:** {capStr}\n**Holders:** {holdersStr}\n\n**KYTH Liquidity (X):** {xStr}\n**Token Reserve (Y):** {yStr}\n**Trading Fee:** {feeStr}\n\n> {footer}';

langData.economy.guild_stock.top = langData.economy.guild_stock.top || {};
langData.economy.guild_stock.top.title_md = '## {title}\n{msg}';
langData.economy.guild_stock.top.full_title_md =
	'## {title}\n{desc}\n\n{description}';

langData.economy.guild_stock.portfolio =
	langData.economy.guild_stock.portfolio || {};
langData.economy.guild_stock.portfolio.holding_md =
	'### ${ticker}\n{fieldText}';
langData.economy.guild_stock.portfolio.title_md =
	'## {title}\n{desc}\n\n{fieldsText}';

langData.economy.guild_stock.create = langData.economy.guild_stock.create || {};
langData.economy.guild_stock.create.title_md =
	'## {title}\n{desc}\n\n**Initial Price:** {priceText}\n**Initial Liquidity:** {liquidityText}\n**Initial Supply:** {supplyText}\n\n> {footer}';

fs.writeFileSync(langFile, JSON.stringify(langData, null, '\t'), 'utf8');

// Now process JS files
const filesToProcess = {
	'commands/market/view.js': (content) => {
		content = content.replace(
			/'## ❌ KYTH Pool Not Found\\nThe AMM has not been initialized.',/g,
			"await t(interaction, 'economy.market.view.pool_not_found_md'),",
		);
		content = content.replace(
			/`## 💎 KYTH Coin — AMM Market Data`,/g,
			"await t(interaction, 'economy.market.view.title_md'),",
		);
		content = content.replace(
			/let description = `## \$\{await t\([\s\S]*?\)\}\\n\*\*Token Address:\*\* `\$\{contractAddress\}`\\n\\n\*\*Current Price:\*\* 🪙 \$\{priceStr\}\n\*\*Market Cap:\*\* 🪙 \$\{capStr\}\n\*\*Total Supply:\*\* \$\{supplyStr\}\n\\n\*\*Price Change \(24h\):\*\* \$\{priceChange24h\}\n\*\*Volume \(24h\):\*\* \$\{volume24h\}\n\*\*Holders:\*\* \$\{holdersStr\}`;/g,
			"let description = await t(interaction, 'economy.market.view.token_title_md', {\n\t\t\t\ttitle: await t(interaction, 'economy.market.view.token_title', { asset: asset.toUpperCase() }),\n\t\t\t\tcontractAddress,\n\t\t\t\tprice: priceStr,\n\t\t\t\tcap: capStr,\n\t\t\t\tsupply: supplyStr,\n\t\t\t\tpriceChange24h,\n\t\t\t\tvolume24h,\n\t\t\t\tholders: holdersStr\n\t\t\t});",
		);
		return content;
	},
	'commands/market/stoploss.js': (content) => {
		content = content.replace(
			/'## ❌ Unsupported Asset\\nStop-loss orders are \*\*not supported\*\* for the `KYTH` token due to the real-time Automated Market Maker mechanics\. Please use `\/eco market sell` directly\.',/g,
			"await t(interaction, 'economy.market.stoploss.unsupported_md'),",
		);
		return content;
	},
	'commands/market/sell.js': (content) => {
		content = content.replace(
			/`## ❌ Insufficient KYTH\\nYou only have \*\*\$\{userKyth\.toFixed\(6\)\} KYTH\*\*\. Cannot sell \*\*\$\{sellQuantity\.toFixed\(6\)\} KYTH\*\*\.`,/g,
			"await t(interaction, 'economy.market.sell.insufficient_kyth_md', { userKyth: userKyth.toFixed(6), sellQuantity: sellQuantity.toFixed(6) }),",
		);
		content = content.replace(
			/'## ❌ AMM Unavailable\\nThe KYTH liquidity pool is not initialized.',/g,
			"await t(interaction, 'economy.market.sell.amm_unavailable_md'),",
		);
		content = content.replace(
			/'## ❌ Insufficient Pool Liquidity\\nThe pool does not have enough Coin to fill your sell order.',/g,
			"await t(interaction, 'economy.market.sell.insufficient_liquidity_md'),",
		);
		return content;
	},
	'commands/market/portfolio.js': (content) => {
		content = content.replace(
			/`### 💠 \$\{holding\.assetId\.toUpperCase\(\)\}\\n\$\{await t\([\s\S]*?\)\}`/g,
			"await t(interaction, 'economy.market.portfolio.holding_md', { assetId: holding.assetId.toUpperCase(), desc: await t(interaction, 'economy.market.portfolio.holding_desc', { ...holding }) })",
		);
		content = content.replace(
			/`### 💠 \$\{holding\.assetId\.toUpperCase\(\)\}\$\{pnl > 0 \? ' {2}📈' : pnl < 0 \? ' {2}📉' : ''\}`/g,
			"await t(interaction, 'economy.market.portfolio.holding_pnl_md', { assetId: holding.assetId.toUpperCase(), pnlIndicator: pnl > 0 ? '  📈' : pnl < 0 ? '  📉' : '' })",
		);
		content = content.replace(
			/`## \$\{await t\(interaction, 'economy\.market\.portfolio\.title', \{[\s\S]*?\}\)\}\\n\$\{await t\(interaction, 'economy\.market\.portfolio\.desc', \{[\s\S]*?\}\)\}`/g,
			"await t(interaction, 'economy.market.portfolio.title_md', { title: await t(interaction, 'economy.market.portfolio.title', { username: user.username, totalUsd: totalUsd.toFixed(2), totalValueKyth: totalValueKyth.toFixed(6) }), desc: await t(interaction, 'economy.market.portfolio.desc') })",
		);
		return content;
	},
	'commands/market/limit.js': (content) => {
		content = content.replace(
			/'## ❌ Unsupported Asset\\nLimit orders are \*\*not supported\*\* for the `KYTH` token due to the real-time Automated Market Maker mechanics\. Please use `\/eco market buy` or `\/eco market sell` directly\.',/g,
			"await t(interaction, 'economy.market.limit.unsupported_md'),",
		);
		return content;
	},
	'commands/market/history.js': (content) => {
		content = content.replace(
			/`## \$\{await t\(interaction, 'economy\.market\.history\.title', \{[\s\S]*?\}\)\}\\n\$\{desc\}`/g,
			"await t(interaction, 'economy.market.history.title_md', { title: await t(interaction, 'economy.market.history.title', { username: user.username }), desc })",
		);
		return content;
	},
	'commands/guild_stock/view.js': (content) => {
		content = content.replace(
			/`## \$\{title\}\\n\$\{status\}\\n\\n\*\*Current Price:\*\* \$\{priceStr\}\\n\*\*Market Cap:\*\* \$\{capStr\}\\n\*\*Holders:\*\* \$\{holdersStr\}\\n\\n\*\*KYTH Liquidity \(X\):\*\* \$\{xStr\}\\n\*\*Token Reserve \(Y\):\*\* \$\{yStr\}\\n\*\*Trading Fee:\*\* \$\{feeStr\}\\n\\n> \$\{footer\}`/g,
			"await t(interaction, 'economy.guild_stock.view.title_md', { title, status, priceStr, capStr, holdersStr, xStr, yStr, feeStr, footer })",
		);
		return content;
	},
	'commands/guild_stock/top.js': (content) => {
		content = content.replace(
			/`## \$\{title\}\\n\$\{msg\}`/g,
			"await t(interaction, 'economy.guild_stock.top.title_md', { title, msg })",
		);
		content = content.replace(
			/`## \$\{title\}\\n\$\{desc\}\\n\\n\$\{description\}`/g,
			"await t(interaction, 'economy.guild_stock.top.full_title_md', { title, desc, description })",
		);
		return content;
	},
	'commands/guild_stock/portfolio.js': (content) => {
		content = content.replace(
			/`### \$\$\{pool\.ticker\}\\n\$\{fieldText\}`/g,
			"await t(interaction, 'economy.guild_stock.portfolio.holding_md', { ticker: pool.ticker, fieldText })",
		);
		content = content.replace(
			/`## \$\{title\}\\n\$\{desc\}\\n\\n\$\{fieldsText\.join\('\\n\\n'\)\}`/g,
			"await t(interaction, 'economy.guild_stock.portfolio.title_md', { title, desc, fieldsText: fieldsText.join('\\n\\n') })",
		);
		return content;
	},
	'commands/guild_stock/create.js': (content) => {
		content = content.replace(
			/`## \$\{title\}\\n\$\{desc\}\\n\\n\*\*Initial Price:\*\* \$\{priceText\}\\n\*\*Initial Liquidity:\*\* \$\{liquidityText\}\\n\*\*Initial Supply:\*\* \$\{supplyText\}\\n\\n> \$\{footer\}`/g,
			"await t(interaction, 'economy.guild_stock.create.title_md', { title, desc, priceText, liquidityText, supplyText, footer })",
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
		}
	}
}
