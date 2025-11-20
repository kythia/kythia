/**
 * @namespace: addons/ai/events/messageCreate.js
 * @type: Event Handler
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { buildSystemInstruction } = require('../helpers/promptBuilder');
const { GoogleGenAI, createPartFromUri } = require('@google/genai');
const { ChannelType } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');
const { getAndUseNextAvailableToken } = require('../helpers/gemini');
const kythiaInteraction = require('../../core/helpers/events');

const conversationCache = new Map();

/**
 * Filter AI response for unwanted tags like @everyone/@here,
 * but if the user isOwner (see discord.js) and aiConfig.ownerBypassFilter is true,
 * always allow them.
 * @param {string} responseText
 * @param {string} [userId]
 * @param {Function} isOwner
 * @param {Object} aiConfig
 * @returns {object} { allowed: boolean, reason?: string }
 */
function filterAiResponse(responseText, userId, isOwner, aiConfig) {
    if (typeof userId !== 'undefined' && aiConfig?.ownerBypassFilter && typeof isOwner === 'function' && isOwner(userId)) {
        return { allowed: true };
    }
    if (/@everyone|@here/i.test(responseText)) {
        return {
            allowed: false,
            reason: 'ai_events_messageCreate_filter_everyone_here',
        };
    }
    return { allowed: true };
}

const factClassifiers = [
    { type: 'birthday', regex: /(lahir|birthday|ulang tahun|born|kelahiran|tanggal lahir|dob)/i },
    { type: 'name', regex: /(nama|name|panggil|nickname|alias|identitas|identity)/i },
    { type: 'hobby', regex: /(hobi|hobby|kesukaan|suka|interest|kegemaran|favorit)/i },
    { type: 'age', regex: /(umur|age|usia|tahun|years old)/i },
    { type: 'location', regex: /(alamat|tinggal|domisili|location|city|kota|asal|hometown|berasal dari)/i },
    { type: 'job', regex: /(pekerjaan|job|profesi|kerja|bekerja|occupation|work)/i },
    { type: 'education', regex: /(sekolah|school|kuliah|universitas|kampus|pendidikan|study|belajar)/i },
    { type: 'gender', regex: /(gender|jenis kelamin|kelamin|pria|wanita|laki-laki|perempuan)/i },
    { type: 'religion', regex: /(agama|religion|kepercayaan|faith)/i },
    { type: 'relationship', regex: /(status hubungan|relationship|menikah|married|single|jomblo|pacaran)/i },
    { type: 'email', regex: /(email|e-mail|surel)/i },
    { type: 'phone', regex: /(telepon|phone|no hp|nomor hp|wa|whatsapp)/i },
    {
        type: 'social',
        regex: /(media sosial|social media|sosmed|instagram|ig|facebook|fb|twitter|x\.com|tiktok|youtube|yt|linkedin|github)/i,
    },
    { type: 'language', regex: /(bahasa|language|bilingual|multilingual)/i },
    { type: 'physical', regex: /(tinggi|height|berat|weight)/i },
    { type: 'color', regex: /(warna kesukaan|warna favorit|favorite color)/i },
    { type: 'food', regex: /(makanan kesukaan|makanan favorit|favorite food|minuman kesukaan|favorite drink)/i },
    { type: 'animal', regex: /(hewan kesukaan|hewan favorit|favorite animal|binatang kesukaan)/i },
    { type: 'movie', regex: /(film kesukaan|film favorit|favorite movie)/i },
    { type: 'music', regex: /(musik kesukaan|musik favorit|favorite music|penyanyi favorit|band favorit)/i },
    { type: 'book', regex: /(buku kesukaan|buku favorit|favorite book|penulis favorit)/i },
    { type: 'game', regex: /(game kesukaan|game favorit|favorite game)/i },
];

/**
 * 🏷️ classifyFact
 * Mengklasifikasikan string fakta ke dalam tipe tertentu berdasarkan regex.
 * @param {string} fact
 * @returns {string} type
 */
