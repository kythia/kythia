/**
 * @namespace: addons/ai/helpers/UserFactsManager.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { GoogleGenAI } = require('@google/genai');
const { getAndUseNextAvailableToken } = require('./gemini');

/**
 * UserFactsManager
 * Manages user facts: classification, storage, and retrieval.
 */
class UserFactsManager {
	/**
	 * @param {Object} dependencies
	 * @param {Object} dependencies.UserFact - Sequelize UserFact model
	 * @param {Object} dependencies.logger - Logger instance
	 * @param {Object} dependencies.config - Kythia configuration
	 */
	constructor({ UserFact, logger, config }) {
		this.UserFact = UserFact;
		this.logger = logger;
		this.config = config;
	}

	/**
	 * Fact type classifiers with regex patterns
	 */
	static factClassifiers = [
		{
			type: 'birthday',
			regex: /(lahir|birthday|ulang tahun|born|kelahiran|tanggal lahir|dob)/i,
		},
		{
			type: 'name',
			regex: /(nama|name|panggil|nickname|alias|identitas|identity)/i,
		},
		{
			type: 'hobby',
			regex: /(hobi|hobby|kesukaan|suka|interest|kegemaran|favorit)/i,
		},
		{ type: 'age', regex: /(umur|age|usia|tahun|years old)/i },
		{
			type: 'location',
			regex:
				/(alamat|tinggal|domisili|location|city|kota|asal|hometown|berasal dari)/i,
		},
		{
			type: 'job',
			regex: /(pekerjaan|job|profesi|kerja|bekerja|occupation|work)/i,
		},
		{
			type: 'education',
			regex:
				/(sekolah|school|kuliah|universitas|kampus|pendidikan|study|belajar)/i,
		},
		{
			type: 'gender',
			regex: /(gender|jenis kelamin|kelamin|pria|wanita|laki-laki|perempuan)/i,
		},
		{ type: 'religion', regex: /(agama|religion|kepercayaan|faith)/i },
		{
			type: 'relationship',
			regex:
				/(status hubungan|relationship|menikah|married|single|jomblo|pacaran)/i,
		},
		{ type: 'email', regex: /(email|e-mail|surel)/i },
		{ type: 'phone', regex: /(telepon|phone|no hp|nomor hp|wa|whatsapp)/i },
		{
			type: 'social',
			regex:
				/(media sosial|social media|sosmed|instagram|ig|facebook|fb|twitter|x\.com|tiktok|youtube|yt|linkedin|github)/i,
		},
		{ type: 'language', regex: /(bahasa|language|bilingual|multilingual)/i },
		{ type: 'physical', regex: /(tinggi|height|berat|weight)/i },
		{ type: 'color', regex: /(warna kesukaan|warna favorit|favorite color)/i },
		{
			type: 'food',
			regex:
				/(makanan kesukaan|makanan favorit|favorite food|minuman kesukaan|favorite drink)/i,
		},
		{
			type: 'animal',
			regex:
				/(hewan kesukaan|hewan favorit|favorite animal|binatang kesukaan)/i,
		},
		{ type: 'movie', regex: /(film kesukaan|film favorit|favorite movie)/i },
		{
			type: 'music',
			regex:
				/(musik kesukaan|musik favorit|favorite music|penyanyi favorit|band favorit)/i,
		},
		{
			type: 'book',
			regex: /(buku kesukaan|buku favorit|favorite book|penulis favorit)/i,
		},
		{ type: 'game', regex: /(game kesukaan|game favorit|favorite game)/i },
	];

	/**
	 * Type labels for display
	 */
	static typeLabels = {
		birthday: 'Ulang Tahun',
		name: 'Nama',
		hobby: 'Hobi',
		age: 'Umur',
		location: 'Lokasi',
		job: 'Pekerjaan',
		education: 'Pendidikan',
		gender: 'Gender',
		religion: 'Agama',
		relationship: 'Status Hubungan',
		email: 'Email',
		phone: 'Kontak',
		social: 'Media Sosial',
		language: 'Bahasa',
		physical: 'Info Fisik',
		color: 'Warna Favorit',
		food: 'Makanan/Minuman Favorit',
		animal: 'Hewan Favorit',
		movie: 'Film Favorit',
		music: 'Musik Favorit',
		book: 'Buku Favorit',
		game: 'Game Favorit',
		other: 'Fakta Lain',
	};

	/**
	 * Classify a fact into a type based on regex patterns
	 * @param {string} fact - The fact to classify
	 * @returns {string} The fact type
	 */
	classifyFact(fact) {
		for (const classifier of UserFactsManager.factClassifiers) {
			if (classifier.regex.test(fact)) {
				return classifier.type;
			}
		}
		return 'other';
	}

