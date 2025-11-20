/**
 * @namespace: addons/core/commands/moderation/role.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: (subcommand) =>
        subcommand
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
            ),
    permissions: PermissionFlagsBits.ManageRoles,
    botPermissions: PermissionFlagsBits.ManageRoles,
    async execute(interaction, container) {
        const { t, helpers } = container;
        const { embedFooter } = helpers.discord;

        await interaction.deferReply({ ephemeral: true });

        const user = interaction.options.getUser('user');
        const role = interaction.options.getRole('role');
        const action = interaction.options.getString('action');
        let member;
        try {
            member = await interaction.guild.members.fetch(user.id);
        } catch (err) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(await t(interaction, 'core.moderation.role.member.not.found', { user: user.tag }))
                .setTimestamp()
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        const embed = new EmbedBuilder()
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setTimestamp()
            .setFooter(await embedFooter(interaction));

        // Defensive: Check if role is managed or above bot's position
        const botMember = interaction.guild.members.me;
        if (!botMember) {
            embed.setColor('Red').setDescription('Bot member not found in this guild.');
            return interaction.editReply({ embeds: [embed] });
        }
        if (role.managed) {
            embed.setColor('Red').setDescription(await t(interaction, 'core.moderation.role.managed', { role: role.name }));
            return interaction.editReply({ embeds: [embed] });
        }
        if (role.position >= botMember.roles.highest.position) {
            embed.setColor('Red').setDescription(await t(interaction, 'core.moderation.role.too.high', { role: role.name }));
            return interaction.editReply({ embeds: [embed] });
        }
        // Defensive: Check if user is guild owner
        if (member.id === interaction.guild.ownerId) {
            embed.setColor('Red').setDescription(await t(interaction, 'core.moderation.role.owner', { user: user.tag }));
            return interaction.editReply({ embeds: [embed] });
        }
        // Defensive: Check if bot has permission to manage roles
        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
            embed.setColor('Red').setDescription(await t(interaction, 'core.moderation.role.missing.bot.perm'));
            return interaction.editReply({ embeds: [embed] });
        }
        // Defensive: Check if user is above command user
        if (
            interaction.member &&
            interaction.member.roles.highest.position <= member.roles.highest.position &&
            interaction.user.id !== interaction.guild.ownerId
        ) {
            embed.setColor('Red').setDescription(await t(interaction, 'core.moderation.role.hierarchy', { user: user.tag }));
            return interaction.editReply({ embeds: [embed] });
        }

        if (action === 'add') {
            if (member.roles.cache.has(role.id)) {
                embed.setColor(kythia.bot.color).setDescription(
                    await t(interaction, 'core.moderation.role.already.has', {
                        user: user.tag,
                        role: role.name,
                    })
                );
                return interaction.editReply({ embeds: [embed] });
            } else {
                try {
                    await member.roles.add(role);
                    embed.setColor(kythia.bot.color).setDescription(
                        await t(interaction, 'core.moderation.role.add.success', {
                            role: role.name,
                            user: user.tag,
                        })
                    );
                    return interaction.editReply({ embeds: [embed] });
                } catch (error) {
                    // Defensive: Handle DiscordAPIError[50013]: Missing Permissions
                    if (error.code === 50013) {
                        embed.setColor('Red').setDescription(
                            await t(interaction, 'core.moderation.role.missing.perm.error', {
                                role: role.name,
                                user: user.tag,
                            })
                        );
                    } else {
                        embed.setColor('Red').setDescription(
                            await t(interaction, 'core.moderation.role.unknown.error', {
                                error: error.message || error.toString(),
                            })
                        );
                    }
                    return interaction.editReply({ embeds: [embed] });
                }
            }
        } else if (action === 'remove') {
            if (!member.roles.cache.has(role.id)) {
                embed.setColor(kythia.bot.color).setDescription(
                    await t(interaction, 'core.moderation.role.not.has', {
                        user: user.tag,
                        role: role.name,
                    })
                );
                return interaction.editReply({ embeds: [embed] });
            } else {
                try {
                    await member.roles.remove(role);
                    embed.setColor(kythia.bot.color).setDescription(
                        await t(interaction, 'core.moderation.role.remove.success', {
                            role: role.name,
                            user: user.tag,
                        })
                    );
                    return interaction.editReply({ embeds: [embed] });
                } catch (error) {
                    // Defensive: Handle DiscordAPIError[50013]: Missing Permissions
                    if (error.code === 50013) {
                        embed.setColor('Red').setDescription(
                            await t(interaction, 'core.moderation.role.missing.perm.error', {
                                role: role.name,
                                user: user.tag,
                            })
                        );
                    } else {
                        embed.setColor('Red').setDescription(
                            await t(interaction, 'core.moderation.role.unknown.error', {
                                error: error.message || error.toString(),
                            })
                        );
                    }
                    return interaction.editReply({ embeds: [embed] });
                }
            }
        }
    },
};