function classifyFact(fact) {
    for (const classifier of factClassifiers) {
        if (classifier.regex.test(fact)) {
            return classifier.type;
        }
    }
    return 'other';
}

/**
 * 📝 appendUserFact
 * Menambahkan fakta baru ke profil user (langsung ke database).
 * @param {string} userId
 * @param {string} fact
 * @param {Model} UserFact
 * @param {Object} logger
 * @returns {'added' | 'duplicate' | 'error'}
 */
async function appendUserFact(userId, fact, UserFact, logger) {
    const type = classifyFact(fact);

    try {
        const [factInstance, created] = await UserFact.findOrCreateWithCache({
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
        logger.error('Error in appendUserFact:', error);
        return 'error';
    }
}

const typeLabels = {
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
 * 📋 getUserFactsString
 * Menghasilkan string terstruktur dari fakta-fakta user untuk prompt AI.
 * @param {string} userId
 * @param {Model} UserFact
 * @returns {string}
 */
async function getUserFactsString(userId, UserFact) {
    const userFacts = await UserFact.getAllCache({
        where: { userId: userId },
        order: [['createdAt', 'DESC']],
        limit: 50,
        cacheTags: [`UserFact:byUser:${userId}`],
    });

    if (!userFacts || userFacts.length === 0) return '';

    const grouped = {};
    for (const f of userFacts) {
        const label = typeLabels[f.type] || 'Lainnya';
        if (!grouped[label]) grouped[label] = [];
        grouped[label].push(f.fact);
    }

    let result = '';
    for (const label in grouped) {
        result += `- ${label}: ${grouped[label].join('; ')}\n`;
    }
    return result.trim();
}

let tempDir;
(async () => {
    tempDir = path.join(__dirname, '..', 'temp');
    try {
        await fs.mkdir(tempDir, { recursive: true });
    } catch (e) {}
})();

/**
 * 🧠 Merangkum riwayat obrolan untuk mengekstrak & menyimpan fakta penting secara otomatis.
 * @param {string} userId
 * @param {Array<object>} conversationHistory
 * @param {Object} logger
 * @param {Model} UserFact
 * @param {Object} config
 */
async function summarizeAndStoreFacts(userId, conversationHistory, logger, UserFact, config) {
    if (conversationHistory.length < 4) return;

    logger.info(`🧠 Starting summarization for user ${userId}...`);

    try {
        const tokenIdx = await getAndUseNextAvailableToken();
        if (tokenIdx === -1) {
            logger.info(`🧠 No AI tokens available for summarization. Skipping.`);
            return;
        }

        const GEMINI_API_KEY = config.addons.ai.geminiApiKeys.split(',')[tokenIdx];
        const GEMINI_MODEL = config.addons.ai.model;
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
                ...conversationHistory.map((msg) => ({
                    role: msg.role,
                    parts: [{ text: msg.content }],
                })),
            ],
        });

        // safely extract text & handle undefined
        let summaryText = undefined;
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
                logger.info(`🧠 Found ${newFacts.length} new facts for user ${userId}:`, newFacts);
                for (const fact of newFacts) {
                    await appendUserFact(userId, fact, UserFact, logger);
                }
            }
        } else {
            logger.info(`🧠 No new significant facts found for user ${userId}.`);
        }
    } catch (error) {
        logger.error(`❌ Error during summarization for user ${userId}:`, error.message);
    }
}

const CONVERSATION_CACHE_TIMEOUT = 30 * 60 * 1000;
setInterval(
    () => {
        const now = Date.now();
        for (const [userId, conv] of conversationCache.entries()) {
            if (now - conv.lastActive > CONVERSATION_CACHE_TIMEOUT) {
                const historyToSummarize = [...conv.history];
                conversationCache.delete(userId);

                console.warn(`[AI Summarizer Interval] Need to summarize for ${userId}, but cannot access dependencies here.`);
            }
        }
    },
    5 * 60 * 1000
);

/**
 * 👤 Get user's bio from Discord profile.
 * @param {string} userId
 * @returns {Promise<string>}
 */