	/**
	 * Add a new fact to the user's profile
	 * @param {string} userId - User ID
	 * @param {string} fact - Fact to add
	 * @returns {Promise<'added'|'duplicate'|'error'>} Result status
	 */
	async appendFact(userId, fact) {
		const type = this.classifyFact(fact);

		try {
			const [_factInstance, created] =
				await this.UserFact.findOrCreateWithCache({
					where: {
						userId: userId,
						fact: fact.trim(),
					},
					defaults: {
						type: type,
					},
				});

			return created ? 'added' : 'duplicate';
		} catch (error) {
			this.logger.error(`Error in appendFact: ${error.message || error}`, {
				label: 'ai',
			});
			return 'error';
		}
	}

	/**
	 * Get formatted facts string for AI prompt
	 * @param {string} userId - User ID
	 * @returns {Promise<string>} Formatted facts string
	 */
	async getFactsString(userId) {
		const userFacts = await this.UserFact.getAllCache({
			where: { userId: userId },
			order: [['createdAt', 'DESC']],
			limit: 50,
			cacheTags: [`UserFact:byUser:${userId}`],
		});

		if (!userFacts || userFacts.length === 0) return '';

		const grouped = {};
		for (const f of userFacts) {
			const label = UserFactsManager.typeLabels[f.type] || 'Lainnya';
			if (!grouped[label]) grouped[label] = [];
			grouped[label].push(f.fact);
		}

		let result = '';
		for (const label in grouped) {
			result += `- ${label}: ${grouped[label].join('; ')}\n`;
		}
		return result.trim();
	}

	/**
	 * Summarize conversation history and automatically extract and store facts
	 * @param {string} userId - User ID
	 * @param {Array<{role: string, content: string}>} conversationHistory - Conversation history
	 * @returns {Promise<void>}
	 */
	async summarizeAndStoreFacts(userId, conversationHistory) {
		if (conversationHistory.length < 4) return;

		this.logger.info(`🧠 Starting summarization for user ${userId}...`, {
			label: 'ai',
		});

		try {
			const tokenIdx = await getAndUseNextAvailableToken();
			if (tokenIdx === -1) {
				this.logger.info(
					`🧠 No AI tokens available for summarization. Skipping.`,
					{ label: 'ai' },
				);
				return;
			}

			const GEMINI_API_KEY = (this.config.addons.ai.geminiApiKeys || '').split(
				',',
			)[tokenIdx];
			const GEMINI_MODEL = this.config.addons.ai.model;
			const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

			const summarizationInstruction = `
You are a summarization assistant. Based on the following conversation history, extract 1-3 new, important, and non-trivial facts about the 'user'.
Focus on their preferences, goals, personality, or significant personal details they mentioned.
Do NOT extract facts about the model (Kythia).
Format your answer as a simple list separated by newlines. Each line is one fact.
Example:
- Likes spicy food, especially rendang.
- Is currently studying for a calculus exam next week.
- Has a pet cat named Miko.

If there are no new important facts to learn from this conversation, respond with the single keyword: "NO_NEW_FACTS".
			`;

			const response = await ai.models.generateContent({
				model: GEMINI_MODEL,
				contents: [
					{ role: 'model', parts: [{ text: summarizationInstruction }] },
					...conversationHistory.map((msg) => {
						let textContent =
							typeof msg.content === 'string' ? msg.content : '';
						if (textContent.length > 80000) {
							textContent = `${textContent.substring(0, 80000)}... [TRUNCATED]`;
						}
						return {
							role: msg.role,
							parts: [{ text: textContent }],
						};
					}),
				],
			});

			// Safely extract text
			let summaryText;
			if (response && typeof response.text === 'function') {
				summaryText = response.text();
			} else if (response && typeof response.text === 'string') {
				summaryText = response.text;
			}
			summaryText = typeof summaryText === 'string' ? summaryText.trim() : '';

			if (summaryText && summaryText !== 'NO_NEW_FACTS') {
				const newFacts = summaryText
					.split('\n')
					.map((fact) => fact.replace(/^- /, '').trim())
					.filter(Boolean);

				if (newFacts.length > 0) {
					this.logger.info(
						`🧠 Found ${newFacts.length} new facts for user ${userId}: ${newFacts.join(', ')}`,
						{ label: 'ai' },
					);
					for (const fact of newFacts) {
						await this.appendFact(userId, fact);
					}
				}
			} else {
				this.logger.info(
					`🧠 No new significant facts found for user ${userId}.`,
					{ label: 'ai' },
				);
			}
		} catch (error) {
			this.logger.error(
				`❌ Error during summarization for user ${userId}:`,
				error.message,
				{ label: 'ai' },
			);
		}
	}
}

module.exports = UserFactsManager;
