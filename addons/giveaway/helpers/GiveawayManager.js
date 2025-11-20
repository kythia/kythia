/**
 * @namespace: addons/giveaway/helpers/GiveawayManager.js
 * @type: Service/Manager
 * @copyright © 2025 kenndeclouv
 * @version 0.9.17-beta (UI CONSISTENCY & DM)
 */

const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags,
} = require('discord.js');

class GiveawayManager {
    constructor(container) {
        const { client, logger, t, kythiaConfig, helpers } = container;

        this.container = container;
        this.client = client;
        this.logger = logger;
        this.t = t;
        this.config = kythiaConfig;

        this.convertColor = helpers.color.convertColor;
        this.parseDuration = helpers.time.parseDuration;
        this.simpleContainer = helpers.discord.simpleContainer;

        this.CHECK_INTERVAL = (this.config.addons.giveaway.checkInterval || 20) * 1000;
    }

    get Giveaway() {
        return this.container.models.Giveaway;
    }

    async init() {
        this.logger.info('🎁 Syncing Scheduler...');
        const active = await this.Giveaway.findAll({ where: { ended: false } });

        for (const g of active) {
            const endSec = Math.floor(new Date(g.endTime).getTime() / 1000);
            await this.Giveaway.scheduleAdd('active_schedule', endSec, g.messageId);
        }

        this.startScheduler();
    }

    async startScheduler() {
        try {
            await this.checkExpiredGiveaways();
        } catch (e) {
            this.logger.error('🎁 Giveaway Scheduler Error:', e);
        } finally {
            setTimeout(() => this.startScheduler(), this.CHECK_INTERVAL);
        }
    }

    async checkExpiredGiveaways() {
        const nowSec = Math.floor(Date.now() / 1000);
        const expiredIds = await this.Giveaway.scheduleGetExpired('active_schedule', nowSec);

        if (expiredIds && expiredIds.length > 0) {
            this.logger.info(`🎁 Found ${expiredIds.length} expired giveaways in Redis.`);

            for (const mid of expiredIds) {
                await this.Giveaway.scheduleRemove('active_schedule', mid);
                const giveaway = await this.Giveaway.findOne({ where: { messageId: mid } });

                if (giveaway && !giveaway.ended) {
                    await this.endGiveaway(giveaway);
                }
            }
        }
    }

    async createGiveaway(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const { options, user, guild, channel } = interaction;

        const durationInput = options.getString('duration');
        const winnersCount = options.getInteger('winners');
        const prize = options.getString('prize');
        const color = options.getString('color') || this.config.bot.color;
        const role = options.getRole('role');
        const description = options.getString('description');

        const durationMs = this.parseDuration(durationInput);
        if (!durationMs || durationMs <= 0 || isNaN(durationMs)) {
            const desc = await this.t(interaction, 'giveaway.giveaway.invalid.duration.desc');

            const errContainer = await this.simpleContainer(interaction, desc, {
                color: 'Red',
                title: await this.t(interaction, 'giveaway.giveaway.invalid.duration.title'),
            });
            return interaction.editReply({
                components: errContainer,
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
            });
        }

        const endTime = Date.now() + durationMs;
        const endTimestamp = Math.floor(endTime / 1000);

        const uiComponents = await this.buildGiveawayUI(interaction, {
            prize,
            endTime: endTimestamp,
            hostId: user.id,
            winnersCount,
            participantsCount: 0,
            ended: false,
            color,
            roleId: role?.id,
            description: description,
        });

        try {
            const message = await channel.send({
                components: uiComponents,
                flags: MessageFlags.IsPersistent | MessageFlags.IsComponentsV2,
            });

            await message.edit({ components: uiComponents });

            await this.Giveaway.create({
                messageId: message.id,
                channelId: channel.id,
                guildId: guild.id,
                hostId: user.id,
                duration: durationMs,
                endTime: new Date(endTime),
                winners: winnersCount,
                prize: prize,
                participants: [],
                ended: false,
                roleId: role?.id || null,
                color: color,
                description: description,
            });

            await this.Giveaway.scheduleAdd('active_schedule', endTimestamp, message.id);

            const desc = await this.t(interaction, 'giveaway.giveaway.start.success.desc');

            const successContainer = await this.simpleContainer(interaction, desc, {
                color: 'Green',
                title: await this.t(interaction, 'giveaway.giveaway.start.success.title'),
            });
            await interaction.editReply({ components: successContainer, flags: MessageFlags.IsComponentsV2 });
        } catch (error) {
            this.logger.error('Failed to start giveaway:', error);
            const errTitle = await this.t(interaction, 'giveaway.error.fatal.title').catch(() => 'Fatal Error');
            const errContainer = await this.simpleContainer(interaction, error.message, { color: 'Red', title: errTitle });
            await interaction.editReply({
                components: errContainer,
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
            });
        }
    }

