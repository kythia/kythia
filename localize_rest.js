const fs = require('fs');
const path = require('path');

const addonsDir = '/media/kenndeclouv/Second/Projects/discord/kythia/addons';

// 1. NSFW
const nsfwLang = path.join(addonsDir, 'nsfw/lang/en-US.json');
if (fs.existsSync(nsfwLang)) {
	const lang = JSON.parse(fs.readFileSync(nsfwLang, 'utf8'));
	lang.nsfw.helpers = lang.nsfw.helpers || {};
	lang.nsfw.helpers.ui = lang.nsfw.helpers.ui || {};
	lang.nsfw.helpers.ui.favorite = lang.nsfw.helpers.ui.favorite || {};
	lang.nsfw.helpers.ui.favorite.title_md = '## Your NSFW Favorites ❤️';
	fs.writeFileSync(nsfwLang, JSON.stringify(lang, null, '\t'));

	let uiJs = fs.readFileSync(
		path.join(addonsDir, 'nsfw/helpers/ui.js'),
		'utf8',
	);
	uiJs = uiJs.replace(
		/title: '## Your NSFW Favorites ❤️',/g,
		"title: await interaction.client.container.t(interaction, 'nsfw.helpers.ui.favorite.title_md'),",
	);
	fs.writeFileSync(path.join(addonsDir, 'nsfw/helpers/ui.js'), uiJs);
}

// 2. QUEST
const questLang = path.join(addonsDir, 'quest/lang/en-US.json');
if (fs.existsSync(questLang)) {
	const lang = JSON.parse(fs.readFileSync(questLang, 'utf8'));
	lang.quest.helper = lang.quest.helper || {};
	lang.quest.helper.notify_md = '### Notify: \n{role}\n';
	fs.writeFileSync(questLang, JSON.stringify(lang, null, '\t'));

	let qhJs = fs.readFileSync(
		path.join(addonsDir, 'quest/helpers/questHelper.js'),
		'utf8',
	);
	qhJs = qhJs.replace(
		/`\$\{role \? `### Notify: \\n\$\{role\}\\n` : ''\}`/g,
		"role ? await t(fakeInteraction, 'quest.helper.notify_md', { role }) : ''",
	);
	fs.writeFileSync(path.join(addonsDir, 'quest/helpers/questHelper.js'), qhJs);
}

// 3. ADVENTURE
const advLang = path.join(addonsDir, 'adventure/lang/en-US.json');
if (fs.existsSync(advLang)) {
	const lang = JSON.parse(fs.readFileSync(advLang, 'utf8'));
	lang.adventure.start.success.title_md = '## {title}\n{desc}';
	fs.writeFileSync(advLang, JSON.stringify(lang, null, '\t'));

	let startJs = fs.readFileSync(
		path.join(addonsDir, 'adventure/commands/start.js'),
		'utf8',
	);
	startJs = startJs.replace(
		/`## \$\{await t\(interaction, 'adventure\.start\.success\.title'\)\}\\n\$\{await t\(interaction, 'adventure\.start\.success\.desc'\)\}`/g,
		"await t(interaction, 'adventure.start.success.title_md', { title: await t(interaction, 'adventure.start.success.title'), desc: await t(interaction, 'adventure.start.success.desc') })",
	);
	fs.writeFileSync(
		path.join(addonsDir, 'adventure/commands/start.js'),
		startJs,
	);
}

// 4. AI
const aiLang = path.join(addonsDir, 'ai/lang/en-US.json');
if (fs.existsSync(aiLang)) {
	const lang = JSON.parse(fs.readFileSync(aiLang, 'utf8'));
	lang.ai.ai = lang.ai.ai || {};
	lang.ai.ai.help = lang.ai.ai.help || {};
	lang.ai.ai.help.title_md = '## {title}';
	fs.writeFileSync(aiLang, JSON.stringify(lang, null, '\t'));

	let helpJs = fs.readFileSync(
		path.join(addonsDir, 'ai/commands/ai/help.js'),
		'utf8',
	);
	helpJs = helpJs.replace(
		/`## \$\{await t\(interaction, 'ai\.ai\.help\.title'\)\}`/g,
		"await t(interaction, 'ai.ai.help.title_md', { title: await t(interaction, 'ai.ai.help.title') })",
	);
	fs.writeFileSync(path.join(addonsDir, 'ai/commands/ai/help.js'), helpJs);
}

