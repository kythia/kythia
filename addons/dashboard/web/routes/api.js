/**
 * @namespace: addons/dashboard/web/routes/api.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc1
 */

const router = require('express').Router();
const { ChannelType, MessageFlags } = require('discord.js');
const client = require('@src/KythiaClient');
const parseDiscordMarkdown = require('../helpers/parser');
const KythiaVoter = require('@coreModels/KythiaVoter');
const convertColor = require('@src/utils/color');
const logger = require('@src/utils/logger');

router.get('/api/guilds/:guildId/channels', async (req, res) => {
    try {
        const guild = await client.guilds.fetch(req.params.guildId);
        const allChannels = guild.channels.cache;
        const categories = allChannels
            .filter((c) => c.type === ChannelType.GuildCategory)
            .sort((a, b) => a.position - b.position)
            .map((c) => ({ id: c.id, name: c.name.toUpperCase(), channels: [] }));
        const channelsWithoutCategory = [];
        allChannels
            .filter((c) => c.type === ChannelType.GuildText && c.permissionsFor(client.user).has('ViewChannel'))
            .sort((a, b) => a.position - b.position)
            .forEach((channel) => {
                const parentCategory = categories.find((cat) => cat.id === channel.parentId);
                if (parentCategory) {
                    parentCategory.channels.push({ id: channel.id, name: channel.name });
                } else {
                    channelsWithoutCategory.push({ id: channel.id, name: channel.name });
                }
            });
        const result = categories.filter((c) => c.channels.length > 0);
        if (channelsWithoutCategory.length > 0) {
            result.push({ id: null, name: 'TANPA KATEGORI', channels: channelsWithoutCategory });
        }
        res.json(result);
    } catch (error) {
        console.error('Error fetching grouped channels:', error);
        res.status(500).json({ message: 'Gagal mengambil kanal' });
    }
});

router.get('/api/channels/:channelId/messages', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const channel = await client.channels.fetch(req.params.channelId);
        if (!channel.permissionsFor(client.user).has('ReadMessageHistory')) {
            return res.status(403).json({ message: "Bot tidak punya izin 'Read Message History'." });
        }
        const messages = await channel.messages.fetch({ limit: limit });
        const formattedMessages = messages.map((msg) => {
            const embeds = msg.embeds.map((embed) => ({
                author: embed.author ? { name: embed.author.name, iconURL: embed.author.iconURL } : null,
                title: embed.title ? parseDiscordMarkdown(embed.title, msg.guild) : null,
                description: embed.description ? parseDiscordMarkdown(embed.description, msg.guild) : null,
                color: embed.hexColor,
                fields: embed.fields.map((field) => ({
                    name: parseDiscordMarkdown(field.name, msg.guild),
                    value: parseDiscordMarkdown(field.value, msg.guild),
                    inline: field.inline,
                })),
                thumbnail: embed.thumbnail ? embed.thumbnail.url : null,
                image: embed.image ? embed.image.url : null,
                footer: embed.footer ? { text: parseDiscordMarkdown(embed.footer.text, msg.guild), iconURL: embed.footer.iconURL } : null,
            }));
            return {
                id: msg.id,
                content: parseDiscordMarkdown(msg.content, msg.guild),
                author: {
                    username: msg.author.username,
                    avatar: msg.author.displayAvatarURL({ dynamic: true }),
                },
                timestamp: msg.createdAt.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
                attachments: msg.attachments.map((att) => att.url),
                embeds: embeds,
            };
        });
        res.json(formattedMessages.reverse());
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Gagal mengambil pesan.' });
    }
});

router.post('/api/channels/:channelId/messages', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ message: 'Isi pesan tidak boleh kosong.' });
        }
        const channel = await client.channels.fetch(req.params.channelId);
        if (!channel.permissionsFor(client.user).has('SendMessages')) {
            return res.status(403).json({ message: "Bot tidak punya izin 'Send Messages' di kanal ini." });
        }
        await channel.send(message);
        res.status(201).json({ success: true, message: 'Pesan terkirim!' });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Gagal mengirim pesan.' });
    }
});

router.post('/api/topgg-webhook', async (req, res) => {
    const client = req.app.get('botClient');
    const { topgg, webhookVoteLogs } = kythia.api;

    if (req.header('Authorization') !== topgg.authToken) {
        logger.warn('[Webhook] Unauthorized Top.gg request received.');
        return res.status(401).send('Unauthorized');
    }

    try {
        const userId = req.body.user;
        if (!userId) {
            logger.warn('[Webhook] Authorized request received but missing user ID.');
            return res.status(400).send('Bad Request: Missing user ID');
        }

        // Simpan atau Update data ke Database
        const kythiaVoter = await KythiaVoter.getCache({ userId: userId });
        if (kythiaVoter) {
            await kythiaVoter.update({ votedAt: new Date() });
        } else {
            await KythiaVoter.create({
                userId: userId,
                votedAt: new Date(),
            });
        }

        if (webhookVoteLogs && client) {
            try {
                const user = await client.users.fetch(userId);

                // 1. Siapkan URL dengan query parameter
                const webhookUrl = new URL(webhookVoteLogs);
                webhookUrl.searchParams.append('wait', 'true');
                webhookUrl.searchParams.append('with_components', 'true');

                // 2. Siapkan payload JSON manual DENGAN STRUKTUR YANG BENAR
                const payload = {
                    flags: MessageFlags.IsComponentsV2,
                    components: [
                        {
                            type: 17,
                            accent_color: convertColor(kythia.bot.color, { from: 'hex', to: 'decimal' }),
                            components: [
                                {
                                    type: 9,
                                    components: [
                                        {
                                            type: 10,
                                            content: `## 🩷 New Vote!\n<@${userId}> (${user.username})\njust voted for ${kythia.bot.name} on Top.gg! Thank you for your support!`,
                                        },
                                    ],
                                    accessory: {
                                        type: 11,
                                        media: {
                                            url: client.user.displayAvatarURL(),
                                        },
                                        description: `kythia's logo`,
                                    },
                                },
                                {
                                    type: 14,
                                    spacing: 1,
                                },
                                {
                                    type: 1,
                                    components: [
                                        {
                                            type: 2,
                                            style: 5,
                                            label: `Vote ${kythia.bot.name}`,
                                            url: `https://top.gg/bot/${kythia.bot.clientId}/vote`,
                                        },
                                    ],
                                },
                                {
                                    type: 14,
                                    spacing: 1,
                                },
                                {
                                    type: 10,
                                    content: `-# © ${kythia.bot.name} by ${kythia.owner.names}`,
                                },
                            ],
                        },
                    ],
                };

                // 3. Kirim menggunakan fetch
                const response = await fetch(webhookUrl.href, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    const errorBody = await response.text();
                    logger.warn(`[Webhook] Failed to send log message via fetch. Status: ${response.status}. Body: ${errorBody}`);
                }
            } catch (logError) {
                logger.warn(`[Webhook] Vote saved, but failed to log the vote. Error: ${logError.message}`);
            }
        }
        res.status(200).send('OK');
    } catch (error) {
        logger.error('[Webhook] Error processing vote:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
