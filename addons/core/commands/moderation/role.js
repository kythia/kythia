/**
 * @namespace: addons/core/commands/moderation/role.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc1
 */
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, InteractionContextType } = require('discord.js');
const { embedFooter } = require('@utils/discord');
const { t } = require('@utils/translator');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('role')
        .setDescription('⭕ Add or remove a role from a user.')
        .addUserOption((option) => option.setName('user').setDescription('The user to modify').setRequired(true))
        .addRoleOption((option) => option.setName('role').setDescription('The role to add or remove').setRequired(true))
        .addStringOption((option) =>
            option
                .setName('action')
                .setDescription('Choose whether to add or remove the role.')
                .setRequired(true)
                .addChoices({ name: 'Add', value: 'add' }, { name: 'Remove', value: 'remove' })
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .setContexts(InteractionContextType.Guild),
    permissions: PermissionFlagsBits.ManageRoles,
    botPermissions: PermissionFlagsBits.ManageRoles,
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const user = interaction.options.getUser('user');
        const role = interaction.options.getRole('role');
        const action = interaction.options.getString('action');
        const member = await interaction.guild.members.fetch(user.id);

        const embed = new EmbedBuilder()
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setTimestamp()
            .setFooter(await embedFooter(interaction));

        if (action === 'add') {
            if (member.roles.cache.has(role.id)) {
                embed.setColor(kythia.bot.color).setDescription(
                    await t(interaction, 'core_moderation_role_already_has', {
                        user: user.tag,
                        role: role.name,
                    })
                );
                return interaction.editReply({ embeds: [embed] });
            } else {
                await member.roles.add(role);
                embed.setColor(kythia.bot.color).setDescription(
                    await t(interaction, 'core_moderation_role_add_success', {
                        role: role.name,
                        user: user.tag,
                    })
                );
                return interaction.editReply({ embeds: [embed] });
            }
        } else if (action === 'remove') {
            if (!member.roles.cache.has(role.id)) {
                embed.setColor(kythia.bot.color).setDescription(
                    await t(interaction, 'core_moderation_role_not_has', {
                        user: user.tag,
                        role: role.name,
                    })
                );
                return interaction.editReply({ embeds: [embed] });
            } else {
                await member.roles.remove(role);
                embed.setColor(kythia.bot.color).setDescription(
                    await t(interaction, 'core_moderation_role_remove_success', {
                        role: role.name,
                        user: user.tag,
                    })
                );
                return interaction.editReply({ embeds: [embed] });
            }
        }
    },
};
