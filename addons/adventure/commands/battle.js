/**
 * @namespace: addons/adventure/commands/battle.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc1
 */
const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionFlagsBits } = require('discord.js');
const User = require('../database/models/UserAdventure');
const Inventory = require('../database/models/InventoryAdventure');
const { getRandomMonster } = require('../helpers/monster');
const { embedFooter } = require('@utils/discord');
const { t } = require('@utils/translator');

module.exports = {
    subcommand: true,
    data: (subcommand) =>
        subcommand
            .setName('battle')
            .setNameLocalizations({ id: 'bertarung', fr: 'combat', ja: 'たたかう' })
            .setDescription('⚔️ Fight a monster in the dungeon!')
            .setDescriptionLocalizations({
                id: '⚔️ Bertarung melawan monster di dimensi lain!',
                fr: '⚔️ Combats un monstre dans le donjon !',
                ja: '⚔️ ダンジョンでモンスターと戦おう！',
            }),
    guildOnly: true,
    // permissions: PermissionFlagsBits.ManageGuild,
    async execute(interaction, container) {
        await interaction.deferReply();
        const user = await User.getCache({ userId: interaction.user.id, guildId: interaction.guild.id });
        const guildId = interaction.guild.id;
        const userId = interaction.user.id;
        if (!user) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(await t(interaction, 'adventure_no_character'))
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        // Progress bar generator
        const generateHpBar = (currentHp, maxHp, barLength = 20) => {
            const hpPercent = Math.max(0, Math.min(1, currentHp / maxHp));
            const filledLength = Math.round(barLength * hpPercent);
            return `[${'█'.repeat(filledLength)}${'░'.repeat(barLength - filledLength)}] ${currentHp} HP`;
        };

        // Helper untuk dapatkan max HP user (bisa scaling dengan level)
        const getUserMaxHp = (user) => Math.floor(100 * (1 + user.level * 0.1));

        // Function to handle a single round of battle and return the result
        const handleBattleRound = async (interaction, user, items) => {
            const sword = items.find((item) => item?.itemName === '⚔️ Sword');
            const shield = items.find((item) => item?.itemName === '🛡️ Shield');
            const armor = items.find((item) => item?.itemName === '🥋 Armor');
            const revival = items.find((item) => item?.itemName === '🍶 Revival');

            let userStrength = user.strength + (sword ? 10 : 0);
            let userDefense = user.defense + (shield ? 10 : 0) + (armor ? 15 : 0);

            const playerDamage = Math.max(1, userStrength + Math.floor(Math.random() * 4));
            let monsterRaw = user.monsterStrength - userDefense;
            const monsterDamage = Math.max(1, monsterRaw + Math.floor(Math.random() * 4));

            const userMaxHp = getUserMaxHp(user);
            const monsterMaxHp = user.monsterHp > 0 ? user.monsterHp + playerDamage : 1;

            user.hp = Math.max(0, user.hp - monsterDamage);
            user.monsterHp = Math.max(0, user.monsterHp - playerDamage);
            await user.saveAndUpdateCache();

            const embed = new EmbedBuilder().setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }));

            // Button to continue the adventure
            const continueButton = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('adventure_continue')
                    .setLabel(await t(interaction, 'adventure_battle_continue_button'))
                    .setStyle(ButtonStyle.Primary)
            );

            // Kalau user kalah
            if (user.hp <= 0) {
                if (revival) {
                    user.hp = userMaxHp;
                    await user.saveAndUpdateCache();
                    await revival.destroy();
                    await Inventory.clearCache({
                        guildId: user.guildId,
                        userId: user.userId,
                        itemName: '🍶 Revival',
                    });
                    return {
                        embeds: [
                            embed
                                .setDescription(
                                    await t(interaction, 'adventure_battle_revive', {
                                        hp: user.hp,
                                    })
                                )
                                .setColor(kythia.bot.color)
                                .setFooter(await embedFooter(interaction)),
                        ],
                        components: [continueButton],
                        end: false,
                    };
                }

                // Kalah tanpa revival: reset HP, hapus monster
                user.hp = userMaxHp;
                user.monsterName = null;
                user.monsterHp = 0;
                user.monsterStrength = 0;
                user.monsterGoldDrop = 0;
                user.monsterXpDrop = 0;
                await user.saveAndUpdateCache();
                return {
                    embeds: [
                        embed
                            .setDescription(
                                await t(interaction, 'adventure_battle_lose', {
                                    hp: user.hp,
                                })
                            )
                            .setColor('Red')
                            .setFooter(await embedFooter(interaction)),
                    ],
                    components: [continueButton],
                    end: true,
                };
            }

            // Kalau monster mati
            if (user.monsterHp <= 0) {
                const goldEarned = user.monsterGoldDrop;
                const xpEarned = user.monsterXpDrop;
                const monsterName = user.monsterName;

                user.xp += xpEarned;
                user.gold += goldEarned;

                // Reset monster
                user.monsterName = null;
                user.monsterHp = 0;
                user.monsterStrength = 0;
                user.monsterGoldDrop = 0;
                user.monsterXpDrop = 0;

                // XP required for next level (sederhanakan, misal: 100 * level)
                const XP_REQUIRED = 100 * user.level;
                let levelUp = false;
                while (user.xp >= XP_REQUIRED) {
                    user.xp -= XP_REQUIRED;
                    user.level++;
                    user.strength += 5;
                    user.defense += 3;
                    user.hp = getUserMaxHp(user);
                    levelUp = true;
                }

                await user.saveAndUpdateCache();

                if (levelUp) {
                    return {
                        embeds: [
                            embed
                                .setDescription(
                                    await t(interaction, 'adventure_battle_levelup', {
                                        level: user.level,
                                        hp: user.hp,
                                    })
                                )
                                .setColor(kythia.bot.color)
                                .setFooter(await embedFooter(interaction)),
                        ],
                        components: [continueButton],
                        end: true,
                    };
                }

                return {
                    embeds: [
                        embed
                            .setDescription(
                                await t(interaction, 'adventure_battle_win', {
                                    monster: monsterName,
                                    gold: goldEarned,
                                    xp: xpEarned,
                                })
                            )
                            .setColor(kythia.bot.color)
                            .setFooter(await embedFooter(interaction)),
                    ],
                    components: [continueButton],
                    end: true,
                };
            }

            // Battle masih lanjut
            return {
                embeds: [
                    embed
                        .setDescription(
                            await t(interaction, 'adventure_battle_round', {
                                user: interaction.user.username,
                                monster: user.monsterName,
                                playerDamage,
                                monsterDamage,
                            })
                        )
                        .setColor(kythia.bot.color)
                        .addFields(
                            {
                                name: await t(interaction, 'adventure_battle_hp_you'),
                                value: generateHpBar(user.hp, userMaxHp),
                                inline: false,
                            },
                            {
                                name: await t(interaction, 'adventure_battle_hp_monster', { monster: user.monsterName }),
                                value: generateHpBar(user.monsterHp, monsterMaxHp),
                                inline: false,
                            }
                        )
                        .setFooter(await embedFooter(interaction)),
                ],
                components: [continueButton],
                end: false,
            };
        };

        // Jika monster belum ada, buat monster baru
        if (!user.monsterName) {
            const monster = getRandomMonster(user.level);
            user.monsterName = monster.name;
            user.monsterHp = monster.hp;
            user.monsterStrength = monster.strength;
            user.monsterGoldDrop = monster.goldDrop;
            user.monsterXpDrop = monster.xpDrop;
            await user.saveAndUpdateCache();
        }

        const items = await Inventory.getCache([
            { guildId: guildId, userId: userId, itemName: '⚔️ Sword' },
            { guildId: guildId, userId: userId, itemName: '🛡️ Shield' },
            { guildId: guildId, userId: userId, itemName: '🥋 Armor' },
            { guildId: guildId, userId: userId, itemName: '🍶 Revival' },
        ]);

        // First round
        const result = await handleBattleRound(interaction, user, items);

        // Send the initial reply and set up the collector
        const reply = await interaction.editReply({
            embeds: result.embeds,
            components: result.components,
            fetchReply: true,
        });

        // If the battle ended (user lost or monster died), don't set up a collector
        if (result.end) return;

        // Set up a collector for the continue button
        const filter = (i) => i.customId === 'adventure_continue' && i.user.id === interaction.user.id;
        const collector = reply.createMessageComponentCollector({ filter, time: 60_000 });

        collector.on('collect', async (i) => {
            await i.deferUpdate();

            // Re-fetch user and items for up-to-date stats
            const freshUser = await User.getCache({ guildId, userId });
            const freshItems = await Inventory.getCache([
                { guildId: guildId, userId: userId, itemName: '⚔️ Sword' },
                { guildId: guildId, userId: userId, itemName: '🛡️ Shield' },
                { guildId: guildId, userId: userId, itemName: '🥋 Armor' },
                { guildId: guildId, userId: userId, itemName: '🍶 Revival' },
            ]);

            const nextResult = await handleBattleRound(i, freshUser, freshItems);

            await interaction.editReply({
                embeds: nextResult.embeds,
                components: nextResult.end ? [] : nextResult.components,
            });

            if (nextResult.end) collector.stop('battle_end');
        });

        collector.on('end', async (_, reason) => {
            if (reason !== 'battle_end') {
                // Disable the button if time runs out
                const disabledRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('adventure_continue')
                        .setLabel(await t(interaction, 'adventure_battle_continue_button'))
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(true)
                );
                await interaction.editReply({
                    components: [disabledRow],
                });
            }
        });

        return;
    },
};
