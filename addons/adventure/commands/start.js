/**
 * @namespace: addons/adventure/commands/start.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta
 */
const User = require('../database/models/UserAdventure');
const { embedFooter } = require('@utils/discord');
const { EmbedBuilder } = require('discord.js');
const { t } = require('@utils/translator');

module.exports = {
    subcommand: true,
    data: (subcommand) =>
        subcommand
            .setName('start')
            .setNameLocalizations({ id: 'mulai', fr: 'demarrer', ja: 'スタート' })
            .setDescription('🛩️ Start your journey now!')
            .setDescriptionLocalizations({
                id: '🛩️ Mulai petualanganmu sekarang!',
                fr: '🛩️ Commence ton aventure maintenant !',
                ja: '🛩️ 今すぐ冒険を始めよう！',
            }),
    guildOnly: true,
    async execute(interaction) {
        await interaction.deferReply();
        const user = await User.getCache({ userId: interaction.user.id, guildId: interaction.guild.id });

        if (user) {
            const alreadyEmbed = new EmbedBuilder()
                .setColor(kythia.bot.color)
                .setDescription(await t(interaction, 'adventure_start_already_have'))
                .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [alreadyEmbed] });
        }

        await User.create({
            guildId: interaction.guild.id,
            userId: interaction.user.id,
            level: 1,
            xp: 0,
            hp: 100,
            gold: 50,
            strength: 10,
            defense: 5,
        });

        const embed = new EmbedBuilder()
            .setColor(kythia.bot.color)
            .setTitle(await t(interaction, 'adventure_start_success_title'))
            .setDescription(await t(interaction, 'adventure_start_success_desc'))
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .setFooter(await embedFooter(interaction));

        return interaction.editReply({ embeds: [embed] });
    },
};