// 5. API
const apiLang = path.join(addonsDir, 'api/lang/en-US.json');
if (fs.existsSync(apiLang)) {
	const lang = JSON.parse(fs.readFileSync(apiLang, 'utf8'));
	lang.api.webhooks = lang.api.webhooks || {};
	lang.api.webhooks.account_created_md =
		'## `👤` Kythia Account Created!\nThanks for voting! You got **1,000 Kythia Coins** and unlock **vote only** command as a thank you. \nDont forget to vote for Kythia tomorrow!';
	lang.api.webhooks.thanks_voting_md =
		'## `🩷` Thanks for voting!\nYou got **1,000 Kythia Coins** and unlock **vote only** command as a thank you. \nDont forget to vote for Kythia tomorrow!';
	lang.api.webhooks.new_vote_md = '## New Vote!';
	lang.api.webhooks.purchase_md =
		'## `🎉` Purchase Successful!\nThank you for purchasing **Kythia Dashboard / Addons**.\n\nHere is your **License Key**:\n```\n{licenseKey}\n```\n\n**Transaction ID**: `{transactionId}`\n\n> *Please keep this key safe. Do not share it with anyone.*';

	lang.api.routes = lang.api.routes || {};
	lang.api.routes.verification = lang.api.routes.verification || {};
	lang.api.routes.verification.title_md = '## {title}\n\n{description}';

	lang.api.routes.tickets = lang.api.routes.tickets || {};
	lang.api.routes.tickets.title_md = '## {title}';

	lang.api.routes.modmail = lang.api.routes.modmail || {};
	lang.api.routes.modmail.staff_note_md =
		'## 👁️ Staff Note\n-# by <@{staffId}> ({staffUsername})';

	fs.writeFileSync(apiLang, JSON.stringify(lang, null, '\t'));

	// api/routes/webhooks.js
	let hookJs = fs.readFileSync(
		path.join(addonsDir, 'api/routes/webhooks.js'),
		'utf8',
	);
	hookJs = hookJs.replace(
		/`## \\`👤\\` Kythia Account Created!\\nThanks for voting! You got \*\*1,000 Kythia Coins\*\* and unlock \*\*vote only\*\* command as a thank you. \\nDont forget to vote for Kythia tomorrow!`/,
		"await client.container.t({ locale: 'en-US', client }, 'api.webhooks.account_created_md')",
	);
	hookJs = hookJs.replace(
		/`## \\`🩷\\` Thanks for voting!\\nYou got \*\*1,000 Kythia Coins\*\* and unlock \*\*vote only\*\* command as a thank you. \\nDont forget to vote for Kythia tomorrow!`;/,
		"await client.container.t({ locale: 'en-US', client }, 'api.webhooks.thanks_voting_md');",
	);
	hookJs = hookJs.replace(
		/`## New Vote!`/,
		"await client.container.t({ locale: 'en-US', client }, 'api.webhooks.new_vote_md')",
	);
	hookJs = hookJs.replace(
		/const msg = `## \\`🎉\\` Purchase Successful!\\nThank you for purchasing \*\*Kythia Dashboard \/ Addons\*\*\\.\\n\\nHere is your \*\*License Key\*\*:\\n\\`\\`\\`\$\{licenseKey\}\\`\\`\\`\\n\\n\*\*Transaction ID\*\*: \\`\$\{transactionId\}\\`\\n\\n> \*Please keep this key safe\. Do not share it with anyone\.\*`;/,
		"const msg = await client.container.t({ locale: 'en-US', client }, 'api.webhooks.purchase_md', { licenseKey, transactionId });",
	);
	fs.writeFileSync(path.join(addonsDir, 'api/routes/webhooks.js'), hookJs);

	// api/routes/verification.js
	let verJs = fs.readFileSync(
		path.join(addonsDir, 'api/routes/verification.js'),
		'utf8',
	);
	verJs = verJs.replace(
		/`## \$\{title\}\\n\\n\$\{description\}`/g,
		"await c.get('client').container.t({ locale: 'en-US', client: c.get('client') }, 'api.routes.verification.title_md', { title, description })",
	);
	fs.writeFileSync(path.join(addonsDir, 'api/routes/verification.js'), verJs);

	// api/routes/tickets.js
	let tickJs = fs.readFileSync(
		path.join(addonsDir, 'api/routes/tickets.js'),
		'utf8',
	);
	tickJs = tickJs.replace(
		/`## \$\{title\}`/g,
		"await c.get('client').container.t({ locale: 'en-US', client: c.get('client') }, 'api.routes.tickets.title_md', { title })",
	);
	tickJs = tickJs.replace(
		/`## \$\{panel.title\}`/g,
		"await c.get('client').container.t({ locale: 'en-US', client: c.get('client') }, 'api.routes.tickets.title_md', { title: panel.title })",
	);
	fs.writeFileSync(path.join(addonsDir, 'api/routes/tickets.js'), tickJs);

	// api/routes/modmail.js
	let mmJs = fs.readFileSync(
		path.join(addonsDir, 'api/routes/modmail.js'),
		'utf8',
	);
	mmJs = mmJs.replace(
		/`## 👁️ Staff Note\\n-# by <@\$\{staffId\}> \(\$\{staff\.username\}\)`/g,
		"await c.get('client').container.t({ locale: 'en-US', client: c.get('client') }, 'api.routes.modmail.staff_note_md', { staffId, staffUsername: staff.username })",
	);
	fs.writeFileSync(path.join(addonsDir, 'api/routes/modmail.js'), mmJs);
}

console.log('Updated remaining addons!');
