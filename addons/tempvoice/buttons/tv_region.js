/**
 * @namespace: addons/tempvoice/buttons/tv_region.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { ActionRowBuilder, StringSelectMenuBuilder, ContainerBuilder, TextDisplayBuilder, MessageFlags } = require('discord.js');

const REGIONS = [
    { label: 'Automatic', value: 'auto', emoji: '🤖' },
    { label: 'Brazil', value: 'brazil', emoji: '🇧🇷' },
    { label: 'Hong Kong', value: 'hongkong', emoji: '🇭🇰' },
    { label: 'India', value: 'india', emoji: '🇮🇳' },
    { label: 'Japan', value: 'japan', emoji: '🇯🇵' },
    { label: 'Rotterdam', value: 'rotterdam', emoji: '🇳🇱' },
    { label: 'Singapore', value: 'singapore', emoji: '🇸🇬' },
    { label: 'South Africa', value: 'southafrica', emoji: '🇿🇦' },
    { label: 'Sydney', value: 'sydney', emoji: '🇦🇺' },
    { label: 'US Central', value: 'us-central', emoji: '🇺🇸' },
    { label: 'US East', value: 'us-east', emoji: '🇺🇸' },
    { label: 'US South', value: 'us-south', emoji: '🇺🇸' },
    { label: 'US West', value: 'us-west', emoji: '🇺🇸' },
];

module.exports = {
    execute: async (interaction, container) => {
        const { models, t, helpers, kythiaConfig } = container;
        const { convertColor } = helpers.color;
        const { TempVoiceChannel } = models;

        const activeChannel = await TempVoiceChannel.getCache({
            ownerId: interaction.user.id,
            guildId: interaction.guild.id,
        });
        if (!activeChannel) {
            return interaction.reply({ content: await t(interaction, 'tempvoice.region.no_active_channel'), ephemeral: true });
        }

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(`tv_region_menu:${activeChannel.channelId}`)
            .setPlaceholder(await t(interaction, 'tempvoice.region.menu.placeholder'))
            .addOptions(REGIONS.map((r) => ({ ...r, default: r.value === (activeChannel.rtcRegion || 'auto') })));

        const row = new ActionRowBuilder().addComponents(selectMenu);
        const accentColor = convertColor(kythiaConfig.bot.color, { from: 'hex', to: 'decimal' });

        const containerComponent = new ContainerBuilder()
            .setAccentColor(accentColor)
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(await t(interaction, 'tempvoice.region.menu.content')))
            .addActionRowComponents(row);

        await interaction.reply({
            components: [containerComponent],
            flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        });
    },
};
