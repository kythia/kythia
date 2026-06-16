const FACTS_PER_PAGE = 10;

async function generateFactsContainer(
	interaction,
	page,
	allFacts,
	totalFacts,
	navDisabled = false,
) {
	const { t, helpers } = interaction.client.container;
	const { createPaginationContainer } = helpers.discord;

	const totalPages = Math.max(1, Math.ceil(totalFacts / FACTS_PER_PAGE));
	page = Math.max(1, Math.min(page, totalPages));

	const startIndex = (page - 1) * FACTS_PER_PAGE;
	const pageFacts = allFacts.slice(startIndex, startIndex + FACTS_PER_PAGE);

	let listText = '';
	if (pageFacts.length === 0) {
		listText = await t(interaction, 'ai.ai.facts.empty');
	} else {
		const UserFactsManager = require('./UserFactsManager');
		const grouped = {};

		for (let i = 0; i < pageFacts.length; i++) {
			const fact = pageFacts[i];
			const factNumber = startIndex + i + 1;
			const label = UserFactsManager.typeLabels[fact.type] || 'Lainnya';
			if (!grouped[label]) grouped[label] = [];
			grouped[label].push({ number: factNumber, text: fact.fact });
		}

		const entries = [];
		for (const label in grouped) {
			entries.push(`**${label}:**`);
			for (const fact of grouped[label]) {
				entries.push(`  \`${fact.number}.\` ${fact.text}`);
			}
		}
		listText = entries.join('\n');
		listText += '\n\n_Use `/ai fact-delete <number>` to remove a fact._';
	}

	const [factsContainer] = await createPaginationContainer(interaction, {
		page,
		totalPages,
		title: await t(interaction, 'ai.ai.facts.title'),
		content: listText,
		footer: await t(interaction, 'ai.ai.facts.footer', {
			page,
			totalPages,
			totalFacts,
		}),
		customIdPrefix: 'ai_facts',
		navDisabled,
	});

	return { factsContainer, page, totalPages };
}

module.exports = {
	generateFactsContainer,
};
