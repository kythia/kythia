/**
 * @namespace: addons/dashboard/web/helpers/parser.js
 * @type: Helper Script
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

// Helper kecil untuk warna role mention
function hexToRgb(hex) {
    if (!hex) return '255,255,255';
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255,255,255';
}

function parseDiscordMarkdown(text, guild) {
    if (!text) return '';

    const placeholders = {};
    let placeholderId = 0;

    // 1. Amankan Code Blocks
    text = text.replace(/```(\w+)?\n([\s\S]*?)```|```([\s\S]*?)```/g, (match, lang, code1, code2) => {
        const code = code1 || code2;
        const key = `%%CODEBLOCK_${placeholderId++}%%`;
        let highlightedCode = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        placeholders[key] =
            `<pre class="discord-codeblock"><code class="language-${lang || 'plaintext'}">${highlightedCode}</code><button class="copy-btn" onclick="copyCodeBlock(this)">Copy</button></pre>`;
        return key;
    });

    const escapeHtml = (unsafe) =>
        unsafe.replace(/[&<"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[m]);
    text = escapeHtml(text);

    // 2. Headings (setelah escape)
    text = text
        .replace(/^### (.*$)/gim, '<h4>$1</h4>')
        .replace(/^## (.*$)/gim, '<h3>$1</h3>')
        .replace(/^# (.*$)/gim, '<h2>$1</h2>');

    // 3. Mentions, Channels, Roles (membutuhkan objek `guild`)
    if (guild) {
        text = text.replace(/&lt;@!?(\d+)&gt;/g, (match, userId) => {
            const member = guild.members.cache.get(userId);
            return `<span class="mention" title="${member ? member.user.tag : userId}">@${member ? member.displayName : 'unknown-user'}</span>`;
        });
        text = text.replace(/&lt;#(\d+)&gt;/g, (match, channelId) => {
            const channel = guild.channels.cache.get(channelId);
            return `<span class="mention">#${channel ? channel.name : 'deleted-channel'}</span>`;
        });
        text = text.replace(/&lt;@&(\d+)&gt;/g, (match, roleId) => {
            const role = guild.roles.cache.get(roleId);
            const roleStyle = role
                ? `color: ${role.hexColor}; background-color: rgba(${hexToRgb(role.hexColor)}, 0.1); border: 1px solid rgba(${hexToRgb(role.hexColor)}, 0.3);`
                : '';
            return `<span class="mention" style="${roleStyle}">@${role ? role.name : 'unknown-role'}</span>`;
        });
    }

    // 4. Sisa Markdown
    text = text
        .replace(/\[([^\]]+)\]\((https?:\/\/[^\s]+)\)/g, '<a href="$2" target="_blank">$1</a>') // Link [teks](url)
        .replace(/&lt;(https?:\/\/[^&]+)&gt;/g, '<a href="$1" target="_blank">$1</a>') // Link <url>
        .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/__(.*?)__/g, '<u>$1</u>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/_(.*?)_/g, '<em>$1</em>')
        .replace(/~~(.*?)~~/g, '<s>$1</s>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\|\|(.*?)\|\|/g, '<span class="spoiler" onclick="this.classList.add(\'revealed\')">$1</span>')
        .replace(/^&gt;&gt;&gt; ([\s\S]*)/g, '<blockquote>$1</blockquote>')
        .replace(/^&gt; (.*$)/gm, '<blockquote>$1</blockquote>');

    // 5. Emoji & Timestamps
    text = text
        .replace(
            /&lt;a:([a-zA-Z0-9_]+):(\d+)&gt;/g,
            '<img class="emoji" src="https://cdn.discordapp.com/emojis/$2.gif?quality=lossless" alt=":$1:">'
        )
        .replace(/&lt;:([a-zA-Z0-9_]+):(\d+)&gt;/g, '<img class="emoji" src="https://cdn.discordapp.com/emojis/$2.png" alt=":$1:">')
        .replace(
            /&lt;t:(\d+):([a-zA-Z])&gt;/g,
            (match, ts, flag) =>
                `<span class="timestamp-tag" data-timestamp="${ts}" data-format="${flag}" title="${new Date(ts * 1000).toString()}">${new Date(ts * 1000).toLocaleString('id-ID')}</span>`
        );

    // 6. Ganti newline dengan <br>
    text = text.replace(/\n/g, '<br>');

    // 7. Kembalikan code blocks
    for (const key in placeholders) {
        text = text.replace(key, placeholders[key]);
    }

    return text;
}

module.exports = parseDiscordMarkdown;
