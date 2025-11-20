/**
 * @namespace: addons/core/commands/utils/kyth.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kyth')
        .setDescription('🛠️ Manage All Kythia related config')
        .addSubcommandGroup((group) =>
            group
                .setName('team')
                .setDescription('Manage Kythia Team members')
                .addSubcommand((sub) =>
                    sub
                        .setName('add')
                        .setDescription('Add a member to Kythia Team')
                        .addUserOption((option) => option.setName('user').setDescription('User to add to the team').setRequired(true))
                        .addStringOption((option) =>
                            option.setName('name').setDescription('Name/role of the team member').setRequired(false)
                        )
                )
                .addSubcommand((sub) =>
                    sub
                        .setName('delete')
                        .setDescription('Remove a member from Kythia Team')
                        .addUserOption((option) => option.setName('user').setDescription('User to remove from the team').setRequired(true))
                )
                .addSubcommand((sub) => sub.setName('list').setDescription('Show all Kythia Team members'))
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    ownerOnly: true,

    async execute(interaction, container) {
        const { t, kythiaConfig, helpers, logger, models } = container;
        const { convertColor } = helpers.color;
        const { KythiaTeam } = models;

        await interaction.deferReply();

        const subcommandGroup = interaction.options.getSubcommandGroup();
        const subcommand = interaction.options.getSubcommand();

        if (subcommandGroup === 'team') {
            if (subcommand === 'add') {
                await this.handleAdd(interaction);
            } else if (subcommand === 'delete') {
                await this.handleDelete(interaction);
            } else if (subcommand === 'list') {
                await this.handleList(interaction);
            }
        }
    },

    async handleAdd(interaction) {
        const user = interaction.options.getUser('user');
        const name = interaction.options.getString('name') || null;

        try {
            const existing = await KythiaTeam.getCache({ userId: user.id });
            if (existing) {
                return interaction.editReply({
                    content: `❌ **${user.tag}** is already in the Kythia Team!`,
                    ephemeral: true,
                });
            }

            await KythiaTeam.create({
                userId: user.id,
                name: name,
            });

            const embed = new EmbedBuilder()
                .setTitle('✅ Team Member Added')
                .setColor('Green')
                .setDescription(`Successfully added **${user.tag}** to Kythia Team!`)
                .addFields(
                    { name: 'User ID', value: user.id, inline: true },
                    { name: 'Name/Role', value: name || 'Not specified', inline: true }
                )
                .setTimestamp();

            await interaction.editReply({ embeds: [embed], ephemeral: true });
            logger.info(`Added ${user.tag} (${user.id}) to Kythia Team by ${interaction.user.tag}`);
        } catch (error) {
            logger.error('Failed to add team member:', error);
            await interaction.editReply({
                content: `❌ Failed to add team member: ${error.message}`,
                ephemeral: true,
            });
        }
    },

    async handleDelete(interaction) {
        const user = interaction.options.getUser('user');

        try {
            const existing = await KythiaTeam.getCache({ userId: user.id });
            if (!existing) {
                return interaction.editReply({
                    content: `❌ **${user.tag}** is not in the Kythia Team!`,
                    ephemeral: true,
                });
            }

            await KythiaTeam.destroy({ where: { userId: user.id } });

            const embed = new EmbedBuilder()
                .setTitle('✅ Team Member Removed')
                .setColor('Red')
                .setDescription(`Successfully removed **${user.tag}** from Kythia Team!`)
                .addFields({ name: 'User ID', value: user.id, inline: true })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed], ephemeral: true });
            logger.info(`Removed ${user.tag} (${user.id}) from Kythia Team by ${interaction.user.tag}`);
        } catch (error) {
            logger.error('Failed to remove team member:', error);
            await interaction.editReply({
                content: `❌ Failed to remove team member: ${error.message}`,
                ephemeral: true,
            });
        }
    },

    async handleList(interaction) {
        try {
            const teamMembers = await KythiaTeam.getAllCache();

            if (teamMembers.length === 0) {
                return interaction.editReply({
                    content: '📋 The Kythia Team is currently empty.',
                    ephemeral: true,
                });
            }

            const embed = new EmbedBuilder()
                .setTitle('👥 Kythia Team Members')
                .setColor('Blurple')
                .setDescription(`Total members: **${teamMembers.length}**`)
                .setTimestamp();

            const fields = [];
            for (const member of teamMembers) {
                try {
                    const user = await interaction.client.users.fetch(member.userId).catch(() => null);
                    const userName = user ? user.tag : `Unknown User (${member.userId})`;
                    const nameRole = member.name || 'No role specified';
                    fields.push({
                        name: `${userName}`,
                        value: `**ID:** ${member.userId}\n**Role:** ${nameRole}`,
                        inline: false,
                    });
                } catch (err) {
                    logger.warn(`Failed to fetch user ${member.userId}:`, err);
                    fields.push({
                        name: `Unknown User`,
                        value: `**ID:** ${member.userId}\n**Role:** ${member.name || 'No role specified'}`,
                        inline: false,
                    });
                }
            }

            if (fields.length > 25) {
                const chunks = [];
                for (let i = 0; i < fields.length; i += 25) {
                    chunks.push(fields.slice(i, i + 25));
                }

                const embeds = chunks.map((chunk, index) => {
                    const chunkEmbed = new EmbedBuilder()
                        .setTitle(index === 0 ? '👥 Kythia Team Members' : `👥 Kythia Team Members (continued ${index + 1})`)
                        .setColor('Blurple')
                        .addFields(chunk);
                    if (index === 0) {
                        chunkEmbed.setDescription(`Total members: **${teamMembers.length}**`);
                    }
                    return chunkEmbed;
                });

                await interaction.editReply({ embeds: embeds, ephemeral: true });
            } else {
                embed.addFields(fields);
                await interaction.editReply({ embeds: [embed], ephemeral: true });
            }

            logger.info(`Kythia Team list viewed by ${interaction.user.tag}`);
        } catch (error) {
            logger.error('Failed to list team members:', error);
            await interaction.editReply({
                content: `❌ Failed to list team members: ${error.message}`,
                ephemeral: true,
            });
        }
    },
};