async function getUserBio(userId, client) {
    try {
        const user = await client.users.fetch(userId, { force: true });
        return user.bio || 'Not set';
    } catch {
        return 'Cannot get bio';
    }
}

function addToHistory(conversation, role, content) {
    const lastMessage = conversation.history[conversation.history.length - 1];

    if (lastMessage && lastMessage.role === role && role === 'user') {
        lastMessage.content += '\n' + content;
    } else {
        conversation.history.push({ role, content });
    }

    if (conversation.history.length > 12) {
        conversation.history.splice(0, 2);
    }
}
/**
 * Send AI response, with ability to split message if there is [SPLIT].
 * @param {import('discord.js').Message} message
 * @param {string} text
 * @param {Function} t
 * @param {Function} isOwner
 * @param {Object} aiConfig
 */
async function sendSplitMessage(message, text, t, isOwner, aiConfig) {
    const CHUNK_SIZE = 2000;
    // Ensure text is a string to prevent .split on undefined/null
    text = typeof text === 'string' ? text : '';
    const parts = text.split('[SPLIT]');

    let hasReplied = false;

    for (const part of parts) {
        let chunk = part.trim();
        if (chunk.length === 0) continue;

        const filterResult = filterAiResponse(chunk, message.author?.id, isOwner, aiConfig);
        if (!filterResult.allowed) {
            await message.reply(await t(message, 'ai.events.messageCreate.filter.blocked'));
            return;
        }

        if (chunk.length > CHUNK_SIZE) {
            const subChunks = chunk.match(new RegExp(`.{1,${CHUNK_SIZE}}`, 'gs')) || [];
            for (const subChunk of subChunks) {
                const filterResultSub = filterAiResponse(subChunk, message.author?.id, isOwner, aiConfig);
                if (!filterResultSub.allowed) {
                    await message.reply(await t(message, 'ai.events.messageCreate.filter.blocked'));
                    return;
                }
                if (!hasReplied) {
                    await message.reply({ content: subChunk });
                    hasReplied = true;
                } else {
                    await message.channel.send(subChunk);
                }
            }
        } else {
            if (!hasReplied) {
                await message.reply({ content: chunk });
                hasReplied = true;
            } else {
                await message.channel.send(chunk);
            }
        }
    }
}

/**
 * 🚦 Determine AI pathway with priority: Command (if clear) > Search (default).
 * @param {string} content
 * @param {Object} aiConfig
 * @param {Object} logger
 * @returns {'function_calling' | 'google_search'}
 */
function determineAiPathway(content, aiConfig, logger) {
    const clean = content.toLowerCase();

    const additionalCommandKeywords = aiConfig?.additionalCommandKeywords || [];
    const safeCommands = aiConfig?.safeCommands || [];

    const commandKeywords = Array.isArray(safeCommands) ? [...safeCommands, ...additionalCommandKeywords] : additionalCommandKeywords;

    const commandRegex = new RegExp(`\\b(${commandKeywords.join('|')})\\b`, 'i');

    if (commandRegex.test(clean)) {
        logger.info('🧠 Intent detected as Command. Using Function Calling pathway.');
        return 'function_calling';
    }

    logger.info('🧠 Intent not specific. Using Google Search pathway (Default).');
    return 'google_search';
}

/**
 * 🤖 module.exports (AI Message Handler)
 */