    async endGiveaway(giveawayData, interaction = null) {
        let giveaway = giveawayData;

        if (typeof giveawayData === 'string' || (interaction && !giveaway.prize)) {
            const messageId = interaction?.options.getString('giveaway') || giveawayData;
            giveaway = await this.Giveaway.findOne({ where: { messageId } });
        }

        if (!giveaway || giveaway.ended) {
            if (interaction) {
                const desc = await this.t(interaction, 'giveaway.giveaway.not.found.desc');

                const err = await this.simpleContainer(interaction, desc, { color: 'Red', title: 'Error' });
                await interaction.reply({
                    components: err,
                    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
                });
            }
            return;
        }

        let participants = [];
        try {
            if (typeof giveaway.participants === 'string') {
                participants = JSON.parse(giveaway.participants);
            } else if (Array.isArray(giveaway.participants)) {
                participants = giveaway.participants;
            }
        } catch (e) {
            participants = [];
        }

        const winners = [];
        if (participants.length > 0) {
            const pool = [...participants];
            for (let i = 0; i < giveaway.winners; i++) {
                if (pool.length === 0) break;
                const index = Math.floor(Math.random() * pool.length);
                winners.push(pool[index]);
                pool.splice(index, 1);
            }
        }

        giveaway.ended = true;
        await giveaway.save();

        const channel = await this.client.channels.fetch(giveaway.channelId).catch(() => null);
        if (channel) {
            const noWinnerMsg = await this.t(channel, 'giveaway.no.valid.winner');
            const winnerMentions = winners.length > 0 ? winners.map((id) => `<@${id}>`).join(', ') : noWinnerMsg;

            const announceContainer = new ContainerBuilder()
                .setAccentColor(this.convertColor('Gold', { from: 'discord', to: 'decimal' }))
                .addTextDisplayComponents(new TextDisplayBuilder().setContent(await this.t(channel, 'giveaway.end.announce.title')))
                .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        await this.t(channel, 'giveaway.end.announce.desc', {
                            winners: winnerMentions,
                            prize: giveaway.prize,
                            host: `<@${giveaway.hostId}>`,
                        })
                    )
                );

            await channel.send({ components: [announceContainer], flags: MessageFlags.IsPersistent | MessageFlags.IsComponentsV2 });

            if (winners.length > 0) {
                for (const winnerId of winners) {
                    try {
                        const user = await this.client.users.fetch(winnerId);

                        const dmContent = await this.t(user, 'giveaway.dm.winner', {
                            prize: giveaway.prize,
                            server: channel.guild.name,
                            link: `https://discord.com/channels/${giveaway.guildId}/${giveaway.channelId}/${giveaway.messageId}`,
                        });

                        const dmContainer = await this.simpleContainer({ client: this.client, guild: null }, dmContent, {
                            color: 'Gold',
                            title: '🎉 Congratulations!',
                        });

                        await user.send({ components: dmContainer, flags: MessageFlags.IsComponentsV2 }).catch(() => {});
                    } catch (e) {}
                }
            }

