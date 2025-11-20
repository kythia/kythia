/**
 * @namespace: addons/adventure/commands/battle.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { getRandomMonster } = require('../helpers/monster');
const characters = require('../helpers/characters');

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
    async execute(interaction, container) {
        // Dependency
        const { t, models, kythiaConfig, helpers } = container;
        const { UserAdventure, InventoryAdventure } = models;
        const { embedFooter } = helpers.discord;

        await interaction.deferReply();
        const user = await UserAdventure.getCache({ userId: interaction.user.id });
        const userId = interaction.user.id;
        if (!user) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(await t(interaction, 'adventure.no.character'))
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        const generateHpBar = (currentHp, maxHp, barLength = 20) => {
            const hpPercent = Math.max(0, Math.min(1, currentHp / maxHp));
            const filledLength = Math.round(barLength * hpPercent);
            return `[${'█'.repeat(filledLength)}${'░'.repeat(barLength - filledLength)}] ${currentHp} HP`;
        };

        const handleBattleRound = async (interaction, user, items) => {
            const sword = items.find((item) => item?.itemName === '⚔️ Sword');
            const shield = items.find((item) => item?.itemName === '🛡️ Shield');
            const armor = items.find((item) => item?.itemName === '🥋 Armor');
            const revival = items.find((item) => item?.itemName === '🍶 Revival');

            let userStrength = user.strength + (sword ? 10 : 0);
            let userDefense = user.defense + (shield ? 10 : 0) + (armor ? 15 : 0);

            const char = user.characterId ? characters.getChar(user.characterId) : null;

            const playerDamage = Math.max(1, userStrength + Math.floor(Math.random() * 4));
            let monsterRaw = user.monsterStrength - userDefense;
            const monsterDamage = Math.max(1, monsterRaw + Math.floor(Math.random() * 4));

            const monsterMaxHp = user.monsterHp > 0 ? user.monsterHp + playerDamage : 1;

            user.hp = Math.max(0, user.hp - monsterDamage);
            user.monsterHp = Math.max(0, user.monsterHp - playerDamage);
            await user.saveAndUpdateCache();

            const embed = new EmbedBuilder().setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }));

            const battleButtons = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('adventure_continue')
                    .setLabel(await t(interaction, 'adventure.battle.continue.button'))
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('adventure_use_item')
                    .setLabel(await t(interaction, 'inventory.use.item.button'))
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🔮')
            );

            const usableItems = await InventoryAdventure.findAll({
                where: {
                    userId: interaction.user.id,
                    itemName: ['🍶 Health Potion', '🍶 Revival'],
                },
                raw: true,
            });

            if (usableItems.length === 0) {
                battleButtons.components[1].setDisabled(true);
            }

            const continueButton = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('adventure_continue')
                    .setLabel(await t(interaction, 'adventure.battle.continue.button'))
                    .setStyle(ButtonStyle.Primary)
            );

            if (user.hp <= 0) {
                if (revival) {
                    user.hp = user.maxHp;
                    await user.saveAndUpdateCache();
                    await revival.destroy();
                    await InventoryAdventure.clearCache({ userId: user.userId, itemName: '🍶 Revival' });
                    return {
                        embeds: [
                            embed
                                .setDescription(
                                    await t(interaction, 'adventure.battle.revive', {
                                        hp: user.hp,
                                    })
                                )
                                .setColor(kythiaConfig.bot.color)
                                .setFooter(await embedFooter(interaction)),
                        ],
                        components: [continueButton],
                        end: false,
                    };
                }

                user.hp = user.maxHp;
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
                                await t(interaction, 'adventure.battle.lose', {
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

            if (user.monsterHp <= 0) {
                let goldEarned = user.monsterGoldDrop;
                let xpEarned = user.monsterXpDrop;
                if (char) {
                    if (char.goldBonusPercent) goldEarned = Math.floor(goldEarned * (1 + char.goldBonusPercent / 100));
                    if (char.xpBonusPercent) xpEarned = Math.floor(xpEarned * (1 + char.xpBonusPercent / 100));
                }
                const monsterName = user.monsterName;

                user.xp += xpEarned;
                user.gold += goldEarned;

                user.monsterName = null;
                user.monsterHp = 0;
                user.monsterStrength = 0;
                user.monsterGoldDrop = 0;
                user.monsterXpDrop = 0;

                const XP_REQUIRED = 100 * user.level;
                let levelUp = false;

                while (user.xp >= XP_REQUIRED) {
                    user.xp -= XP_REQUIRED;
                    user.level++;
                    user.strength += 5;
                    user.defense += 3;

                    user.maxHp = Math.ceil(user.maxHp * 1.1);

                    user.hp = user.maxHp;
                    levelUp = true;
                }

                await user.saveAndUpdateCache();

                if (levelUp) {
                    return {
                        embeds: [
                            embed
                                .setDescription(
                                    await t(interaction, 'adventure.battle.levelup', {
                                        level: user.level,
                                        hp: user.hp,
                                        maxHp: user.maxHp,
                                    })
                                )
                                .setColor(kythiaConfig.bot.color)
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
                                await t(interaction, 'adventure.battle.win', {
                                    monster: monsterName,
                                    gold: goldEarned,
                                    xp: xpEarned,
                                })
                            )
                            .setColor(kythiaConfig.bot.color)
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
                            await t(interaction, 'adventure.battle.round', {
                                user: interaction.user.username,
                                monster: user.monsterName,
                                playerDamage,
                                monsterDamage,
                            })
                        )
                        .setColor(kythiaConfig.bot.color)
                        .addFields(
                            {
                                name: await t(interaction, 'adventure.battle.hp.you'),
                                value: generateHpBar(user.hp, user.maxHp),
                                inline: false,
                            },
                            {
                                name: await t(interaction, 'adventure.battle.hp.monster', { monster: user.monsterName }),
                                value: generateHpBar(user.monsterHp, monsterMaxHp),
                                inline: false,
                            }
                        )
                        .setFooter(await embedFooter(interaction)),
                ],
                components: [battleButtons],
                end: false,
            };
        };

        if (!user.monsterName) {
            const monster = getRandomMonster(user.level);
            user.monsterName = monster.name;
            user.monsterHp = monster.hp;
            user.monsterStrength = monster.strength;
            user.monsterGoldDrop = monster.goldDrop;
            user.monsterXpDrop = monster.xpDrop;
            await user.saveAndUpdateCache();
        }

        const items = await InventoryAdventure.getCache([
            { userId: userId, itemName: '⚔️ Sword' },
            { userId: userId, itemName: '🛡️ Shield' },
            { userId: userId, itemName: '🥋 Armor' },
            { userId: userId, itemName: '🍶 Revival' },
        ]);

        const result = await handleBattleRound(interaction, user, items);

        const reply = await interaction.editReply({
            embeds: result.embeds,
            components: result.components,
            fetchReply: true,
        });

        if (result.end) return;

        const filter = (i) => i.customId === 'adventure_continue' && i.user.id === interaction.user.id;
        const collector = reply.createMessageComponentCollector({ filter, time: 60_000 });

        collector.on('collect', async (i) => {
            await i.deferUpdate();

            const nextResult = await handleBattleRound(i, user, items);

            if (
                nextResult.embeds[0].description &&
                nextResult.embeds[0].description.includes(await t(interaction, 'adventure.battle.revive'))
            ) {
                const revivalIndex = items.findIndex((item) => item?.itemName === '🍶 Revival');
                if (revivalIndex > -1) {
                    items.splice(revivalIndex, 1);
                }
            }

            await interaction.editReply({
                embeds: nextResult.embeds,
                components: nextResult.end ? [] : nextResult.components,
            });

            if (nextResult.end) collector.stop('battle_end');
        });

        collector.on('end', async (_, reason) => {
            if (reason !== 'battle_end') {
                const disabledRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('adventure_continue')
                        .setLabel(await t(interaction, 'adventure.battle.continue.button'))
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