module.exports = async (bot, message) => {
    const container = bot.container;
    const logger = container.logger;
    const t = container.t;
    const ServerSetting = container.sequelize.models.ServerSetting;
    const isOwner = container.helpers.discord.isOwner;
    const UserFact = container.sequelize.models.UserFact;
    const config = container.kythiaConfig;
    const aiConfig = config.addons.ai;
    const GEMINI_MODEL = aiConfig.model;
    const CONTEXT_MESSAGES_TO_FETCH = aiConfig.getMessageHistoryLength;

    const client = bot.client;
    if (message.author?.bot) return;

    const content = typeof message.content === 'string' ? message.content.trim() : '';
    if (Array.isArray(config?.bot?.prefixes) && config.bot.prefixes.some((prefix) => prefix && content.startsWith(prefix))) return;

    const isDm = message.channel.type === ChannelType.DM || message.channel.type == 1;
    const isMentioned =
        message.mentions.users.has(client.user.id) &&
        !message.mentions.everyone &&
        (!message.mentions.roles || message.mentions.roles.size === 0);
    let isAiChannel = false;

    if (message.guild) {
        try {
            const serverSetting = await ServerSetting.getCache({ guildId: message.guild.id });
            if (serverSetting?.aiChannelIds?.includes(message.channel.id)) {
                isAiChannel = true;
            }
        } catch (e) {
            logger.error('Error getting ServerSetting:', e);
        }
    }

    let typingInterval;

    if (isAiChannel || isDm || isMentioned) {
        const totalTokens = (aiConfig.geminiApiKeys || '')
            .split(',')
            .map((k) => k.trim())
            .filter(Boolean).length;
        let success = false;
        let finalResponse = null;

        try {
            await message.channel.sendTyping();
            typingInterval = setInterval(() => {
                message.channel.sendTyping().catch((err) => {
                    logger.warn('❌ Error sending typing indicator:', err.message);
                    clearInterval(typingInterval);
                });
            }, 8000);

            const userDisplayName = message.member?.displayName || message.author.username;
            const userTag = message.author.tag || `${message.author.username}#${message.author.discriminator}`;
            const userFactsString = await getUserFactsString(message.author.id, UserFact);
            const userBio = await getUserBio(message.author.id, client);
            const guildName = message.guild?.name || 'Direct Message';
            const channelName = message.channel.name || 'Direct Message';

            const context = {
                userId: message.author.id,
                userDisplayName,
                userFactsString,
                userTag,
                userBio,
                guildName,
                channelName,
            };
            const systemInstruction = buildSystemInstruction(context);

            let mediaParts = [];
            if (message.attachments && message.attachments.size > 0) {
                for (const attachment of message.attachments.values()) {
                    if (attachment.contentType && attachment.contentType.startsWith('image/')) {
                        try {
                            logger.info(`🖼️ Image detected: ${attachment.name}...`);
                            const res = await fetch(attachment.url);
                            const arrayBuffer = await res.arrayBuffer();
                            const buffer = Buffer.from(arrayBuffer);
                            const base64Image = buffer.toString('base64');
                            mediaParts.push({
                                inlineData: {
                                    mimeType: attachment.contentType,
                                    data: base64Image,
                                },
                            });
                        } catch (err) {
                            logger.error('❌ Error processing image:', err);
                        }
                    } else if (attachment.contentType?.startsWith('video/') || attachment.contentType?.startsWith('audio/')) {
                        try {
                            logger.info(`🎛️ ${attachment.contentType} detected: ${attachment.name}...`);
                            const fetchRes = await fetch(attachment.url);
                            const buffer = Buffer.from(await fetchRes.arrayBuffer());
                            const tmp = require('tmp');
                            const { promises: fsp } = require('fs');

                            const tmpobj = tmp.fileSync({
                                postfix: path.extname(attachment.name || '.mp4'),
                                dir: tempDir,
                            });
                            await fsp.writeFile(tmpobj.name, buffer);

                            let uploadedFile;
                            logger.info(`📤 Uploading ${attachment.contentType}: ${attachment.name}...`);
                            try {
                                uploadedFile = await new GoogleGenAI({
                                    apiKey: aiConfig.geminiApiKeys.split(',')[0],
                                }).files.upload({
                                    file: tmpobj.name,
                                    config: { mimeType: attachment.contentType },
                                });
                            } catch (uploadErr) {
                                if (uploadErr?.details?.includes?.('not in an ACTIVE state')) {
                                    logger.warn('File not active, retrying upload...');
                                    await new Promise((res) => setTimeout(res, 2000));
                                    uploadedFile = await new GoogleGenAI({
                                        apiKey: aiConfig.geminiApiKeys.split(',')[0],
                                    }).files.upload({ file: tmpobj.name, config: { mimeType: attachment.contentType } });
                                } else {
                                    throw uploadErr;
                                }
                            }

                            logger.info(`⏳ Waiting for file ${uploadedFile.name} to become active...`);
                            let safetyNet = 0;
                            while (uploadedFile.state === 'PROCESSING' && safetyNet < 15) {
                                await new Promise((resolve) => setTimeout(resolve, 2000));
                                uploadedFile = await new GoogleGenAI({
                                    apiKey: aiConfig.geminiApiKeys.split(',')[0],
                                }).files.get({ name: uploadedFile.name });
                                logger.info(`  - Current state: ${uploadedFile.state}`);
                                safetyNet++;
                            }

                            if (uploadedFile.state !== 'ACTIVE') {
                                throw new Error(`File did not become active. Final state: ${uploadedFile.state}`);
                            }

                            logger.info(`✅ File ${uploadedFile.name} is now ACTIVE!`);

                            mediaParts.push(createPartFromUri(uploadedFile.uri, uploadedFile.mimeType));
                            tmpobj.removeCallback();
                        } catch (err) {
                            logger.error('❌ Error processing video/audio:', err);
                            await message.channel.send(await t(message, 'ai.events.messageCreate.error')).catch(() => {});
                            continue;
                        }
                    } else if (attachment.contentType?.startsWith('application/pdf')) {
                        try {
                            logger.info(`📄 Document detected: ${attachment.name} (${attachment.contentType})...`);
                            const res = await fetch(attachment.url);
                            const arrayBuffer = await res.arrayBuffer();
                            const buffer = Buffer.from(arrayBuffer);
                            const base64File = buffer.toString('base64');
                            mediaParts.push({
                                inlineData: {
                                    mimeType: attachment.contentType,
                                    data: base64File,
                                },
                            });
                        } catch (err) {
                            logger.error(`❌ Error processing document ${attachment.name}:`, err);
                            await message.channel.send(await t(message, 'ai.events.messageCreate.error')).catch(() => {});
                            continue;
                        }
                    }
                }
            }

            const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/g;
            const matches = typeof message.content === 'string' ? message.content.matchAll(youtubeRegex) : [];
            for (const match of matches) {
                const videoId = match[1];
                if (videoId) {
                    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
                    logger.info(`▶️ YouTube URL detected and processed: ${youtubeUrl}`);
                    mediaParts.push({
                        fileData: {
                            fileUri: youtubeUrl,
                        },
                    });
                    break;
                }
            }

            const cleanContent =
                typeof message.content === 'string'
                    ? message.content
                          .replace(/<@!?\d+>/g, '')
                          .trim()
                          .slice(0, 1500)
                    : '';
            if (!cleanContent && mediaParts.length === 0) {
                if (typingInterval) clearInterval(typingInterval);
                return;
            }

            const memoryKeywords = [
                'ingat(?: ya)?',
                'catat',
                'simpan',
                'tambahkan',
                'tulis',
                'remember',
                'note',
                'save',
                'store',
                'add',
                'keep',
            ].join('|');
            const memoryRegex = new RegExp(`^(?:<@!?\\d+>|kythia)?[\\s,.]*?(?:tolong\\s+)?(?:${memoryKeywords})[\\s,.:]+(.+)$`, 'i');
            const memoryMatch = cleanContent.match(memoryRegex);

            if (memoryMatch && memoryMatch[1]) {
                let fact = memoryMatch[1].trim();
                fact = fact.replace(/^(<@!?\d+>|kythia)[\s,.:]*/i, '').trim();
                if (fact.length > 0) {
                    const status = await appendUserFact(message.author.id, fact, UserFact, logger);
                    if (status === 'added') {
                        await message.reply(await t(message, 'ai.events.messageCreate.memory.added'));
                    } else if (status === 'duplicate') {
                        await message.reply(await t(message, 'ai.events.messageCreate.memory.duplicate'));
                    }
                } else {
                    await message.reply(await t(message, 'ai.events.messageCreate.memory.empty'));
                }
                if (typingInterval) clearInterval(typingInterval);
                return;
            }

            let userConv = conversationCache.get(message.author.id);
            if (!userConv) {
                logger.info(`🧠 Cache miss for ${message.author.tag}. Reconstructing history...`);
                const lastMessages = await message.channel.messages.fetch({ limit: CONTEXT_MESSAGES_TO_FETCH });

                const relevantMessages = Array.from(lastMessages.values())
                    .filter(
                        (msg) =>
                            msg.author.id === message.author.id ||
                            (msg.author.id === client.user.id &&
                                msg.reference &&
                                lastMessages.has(msg.reference.messageId) &&
                                lastMessages.get(msg.reference.messageId).author.id === message.author.id) ||
                            (msg.author.id === client.user.id && !msg.reference)
                    )
                    .reverse();

                const initialHistory = [];
                for (const msg of relevantMessages) {
                    const c = typeof msg.content === 'string' ? msg.content.replace(/<@!?\d+>/g, '').trim() : '';
                    if (!c && msg.attachments.size === 0) continue;
                    const role = msg.author.id === client.user.id ? 'model' : 'user';
                    initialHistory.push({ role, content: c });
                }

                userConv = { history: initialHistory, lastActive: Date.now() };
                conversationCache.set(message.author.id, userConv);
            }
            userConv.lastActive = Date.now();
            addToHistory(userConv, 'user', cleanContent);

            let contents = userConv.history.map((msg) => ({
                role: msg.role === 'model' ? 'model' : 'user',
                parts: [{ text: typeof msg.content === 'string' ? msg.content : '' }],
            }));

            if (mediaParts.length > 0) {
                let lastUserIdx = -1;
                for (let i = contents.length - 1; i >= 0; i--) {
                    if (contents[i].role === 'user') {
                        lastUserIdx = i;
                        break;
                    }
                }
                if (lastUserIdx !== -1) {
                    contents[lastUserIdx].parts = [...mediaParts, { text: cleanContent || 'Describe this image/video.' }];
                } else {
                    contents.push({
                        role: 'user',
                        parts: [...mediaParts, { text: cleanContent || 'Describe this image/video.' }],
                    });
                }
            }

            const pathway = determineAiPathway(cleanContent, aiConfig, logger);

            const toolsConfig = [];

            if (pathway === 'google_search') {
                logger.info('🧠 Using Google Search pathway.');
                toolsConfig.push({ googleSearch: {} });
            } else {
                logger.info('🧠 Using Function Calling pathway (Default).');
                if (bot.aiCommandSchema && bot.aiCommandSchema.length > 0) {
                    toolsConfig.push({
                        functionDeclarations: bot.aiCommandSchema,
                    });
                }
            }

            for (let attempt = 0; attempt < totalTokens; attempt++) {
                logger.info(`🧠 AI attempt ${attempt + 1}/${totalTokens}...`);

                const tokenIdx = await getAndUseNextAvailableToken();
                if (tokenIdx === -1) {
                    logger.warn('⚠️ All tokens are locally rate-limited. Stopping retries.');
                    break;
                }

                const GEMINI_API_KEY = aiConfig.geminiApiKeys.split(',')[tokenIdx];
                if (!GEMINI_API_KEY) {
                    logger.warn(`Token index ${tokenIdx} is invalid. Skipping.`);
                    continue;
                }

                const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

                try {
                    const response = await genAI.models.generateContent({
                        model: GEMINI_MODEL,
                        contents: contents,
                        config: {
                            systemInstruction: {
                                parts: [{ text: systemInstruction }],
                            },
                            tools: toolsConfig,
                        },
                    });

                    finalResponse = response;
                    success = true;
                    logger.info(`✅ AI request successful on attempt ${attempt + 1}`);
                    break;
                } catch (err) {
                    if (err.message && (err.message.includes('429') || err.toString().includes('RESOURCE_EXHAUSTED'))) {
                        logger.warn(`Token index ${tokenIdx} hit 429 limit. Retrying with next token...`);
                    } else {
                        logger.error('❌ AI Message Error (non-429):', err);
                        await message.channel.send(await t(message, 'ai.events.messageCreate.error')).catch(() => {});
                        if (typingInterval) clearInterval(typingInterval);
                        return;
                    }
                }
            }

            if (typingInterval) clearInterval(typingInterval);

            if (success && finalResponse) {
                // Defensive extract of .text (could be function, string, or undefined/null)
                let replyText = '';
                if (finalResponse && typeof finalResponse.text === 'function') {
                    replyText = finalResponse.text();
                } else if (finalResponse && typeof finalResponse.text === 'string') {
                    replyText = finalResponse.text;
                }
                replyText = typeof replyText === 'string' ? replyText.trim() : '';

                if (finalResponse.functionCalls && finalResponse.functionCalls.length > 0) {
                    const call = finalResponse.functionCalls[0];
                    const fullFunctionName = call.name;
                    const argsFromAi = call.args;

                    const nameParts = fullFunctionName.split('_');
                    const baseCommandName = nameParts[0];

                    const command = client.commands.get(baseCommandName);

                    if (!command) {
                        await message.reply(await t(message, 'ai.events.messageCreate.command.not.found'));
                        return;
                    }

                    logger.info(
                        `🧠 Executing command '/${baseCommandName}' (interpreted from '${fullFunctionName}') with args:`,
                        argsFromAi
                    );

                    const fakeInteraction = kythiaInteraction(message, fullFunctionName, argsFromAi);

                    try {
                        const executionResult = await command.execute(fakeInteraction, client.container);

                        const genAI = new GoogleGenAI({
                            apiKey: aiConfig.geminiApiKeys.split(',')[0],
                        });
                        const followUpResponse = await genAI.models.generateContent({
                            model: GEMINI_MODEL,
                            contents: [
                                ...contents,
                                { role: 'model', parts: [{ functionCall: call }] },
                                {
                                    role: 'function',
                                    parts: [
                                        {
                                            functionResponse: {
                                                name: fullFunctionName,
                                                response: {
                                                    content: JSON.stringify({
                                                        success: true,
                                                        result: executionResult,
                                                    }),
                                                },
                                            },
                                        },
                                    ],
                                },
                            ],
                        });

                        let finalReply = undefined;
                        if (followUpResponse && typeof followUpResponse.text === 'function') {
                            finalReply = followUpResponse.text();
                        } else if (followUpResponse && typeof followUpResponse.text === 'string') {
                            finalReply = followUpResponse.text;
                        }
                        finalReply = typeof finalReply === 'string' ? finalReply.trim() : '';

                        const filterResult = filterAiResponse(finalReply, message.author?.id, isOwner, aiConfig);
                        if (!filterResult.allowed) {
                            await message.reply(await t(message, 'ai.events.messageCreate.filter.blocked'));
                            return;
                        }
                        await sendSplitMessage(message, finalReply, t, isOwner, aiConfig);
                        addToHistory(userConv, 'model', finalReply);
                    } catch (err) {
                        logger.error(`🧠 Error running '${fullFunctionName}':`, err);
                        await message.channel.send(await t(message, 'ai.events.messageCreate.command.error'));
                    }
                    return;
                } else {
                    // Normal reply
                    const filterResult = filterAiResponse(replyText, message.author?.id, isOwner, aiConfig);
                    if (!filterResult.allowed) {
                        await message.reply(await t(message, 'ai.events.messageCreate.filter.blocked'));
                        return;
                    }
                    await sendSplitMessage(message, replyText, t, isOwner, aiConfig);
                    addToHistory(userConv, 'model', replyText);
                }
            } else {
                logger.error('❌ All AI tokens failed (likely 429). Informing user.');
                await message.reply(await t(message, 'ai.events.messageCreate.memory.token.limit')).catch(() => {});
            }
        } catch (err) {
            logger.error('❌ AI Pre-flight Error:', err);
            await message.channel.send(await t(message, 'ai.events.messageCreate.error')).catch(() => {});
            if (typingInterval) clearInterval(typingInterval);
        }
    }
};