            const message = await channel.messages.fetch(giveaway.messageId).catch(() => null);
            if (message) {
                const uiComponents = await this.buildGiveawayUI(channel, {
                    prize: giveaway.prize,
                    endTime: Math.floor(new Date(giveaway.endTime).getTime() / 1000),
                    hostId: giveaway.hostId,
                    winnersCount: giveaway.winners,
                    participantsCount: participants.length,
                    ended: true,
                    color: giveaway.color,
                    roleId: giveaway.roleId,
                    winnerList: winnerMentions,
                    description: description,
                });

                await message.edit({ components: uiComponents });
            }
        }

        if (interaction && !interaction.replied) {
            const successMsg = await this.t(interaction, 'giveaway.giveaway.end.admin_success');

            const successContainer = await this.simpleContainer(interaction, successMsg, { color: 'Green' });

            await interaction.reply({
                components: successContainer,
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
            });
        }
    }

    async cancelGiveaway(messageId, interaction) {
        const giveaway = await this.Giveaway.findOne({ where: { messageId } });

        if (!giveaway || giveaway.ended) {
            const desc = await this.t(interaction, 'giveaway.giveaway.not.found.desc');

            const err = await this.simpleContainer(interaction, desc, { color: 'Red', title: 'Error' });
            return interaction.reply({
                components: err,
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
            });
        }

        try {
            await this.Giveaway.scheduleRemove('active_schedule', messageId);
        } catch (e) {
            this.logger.warn(`Failed to remove ${messageId} from scheduler:`, e);
        }

        giveaway.ended = true;
        await giveaway.save();

        const channel = await this.client.channels.fetch(giveaway.channelId).catch(() => null);
        if (channel) {
            const message = await channel.messages.fetch(messageId).catch(() => null);
            if (message) {
                const cancelledText = await this.t(channel, 'giveaway.ui.status.cancelled');
                const uiComponents = await this.buildGiveawayUI(channel, {
                    prize: giveaway.prize,
                    endTime: Math.floor(new Date(giveaway.endTime).getTime() / 1000),
                    hostId: giveaway.hostId,
                    winnersCount: giveaway.winners,
                    participantsCount: (Array.isArray(giveaway.participants)
                        ? giveaway.participants
                        : JSON.parse(giveaway.participants || '[]')
                    ).length,
                    ended: true,
                    color: this.convertColor('Red', { from: 'discord', to: 'hex' }),
                    roleId: giveaway.roleId,
                    winnerList: cancelledText,
                    description: giveaway.description
                });
                await message.edit({ components: uiComponents });
            }

            const cancelAnnounce = await this.simpleContainer(
                channel,
                await this.t(channel, 'giveaway.cancel.announce.desc', { prize: giveaway.prize }),
                {
                    title: await this.t(channel, 'giveaway.cancel.announce.title'),
                    color: 'Red',
                }
            );

            await channel.send({ components: cancelAnnounce, flags: MessageFlags.IsComponentsV2 });
        }

        const successMsg = await this.t(interaction, 'giveaway.cancel.success');

        const successContainer = await this.simpleContainer(interaction, successMsg, { color: 'Green' });
        await interaction.reply({ components: successContainer, ephemeral: true, flags: MessageFlags.IsComponentsV2 });
    }

    async rerollGiveaway(messageId, interaction) {
        const giveaway = await this.Giveaway.findOne({ where: { messageId } });

        if (!giveaway || !giveaway.ended) {
            const msg = await this.t(interaction, 'giveaway.giveaway.not.ended.desc');
            const err = await this.simpleContainer(interaction, msg, { color: 'Red', title: 'Error' });
            return interaction.reply({ components: err, ephemeral: true, flags: MessageFlags.IsComponentsV2 });
        }

        let participants = [];
        try {
            participants = typeof giveaway.participants === 'string' ? JSON.parse(giveaway.participants) : giveaway.participants;
        } catch (e) {
            participants = [];
        }

        if (participants.length === 0) {
            const msg = await this.t(interaction, 'giveaway.reroll.error.no_participants');
            const err = await this.simpleContainer(interaction, msg, { color: 'Red' });
            return interaction.reply({ components: err, ephemeral: true, flags: MessageFlags.IsComponentsV2 });
        }

        const winners = [];
        const pool = [...participants];

        for (let i = 0; i < giveaway.winners; i++) {
            if (pool.length === 0) break;
            const index = Math.floor(Math.random() * pool.length);
            winners.push(pool[index]);
            pool.splice(index, 1);
        }

        const winnerMentions = winners.map((id) => `<@${id}>`).join(', ');

        const channel = await this.client.channels.fetch(giveaway.channelId).catch(() => null);
        if (channel) {
            const message = await channel.messages.fetch(messageId).catch(() => null);
            if (message) {
                const uiComponents = await this.buildGiveawayUI(channel, {
                    prize: giveaway.prize,
                    endTime: Math.floor(new Date(giveaway.endTime).getTime() / 1000),
                    hostId: giveaway.hostId,
                    winnersCount: giveaway.winners,
                    participantsCount: participants.length,
                    ended: true,
                    color: giveaway.color,
                    roleId: giveaway.roleId,
                    winnerList: winnerMentions,
                    description: giveaway.description
                });
                await message.edit({ components: uiComponents });
            }

            const endTimeSec = Math.floor(new Date(giveaway.endTime).getTime() / 1000);

            const announceMsg = await this.t(channel, 'giveaway.reroll.announce.desc', {
                winners: winnerMentions,
                prize: giveaway.prize,
                time: `<t:${endTimeSec}:R>`,
                host: `<@${giveaway.hostId}>`,
            });

            const announceTitle = await this.t(channel, 'giveaway.reroll.announce.title');

            const announceContainer = await this.simpleContainer(interaction, announceMsg, {
                color: 'Gold',
                title: announceTitle,
            });

            await channel.send({
                components: announceContainer,
                flags: MessageFlags.IsPersistent | MessageFlags.IsComponentsV2,
            });
        }

        const successMsg = await this.t(interaction, 'giveaway.reroll.success');
        const successContainer = await this.simpleContainer(interaction, successMsg, { color: 'Green' });

        await interaction.reply({ components: successContainer, ephemeral: true, flags: MessageFlags.IsComponentsV2 });
    }

    async buildGiveawayUI(context, data) {
        const accentColor = this.convertColor(data.color || 'Blue', { from: 'hex', to: 'decimal' });

        const joinBtn = new ButtonBuilder()
            .setCustomId('giveaway-join')
            .setLabel(await this.t(context, 'giveaway.ui.button.join'))
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🎉')
            .setDisabled(data.ended);

        const buttonRow = new ActionRowBuilder().addComponents(joinBtn);

        const titleText = await this.t(context, 'giveaway.ui.embed.title', { prize: data.prize });

        const container = new ContainerBuilder()
            .setAccentColor(accentColor)
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(titleText))
            .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));

        let desc = '';
        if (data.ended) {
            desc = await this.t(context, 'giveaway.ui.embed.desc_ended', {
                endTime: data.endTime,
                hostId: data.hostId,
                winners: data.winnerList || '...',
            });
        } else {
            desc = await this.t(context, 'giveaway.ui.embed.desc_active', {
                endTime: data.endTime,
                hostId: data.hostId,
                winnersCount: data.winnersCount,
            });
        }

        if (data.roleId) {
            desc += await this.t(context, 'giveaway.ui.embed.requirement', { roleId: data.roleId });
        }

        container.addTextDisplayComponents(new TextDisplayBuilder().setContent(desc));
        container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
        const partText = await this.t(context, 'giveaway.ui.embed.participants', { count: data.participantsCount });
        container.addTextDisplayComponents(new TextDisplayBuilder().setContent(partText));
        container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
        container.addActionRowComponents(buttonRow);
        container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
        container.addTextDisplayComponents(new TextDisplayBuilder().setContent(await this.t(context, 'giveaway.ui.embed.footer')));

        return [container];
    }
}

module.exports = GiveawayManager;
