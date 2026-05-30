/**
 * @namespace: addons/adventure/commands/battle.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	ButtonStyle,
	MessageFlags,
	ButtonBuilder,
	ActionRowBuilder,
	ContainerBuilder,
	SeparatorBuilder,
	TextDisplayBuilder,
	SeparatorSpacingSize,
} = require('discord.js');
const { getRandomMonster } = require('../helpers/monster');
const characters = require('../helpers/characters');
const { getItemById } = require('../helpers/items');

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('battle')
			.setNameLocalizations({ id: 'bertarung', fr: 'combat', ja: 'たたかう' })
			.setDescription('⚔️ Fight a monster in the dungeon!')
			.setDescriptionLocalizations({
				id: '⚔️ Bertarung melawan monster di dimensi lain!',
				fr: '⚔️ Combats un monstre dans le donjon !',
				ja: '⚔️ ダンジョンでモンスターと戦おう！',
			}),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t, models, kythiaConfig, helpers, logger } = container;
		const { UserAdventure, InventoryAdventure } = models;
		const { createContainer } = helpers.discord;
		const { convertColor } = helpers.color;

		await interaction.deferReply();
		const user = await UserAdventure.getCache({ userId: interaction.user.id });
		const userId = interaction.user.id;

		if (!user) {
			const msg = await t(interaction, 'adventure.no.character');

			const components = await createContainer(interaction, {
				description: msg,
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const generateHpBar = (currentHp, maxHp, barLength = 20) => {
			const hpPercent = Math.max(0, Math.min(1, currentHp / maxHp));
			const filledLength = Math.round(barLength * hpPercent);
			return `[${'█'.repeat(filledLength)}${'░'.repeat(barLength - filledLength)}] ${currentHp} HP`;
		};

		const handleBattleRound = async (
			interaction,
			user,
			items,
			showButtons = true,
		) => {
			const sword = items.find((item) => item?.itemName === 'sword');
			const shield = items.find((item) => item?.itemName === 'shield');
			const armor = items.find((item) => item?.itemName === 'armor');
			const revival = items.find((item) => item?.itemName === 'revival');

			const userStrength = user.strength + (sword ? 10 : 0);
			const userDefense = user.defense + (shield ? 10 : 0) + (armor ? 15 : 0);

			const char = user.characterId
				? characters.getChar(user.characterId)
				: null;

			const playerDamage = Math.max(
				1,
				userStrength + Math.floor(Math.random() * 4),
			);
			const monsterRaw = user.monsterStrength - userDefense;
			const monsterDamage = Math.max(
				1,
				monsterRaw + Math.floor(Math.random() * 4),
			);

			const monsterMaxHp =
				user.monsterHp > 0 ? user.monsterHp + playerDamage : 1;

			user.hp = Math.max(0, user.hp - monsterDamage);
			user.monsterHp = Math.max(0, user.monsterHp - playerDamage);
			await user.save();

			const battleButtons = new ActionRowBuilder().addComponents(
				new ButtonBuilder()
					.setCustomId('adventure_continue')
					.setLabel(await t(interaction, 'adventure.battle.continue.button'))
					.setStyle(ButtonStyle.Primary),
				new ButtonBuilder()
					.setCustomId('adventure_use_item')
					.setLabel(await t(interaction, 'adventure.inventory.use.item.button'))
					.setStyle(ButtonStyle.Secondary)
					.setEmoji('🔮'),
			);

			const usableItems = items.filter(
				(item) =>
					item.itemName === 'health_potion' || item.itemName === 'revival',
			);

			if (usableItems.length === 0) {
				battleButtons.components[1].setDisabled(true);
			}

			if (user.hp <= 0) {
				if (revival) {
					user.hp = user.maxHp;
					await user.save();
					if (revival.quantity > 1) {
						revival.quantity -= 1;
						await revival.save();
					} else {
						await revival.destroy();
						await InventoryAdventure.clearCache({
							userId: user.userId,
							itemName: 'revival',
						});
						const rIdx = items.findIndex((i) => i.itemName === 'revival');
						if (rIdx > -1) items.splice(rIdx, 1);
					}

					const msg = await t(interaction, 'adventure.battle.revive', {
						hp: user.hp,
					});

					const continueButton = new ActionRowBuilder().addComponents(
						new ButtonBuilder()
							.setCustomId('adventure_continue')
							.setLabel(
								await t(interaction, 'adventure.battle.continue.button'),
							)
							.setStyle(ButtonStyle.Primary),
					);

					const containerMsg = await createContainer(interaction, {
						description: msg,
						components: [continueButton],
					});

					return {
						components: containerMsg,
						end: false,
					};
				}

				user.hp = user.maxHp;
				user.monsterName = null;
				user.monsterHp = 0;
				user.monsterStrength = 0;
				user.monsterGoldDrop = 0;
				user.monsterXpDrop = 0;
				await user.save();

				const msg = await t(interaction, 'adventure.battle.lose', {
					hp: user.hp,
				});

				const containerMsg = await createContainer(interaction, {
					description: msg,
					color: 'Red',
				});

				return {
					components: containerMsg,
					end: true,
				};
			}

			if (user.monsterHp <= 0) {
				let goldEarned = user.monsterGoldDrop;
				let xpEarned = user.monsterXpDrop;
				if (char) {
					if (char.goldBonusPercent)
						goldEarned = Math.floor(
							goldEarned * (1 + char.goldBonusPercent / 100),
						);
					if (char.xpBonusPercent)
						xpEarned = Math.floor(xpEarned * (1 + char.xpBonusPercent / 100));
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

				await user.save();

				if (levelUp) {
					const msg = await t(interaction, 'adventure.battle.levelup', {
						level: user.level,
						hp: user.hp,
						maxHp: user.maxHp,
					});

					const containerMsg = await createContainer(interaction, {
						description: msg,
						color: 'Gold',
					});

					return {
						components: containerMsg,
						end: true,
					};
				}

				const msg = await t(interaction, 'adventure.battle.win', {
					monster: monsterName,
					gold: goldEarned,
					xp: xpEarned,
				});

				const containerMsg = await createContainer(interaction, {
					description: msg,
				});

				return {
					components: containerMsg,
					end: true,
				};
			}

			const battleContainer = new ContainerBuilder()
				.setAccentColor(
					convertColor(kythiaConfig.bot.color, { from: 'hex', to: 'decimal' }),
				)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						await t(interaction, 'adventure.battle.round', {
							user: interaction.user.username,
							monster: user.monsterName,
							playerDamage,
							monsterDamage,
						}),
					),
				)
				.addSeparatorComponents(
					new SeparatorBuilder()
						.setSpacing(SeparatorSpacingSize.Small)
						.setDivider(true),
				)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						`**${await t(interaction, 'adventure.battle.hp.you')}**\n${generateHpBar(user.hp, user.maxHp)}`,
					),
				)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						`**${await t(interaction, 'adventure.battle.hp.monster', {
							monster: user.monsterName,
						})}**\n${generateHpBar(user.monsterHp, monsterMaxHp)}`,
					),
				)
				.addSeparatorComponents(
					new SeparatorBuilder()
						.setSpacing(SeparatorSpacingSize.Small)
						.setDivider(true),
				);

			if (showButtons) {
				battleContainer.addActionRowComponents(battleButtons);
			}

			battleContainer
				.addSeparatorComponents(
					new SeparatorBuilder()
						.setSpacing(SeparatorSpacingSize.Small)
						.setDivider(true),
				)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						await t(interaction, 'common.container.footer', {
							username: interaction.client.user.username,
						}),
					),
				);

			return {
				components: [battleContainer],
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
			await user.save();
		}

		const items = await InventoryAdventure.getAllCache({
			where: { userId: userId },
			cacheTags: [`InventoryAdventure:inventory:byUser:${userId}`],
		});

		const result = await handleBattleRound(interaction, user, items, true);

		const reply = await interaction.editReply({
			components: result.components,
			flags: MessageFlags.IsComponentsV2,
			fetchReply: true,
		});

		if (result.end) return;

		const filter = (i) =>
			(i.customId === 'adventure_continue' ||
				i.customId === 'adventure_use_item' ||
				i.customId === 'adventure_item_select') &&
			i.user.id === interaction.user.id;

		const collector = reply.createMessageComponentCollector({
			filter,
			time: 60_000,
		});

		collector.on('collect', async (i) => {
			if (i.customId === 'adventure_use_item') {
				const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder } =
					require('discord.js');

				const consumablesMap = {};
				for (const item of items) {
					const def = getItemById(item.itemName);
					if (def && def.type === 'consumable') {
						if (!consumablesMap[def.id]) {
							consumablesMap[def.id] = {
								count: 0,
								def: def,
								dbId: item.id,
							};
						}
						consumablesMap[def.id].count += item.quantity
							? Number(item.quantity)
							: 1;
					}
				}

				const consumables = Object.values(consumablesMap);

				if (consumables.length === 0) {
					return i.reply({
						content: await t(
							interaction,
							'adventure.inventory.no.usable.items',
						),
						flags: MessageFlags.Ephemeral,
					});
				}

				const options = await Promise.all(
					consumables.map(async (data) =>
						new StringSelectMenuOptionBuilder()
							.setLabel(
								`${data.def.nameKey ? await t(interaction, data.def.nameKey) : data.def.id} (x${data.count})`,
							)
							.setValue(data.def.id)
							.setDescription(
								(await t(interaction, data.def.descKey)) || 'Consumable Item',
							)
							.setEmoji(data.def.emoji),
					),
				);

				const selectMenu = new StringSelectMenuBuilder()
					.setCustomId('adventure_item_select')
					.setPlaceholder(
						await t(interaction, 'adventure.inventory.select.item.placeholder'),
					)
					.addOptions(options);

				const row = new ActionRowBuilder().addComponents(selectMenu);

				const selectContainer = await createContainer(interaction, {
					title: await t(interaction, 'adventure.inventory.use.title'),
					description: await t(interaction, 'adventure.inventory.use.desc'),
					color: kythiaConfig.bot.color,
					components: [row],
				});

				const itemSelectReply = await i.reply({
					components: selectContainer,
					flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
					fetchReply: true,
				});

				try {
					const selection = await itemSelectReply.awaitMessageComponent({
						filter: (subI) =>
							subI.customId === 'adventure_item_select' &&
							subI.user.id === interaction.user.id,
						time: 60_000,
					});

					const selectedItemId = selection.values[0];

					const targetItem = getItemById(selectedItemId);
					let used = false;
					let resultMsg = '';
					let success = false;

					if (targetItem) {
						if (targetItem.effect === 'heal') {
							const healAmount = targetItem.amount || 0;
							if (user.hp >= user.maxHp) {
								resultMsg = await t(interaction, 'adventure.use.hp.full');
							} else {
								user.hp = Math.min(user.maxHp, user.hp + healAmount);
								used = true;
								success = true;
								const itemName = targetItem.nameKey
									? await t(interaction, targetItem.nameKey)
									: targetItem.id;
								resultMsg = await t(interaction, 'adventure.use.success.heal', {
									item: `${targetItem.emoji} ${itemName}`,
									amount: healAmount,
								});
							}
						} else if (targetItem.effect === 'revive') {
							if (user.hp > 0) {
								resultMsg = await t(
									interaction,
									'adventure.use.revive.failed.alive',
								);
							} else {
								if (targetItem.amount) {
									user.hp = Math.min(user.maxHp, user.hp + targetItem.amount);
									used = true;
									success = true;
									const itemName = targetItem.nameKey
										? await t(interaction, targetItem.nameKey)
										: targetItem.id;
									resultMsg = await t(
										interaction,
										'adventure.use.success.revive',
										{
											item: `${targetItem.emoji} ${itemName}`,
										},
									);
								}
							}
						} else {
							resultMsg = await t(
								interaction,
								'adventure.inventory.cannot.use.item',
							);
						}
					} else {
						resultMsg = await t(interaction, 'adventure.item.not.found');
					}

					if (used) {
						const itemIndex = items.findIndex(
							(item) => item.itemName === selectedItemId,
						);

						if (itemIndex > -1) {
							const dbItem = items[itemIndex];
							if (dbItem.quantity > 1) {
								dbItem.quantity -= 1;
								await dbItem.save();
							} else {
								await dbItem.destroy();
								items.splice(itemIndex, 1);
								await InventoryAdventure.clearCache({
									userId: user.userId,
									itemName: selectedItemId,
								});
							}
						}

						const nextResult = await handleBattleRound(
							interaction,
							user,
							items,
							true,
						);

						await interaction.editReply({
							components: nextResult.components,
							flags: MessageFlags.IsComponentsV2,
						});

						if (nextResult.end) collector.stop('battle_end');
					}

					const resultContainer = await createContainer(interaction, {
						title: success
							? await t(interaction, 'adventure.use.success')
							: await t(interaction, 'adventure.use.cancelled'),
						description: resultMsg,
						color: success ? 'Green' : 'Red',
					});

					await selection.update({
						components: resultContainer,
						flags: MessageFlags.IsComponentsV2,
					});
				} catch (e) {
					logger.error(`Error: ${e.message || e}`, { label: 'adventure' });
				}
				return;
			}

			await i.deferUpdate();
			const nextResult = await handleBattleRound(i, user, items, true);

			await interaction.editReply({
				components: nextResult.components,
				flags: MessageFlags.IsComponentsV2,
			});

			if (nextResult.end) collector.stop('battle_end');
		});

		collector.on('end', async (_, reason) => {
			if (reason !== 'battle_end') {
				const timeoutResult = await handleBattleRound(
					interaction,
					user,
					items,
					false,
				);
				await interaction.editReply({
					components: timeoutResult.components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
		});

		return;
	},
};
