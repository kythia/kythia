/**
 * @namespace: addons/fun/commands/act.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

const VALID_ACTIONS = [
    'hug',
    'kiss',
    'pat',
    'slap',
    'cuddle',
    'wave',
    'highfive',
    'handhold',
    'bite',
    'bonk',
    'yeet',
    'dance',
    'poke',
    'wink',
    'lick',
    'smile',
    'blush',
    'happy',
    'cry',
    'nom',
    'kill',
    'kick',
    'smug',
    'cringe',
    'bully',
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('act')
        .setDescription('🤗 Perform an anime action with a user')
        .addStringOption((option) =>
            option
                .setName('action')
                .setDescription('The action to perform')
                .setRequired(true)
                .addChoices(
                    { name: 'Hug', value: 'hug' },
                    { name: 'Kiss', value: 'kiss' },
                    { name: 'Pat', value: 'pat' },
                    { name: 'Slap', value: 'slap' },
                    { name: 'Cuddle', value: 'cuddle' },
                    { name: 'Wave', value: 'wave' },
                    { name: 'High Five', value: 'highfive' },
                    { name: 'Handhold', value: 'handhold' },
                    { name: 'Bite', value: 'bite' },
                    { name: 'Bonk', value: 'bonk' },
                    { name: 'Yeet', value: 'yeet' },
                    { name: 'Dance', value: 'dance' },
                    { name: 'Poke', value: 'poke' },
                    { name: 'Wink', value: 'wink' },
                    { name: 'Lick', value: 'lick' },
                    { name: 'Smile', value: 'smile' },
                    { name: 'Blush', value: 'blush' },
                    { name: 'Happy', value: 'happy' },
                    { name: 'Cry', value: 'cry' },
                    { name: 'Nom', value: 'nom' },
                    { name: 'Kill', value: 'kill' },
                    { name: 'Kick', value: 'kick' },
                    { name: 'Smug', value: 'smug' },
                    { name: 'Cringe', value: 'cringe' },
                    { name: 'Bully', value: 'bully' }
                )
        )
        .addUserOption((option) => option.setName('user').setDescription('The user to perform the action on').setRequired(false)),

    async execute(interaction, container) {
        const { t, kythiaConfig, helpers } = container;
        const { embedFooter } = helpers.discord;

        const action = interaction.options.getString('action');
        const targetUser = interaction.options.getUser('user');
        const author = interaction.user;

        if (!VALID_ACTIONS.includes(action)) {
            return interaction.reply({
                content: await t(interaction, 'fun.act.errors.invalid_action'),
                ephemeral: true,
            });
        }

        const response = await axios.get(`https://api.waifu.pics/sfw/${action}`);
        const gifUrl = response.data?.url;

        if (!gifUrl) {
            throw new Error('No GIF URL received from API');
        }

        let actionText;
        if (targetUser) {
            if (targetUser.id === author.id) {
                actionText = await t(interaction, `fun.act.self.${action}`, { user: author.toString() });
            } else if (targetUser.id === interaction.client.user.id) {
                actionText = await t(interaction, `fun.act.bot.${action}`, {
                    user: author.toString(),
                    bot: targetUser.toString(),
                });
            } else {
                actionText = await t(interaction, `fun.act.other.${action}`, {
                    user: author.toString(),
                    target: targetUser.toString(),
                });
            }
        } else {
            actionText = await t(interaction, `fun.act.none.${action}`, { user: author.toString() });
        }

        const embed = new EmbedBuilder()
            .setColor(kythiaConfig.bot.color)
            .setDescription(actionText)
            .setImage(gifUrl)
            .setFooter(await embedFooter(interaction));

        await interaction.reply({ embeds: [embed] });
    },
};
