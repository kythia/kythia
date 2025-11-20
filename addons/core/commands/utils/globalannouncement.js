/**
 * @namespace: addons/core/commands/utils/globalannouncement.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const {
    SlashCommandBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    InteractionContextType,
} = require('discord.js');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('global-announcement')
        .setDescription('Send an announcement to all servers the bot has joined.')
        .addSubcommand((sub) => sub.setName('embed').setDescription('Send a simple announcement using an embed.'))
        .addSubcommand((sub) => sub.setName('container').setDescription('Send a complex announcement by pasting a JSON payload.'))
        .setContexts(InteractionContextType.BotDM),
    ownerOnly: true,
    async execute(interaction, container) {
        const { t, kythiaConfig, models, logger } = container;
        const { ServerSetting } = models;

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'embed') {
            const modal = new ModalBuilder()
                .setCustomId(`announcement-modal-embed_${interaction.user.id}`)
                .setTitle('📝 Create Embed Announcement');

            const titleInput = new TextInputBuilder()
                .setCustomId('announcement-title')
                .setLabel('Title')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);
            const contentInput = new TextInputBuilder()
                .setCustomId('announcement-content')
                .setLabel('Content (Markdown)')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(titleInput), new ActionRowBuilder().addComponents(contentInput));
            await interaction.showModal(modal);

            const modalSubmit = await interaction
                .awaitModalSubmit({
                    filter: (i) => i.customId.startsWith('announcement-modal-embed_'),
                    time: 300_000,
                })
                .catch(() => null);

            if (!modalSubmit) return logger.warn('Embed announcement modal timed out.');

            await modalSubmit.deferReply({ ephemeral: true });

            const title = modalSubmit.fields.getTextInputValue('announcement-title');
            const content = modalSubmit.fields.getTextInputValue('announcement-content');
            const payload = {
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`📢 ${title}`)
                        .setDescription(content)
                        .setColor('Blurple')
                        .setTimestamp()
                        .setFooter({ text: `Announcement from Developer ${interaction.client.user.username}` }),
                ],
            };
            await this.sendToAllGuilds(modalSubmit, payload);
        } else if (subcommand === 'container') {
            const modal = new ModalBuilder()
                .setCustomId(`announcement-modal-container_${interaction.user.id}`)
                .setTitle('📝 Create Container Announcement');

            const jsonInput = new TextInputBuilder()
                .setCustomId('announcement-json')
                .setLabel('Paste JSON Payload Here')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder('Copy the JSON from Discohook and paste it here...')
                .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(jsonInput));
            await interaction.showModal(modal);

            const modalSubmit = await interaction
                .awaitModalSubmit({
                    filter: (i) => i.customId.startsWith('announcement-modal-container_'),
                    time: 300_000,
                })
                .catch(() => null);

            if (!modalSubmit) return logger.warn('Container announcement modal timed out.');

            await modalSubmit.deferReply({ ephemeral: true });

            const jsonString = modalSubmit.fields.getTextInputValue('announcement-json');
            let payload;
            try {
                payload = JSON.parse(jsonString);
            } catch (err) {
                return modalSubmit.editReply({
                    content: `❌ Invalid JSON! Please make sure you copied everything correctly.\n\nError: \`${err.message}\``,
                    ephemeral: true,
                });
            }
            await this.sendToAllGuilds(modalSubmit, payload);
        }
    },

    /**
     * Handles the logic of sending a payload to all guilds.
     * @param {Interaction} interaction - The interaction to reply to.
     * @param {object} payload - The message payload to send.
     */
    async sendToAllGuilds(interaction, payload) {
        await interaction.editReply({ content: '⏳ Starting to send the announcement to all servers...', ephemeral: true });

        const guilds = interaction.client.guilds.cache;
        let successCount = 0;
        let failCount = 0;
        const failedServers = [];

        for (const guild of guilds.values()) {
            let targetChannel = null;
            try {
                const settings = await ServerSetting.getCache({ guildId: guild.id });
                if (settings && settings.announcementChannelId) {
                    targetChannel = await guild.channels.fetch(settings.announcementChannelId).catch(() => null);
                }
                if (!targetChannel) {
                    const channels = await guild.channels.fetch();
                    const possibleChannels = channels.filter(
                        (ch) =>
                            ch.type === 0 &&
                            ch.permissionsFor(guild.members.me).has(PermissionFlagsBits.SendMessages) &&
                            ch.permissionsFor(guild.members.me).has(PermissionFlagsBits.ViewChannel)
                    );
                    const channelNamesPriority = [
                        'kythia-updates',
                        'kythia',
                        'update',
                        'bot-updates',
                        'announcements',
                        'pengumuman',
                        'general',
                        'chat',
                    ];
                    for (const name of channelNamesPriority) {
                        targetChannel = possibleChannels.find((ch) => ch.name.includes(name));
                        if (targetChannel) break;
                    }
                }
                if (targetChannel) {
                    await targetChannel.send(payload);
                    successCount++;
                } else {
                    failCount++;
                    failedServers.push(`${guild.name}`);
                }
            } catch (err) {
                logger.warn(`Failed to send announcement to guild: ${guild.name}. Reason: ${err.message}`);
                failCount++;
                failedServers.push(`${guild.name}`);
            }
            await sleep(1000);
        }

        const reportEmbed = new EmbedBuilder()
            .setTitle('✅ Announcement Delivery Report')
            .setColor('Green')
            .addFields(
                { name: 'Successfully Sent', value: `${successCount} server(s)`, inline: true },
                { name: 'Failed to Send', value: `${failCount} server(s)`, inline: true }
            );
        if (failedServers.length > 0) {
            reportEmbed.addFields({ name: 'Failed Server List', value: `\`\`\`${failedServers.slice(0, 10).join('\n')}\`\`\`` });
        }
        await interaction.editReply({ content: 'Announcement delivery finished!', embeds: [reportEmbed], ephemeral: true });
    },
};
