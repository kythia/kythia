const fs = require('fs');
const path = require('path');

const economyFile =
	'/media/kenndeclouv/Second/Projects/discord/kythia/addons/economy/lang/en-US.json';
const petFile =
	'/media/kenndeclouv/Second/Projects/discord/kythia/addons/pet/lang/en-US.json';

// Economy
if (fs.existsSync(economyFile)) {
	const ecoLang = JSON.parse(fs.readFileSync(economyFile, 'utf8'));
	ecoLang.economy.market = ecoLang.economy.market || {};
	ecoLang.economy.market.portfolio = ecoLang.economy.market.portfolio || {};

	ecoLang.economy.market.portfolio.holding_desc =
		'### {tokenName} ({tokenCode})\n**Balance:** `{balance} Tokens`\n**Average Price:** `🪙 {avgPrice}`\n**Current Price:** `🪙 {currentPrice}`\n**P/L:** {plEmoji} `{plValue}%`';
	ecoLang.economy.market.portfolio.title_md = '## 📊 Your Crypto Portfolio';

	fs.writeFileSync(economyFile, JSON.stringify(ecoLang, null, '\t'));
}

// Pet
if (fs.existsSync(petFile)) {
	const petLang = JSON.parse(fs.readFileSync(petFile, 'utf8'));
	petLang.pet.admin = petLang.pet.admin || {};
	petLang.pet.admin.list = petLang.pet.admin.list || {};
	petLang.pet.admin.list.list = petLang.pet.admin.list.list || {};
	petLang.pet.admin.list.list.empty = petLang.pet.admin.list.list.empty || {};
	petLang.pet.admin.list.list.empty.msg_md = '## {title}\nNo pets available.';

	petLang.pet.info = petLang.pet.info || {};
	petLang.pet.info.dead = petLang.pet.info.dead || {};
	petLang.pet.info.dead.msg_md = '## {title}\n{desc}';
	petLang.pet.info.desc = 'Your pet info';

	petLang.pet.info.no = petLang.pet.info.no || {};
	petLang.pet.info.no.pet = petLang.pet.info.no.pet || {};
	petLang.pet.info.no.pet.msg_md = '## {title}\n{desc}';

	petLang.pet.leaderboard = petLang.pet.leaderboard || {};
	petLang.pet.leaderboard.title = 'Pet Leaderboard';

	petLang.pet.play = petLang.pet.play || {};
	petLang.pet.play.success = petLang.pet.play.success || {};
	petLang.pet.play.success.desc = 'You played with your pet.';
	petLang.pet.play.success.title_md = '## Play Time!\n{desc}';

	petLang.pet.use = petLang.pet.use || {};
	petLang.pet.use.success = petLang.pet.use.success || {};
	petLang.pet.use.success.desc = 'You used an item.';
	petLang.pet.use.success.title_md = '## Item Used\n{desc}';

	fs.writeFileSync(petFile, JSON.stringify(petLang, null, '\t'));
}

console.log('Fixed missing keys!');
