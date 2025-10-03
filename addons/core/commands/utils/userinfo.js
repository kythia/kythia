/**
 * @namespace: addons/core/commands/utils/userinfo.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta
 */
const {
    SlashCommandBuilder,
    EmbedBuilder,
    ContextMenuCommandBuilder,
    ApplicationCommandType,
    InteractionContextType,
} = require('discord.js');
const { embedFooter } = require('@utils/discord');
const { t } = require('@utils/translator');

module.exports = {
    slashCommand: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('📄 Displays information about a user.')
        .addUserOption((option) => option.setName('user').setDescription('User to get info about').setRequired(false))
        .setContexts(InteractionContextType.Guild),

    contextMenuCommand: new ContextMenuCommandBuilder()
        .setName('User Info')
        .setType(ApplicationCommandType.User)
        .setContexts(InteractionContextType.Guild),

    contextMenuDescription: '📄 Displays information about a user.',
    // guildOnly: true,
    async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.targetUser || interaction.user;

        let member;
        try {
            member = await interaction.guild?.members.fetch(user.id);
        } catch (e) {
            member = null;
        }

        if (!member && !interaction.guild) {
            return interaction.reply({
                content: await t(interaction, 'core_utils_userinfo_user_not_found'),
            });
        }

        const roles = member.roles.cache
            .filter((role) => role.id !== interaction.guild?.id)
            .sort((a, b) => b.position - a.position)
            .map((role) => `<@&${role.id}>`)
            .join(', ');

        const embed = new EmbedBuilder()
            .setColor(kythia.bot.color)
            .setDescription(
                `## ${await t(interaction, 'core_utils_userinfo_embed_title')}\n` +
                    (await t(interaction, 'core_utils_userinfo_embed_desc', { tag: user.tag }))
            )
            .addFields(
                {
                    name: await t(interaction, 'core_utils_userinfo_field_username'),
                    value: user.username,
                    inline: true,
                },
                {
                    name: await t(interaction, 'core_utils_userinfo_field_tag'),
                    value: `#${user.discriminator}`,
                    inline: true,
                },
                {
                    name: await t(interaction, 'core_utils_userinfo_field_userid'),
                    value: user.id,
                    inline: false,
                },
                {
                    name: await t(interaction, 'core_utils_userinfo_field_created'),
                    value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`,
                    inline: false,
                },
                {
                    name: await t(interaction, 'core_utils_userinfo_field_joined'),
                    value: member.joinedTimestamp
                        ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`
                        : await t(interaction, 'core_utils_userinfo_field_joined_unknown'),
                    inline: false,
                },
                {
                    name: await t(interaction, 'core_utils_userinfo_field_bot'),
                    value: user.bot
                        ? await t(interaction, 'core_utils_userinfo_value_yes')
                        : await t(interaction, 'core_utils_userinfo_value_no'),
                    inline: true,
                },
                {
                    name: await t(interaction, 'core_utils_userinfo_field_status'),
                    value:
                        member.presence?.status === 'online'
                            ? await t(interaction, 'core_utils_userinfo_value_status_online')
                            : member.presence?.status === 'idle'
                              ? await t(interaction, 'core_utils_userinfo_value_status_idle')
                              : member.presence?.status === 'dnd'
                                ? await t(interaction, 'core_utils_userinfo_value_status_dnd')
                                : member.presence?.status === 'invisible'
                                  ? await t(interaction, 'core_utils_userinfo_value_status_invisible')
                                  : await t(interaction, 'core_utils_userinfo_value_status_unknown'),
                    inline: true,
                },
                {
                    name: await t(interaction, 'core_utils_userinfo_field_roles'),
                    value: roles || (await t(interaction, 'core_utils_userinfo_value_no_roles')),
                    inline: false,
                }
            )
            .setThumbnail(user.displayAvatarURL())
            // .setTimestamp()
            .setFooter(await embedFooter(interaction));
        return interaction.reply({ embeds: [embed] });
    },
};
