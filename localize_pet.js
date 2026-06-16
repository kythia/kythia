const fs = require('fs');
const path = require('path');

const petDir = '/media/kenndeclouv/Second/Projects/discord/kythia/addons/pet';
const langFile = path.join(petDir, 'lang', 'en-US.json');

const langData = JSON.parse(fs.readFileSync(langFile, 'utf8'));

// Helper to convert title & desc to msg_md
function convertToMsgMd(obj) {
	for (const key in obj) {
		if (typeof obj[key] === 'object') {
			if (obj[key].title && obj[key].desc) {
				obj[key].msg_md = `## ${obj[key].title}\n${obj[key].desc}`;
				delete obj[key].title;
				delete obj[key].desc;
			} else if (obj[key].title && !obj[key].desc) {
				obj[key].msg_md = `## ${obj[key].title}`;
				delete obj[key].title;
			} else {
				convertToMsgMd(obj[key]);
			}
		}
	}
}

convertToMsgMd(langData.pet);

// Specific edge cases
if (
	langData.pet.adopt &&
	langData.pet.adopt.success &&
	langData.pet.adopt.success.title &&
	langData.pet.adopt.success.simple
) {
	langData.pet.adopt.success.msg_md = `## ${langData.pet.adopt.success.title}\n${langData.pet.adopt.success.simple}`;
	delete langData.pet.adopt.success.title;
	delete langData.pet.adopt.success.simple;
}

if (
	langData.pet.play &&
	langData.pet.play.success &&
	langData.pet.play.success.title_md &&
	langData.pet.play.success.desc
) {
	langData.pet.play.success.msg_md = `${langData.pet.play.success.title_md}\n${langData.pet.play.success.desc}`;
	delete langData.pet.play.success.title_md;
	delete langData.pet.play.success.desc;
}

if (
	langData.pet.use &&
	langData.pet.use.success &&
	langData.pet.use.success.title_md &&
	langData.pet.use.success.desc
) {
	langData.pet.use.success.msg_md = `${langData.pet.use.success.title_md}\n${langData.pet.use.success.desc}`;
	delete langData.pet.use.success.title_md;
	delete langData.pet.use.success.desc;
}

if (
	langData.pet.admin &&
	langData.pet.admin.list &&
	langData.pet.admin.list.list &&
	langData.pet.admin.list.list.title_md &&
	langData.pet.admin.list.list.desc
) {
	langData.pet.admin.list.list.msg_md = `${langData.pet.admin.list.list.title_md}\n${langData.pet.admin.list.list.desc}`;
	// don't delete desc as it might be used separately, but wait, let's just make msg_md
}

fs.writeFileSync(langFile, JSON.stringify(langData, null, '\t'), 'utf8');

// Now process JS files
function processDir(dir) {
	const files = fs.readdirSync(dir);
	for (const file of files) {
		const fullPath = path.join(dir, file);
		if (fs.statSync(fullPath).isDirectory()) {
			processDir(fullPath);
		} else if (fullPath.endsWith('.js')) {
			let content = fs.readFileSync(fullPath, 'utf8');

			// Regex to match: `## ${await t(interaction, 'KEY.title')}\n${await t(interaction, 'KEY.desc')}`
			content = content.replace(
				/`## \$\{await t\(\s*interaction\s*,\s*'([^']+)\.title'\s*\)\}\\n\$\{await t\(\s*interaction\s*,\s*'\1\.desc'\s*\)\}`/g,
				"await t(interaction, '$1.msg_md')",
			);

			// Regex to match: `## ${await t(interaction, 'KEY.title')}\n${await t(interaction, 'KEY.desc', { ... })}`
			// This is harder with regex because of the nested object. We'll handle it generically.
			content = content.replace(
				/`## \$\{await t\(interaction,\s*'([^']+)\.title'\)\}\\n\$\{await t\(\s*interaction,\s*'\1\.desc',\s*(\{[\s\S]*?\})\s*\)\}`/g,
				"await t(interaction, '$1.msg_md', $2)",
			);

			// Handle adopt success which used 'simple'
			content = content.replace(
				/`## \$\{await t\(interaction,\s*'pet\.adopt\.success\.title'\)\}\\n\$\{await t\(\s*interaction,\s*'pet\.adopt\.success\.simple',\s*(\{[\s\S]*?\})\s*\)\}`/g,
				"await t(interaction, 'pet.adopt.success.msg_md', $1)",
			);

			// Handle play success which used title_md and desc
			content = content.replace(
				/`\$\{await t\(interaction,\s*'pet\.play\.success\.title_md'\)\}\\n\$\{await t\(\s*interaction,\s*'pet\.play\.success\.desc',\s*(\{[\s\S]*?\})\s*\)\}`/g,
				"await t(interaction, 'pet.play.success.msg_md', $1)",
			);

			// Handle use success which used title_md and desc
			content = content.replace(
				/`\$\{await t\(interaction,\s*'pet\.use\.success\.title_md'\)\}\\n\$\{await t\(\s*interaction,\s*'pet\.use\.success\.desc',\s*(\{[\s\S]*?\})\s*\)\}`/g,
				"await t(interaction, 'pet.use.success.msg_md', $1)",
			);

			// Handle those with only title
			content = content.replace(
				/`## \$\{await t\(\s*interaction\s*,\s*'([^']+)\.title'\s*\)\}`/g,
				"await t(interaction, '$1.msg_md')",
			);

			// admin/list.js
			content = content.replace(
				/`## \$\{await t\(interaction, 'pet\.admin\.list\.list\.empty\.title'\)\}\\n\$\{await t\(interaction, 'pet\.admin\.list\.list\.empty\.desc'\)\}`/g,
				"await t(interaction, 'pet.admin.list.list.empty.msg_md')",
			);
			content = content.replace(
				/`\$\{await t\(interaction, 'pet\.admin\.list\.list\.title_md'\)\}\\n\$\{await t\(interaction, 'pet\.admin\.list\.list\.desc'\)\}`/g,
				"await t(interaction, 'pet.admin.list.list.msg_md')",
			);

			fs.writeFileSync(fullPath, content, 'utf8');
		}
	}
}

processDir(path.join(petDir, 'commands'));
