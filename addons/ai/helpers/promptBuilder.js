/**
 * @namespace: addons/ai/helpers/promptBuilder.js
 * @type: Helper Script
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta
 */

// addons/ai/helpers/promptBuilder.js

// Bagian 1: Definisi Persona Inti
const personaPrompt = kythia.addons.ai.personaPrompt;

// Bagian 2: Aturan Interaksi dengan Owner
const ownerInteractionPrompt = kythia.addons.ai.ownerInteractionPrompt;

// Bagian 3: Aturan Penggunaan Tools/Command
const toolRulesPrompt = `
--- ATURAN PENGGUNAAN TOOLS (WAJIB DIIKUTI) ---
1. Kamu memiliki akses ke beberapa command Discord. Jika permintaan user bisa diselesaikan dengan command (misal: "putar lagu", "cek ping"), JANGAN menjawab "aku tidak bisa", tapi panggillah command yang sesuai.
2. Ekstrak semua argumen yang dibutuhkan dari pesan user.
3. Setelah mendapat hasil dari command (dalam format JSON), rangkai menjadi jawaban yang natural.
4. Jangan pernah menyebutkan "command", "tool", atau "JSON" kepada user. Bagi mereka, kamu melakukannya secara ajaib.
5. Jika hasil command berisi nilai khusus seperti -1 atau error, jelaskan dengan ramah (misal: "koneksinya belum stabil").
6. Jika kamu disuruh untuk cari di internet, maka gunakan google search (iya kamu bisa searching).
`;

const discordRulesPrompt = `
--- ATURAN PLATFORM DISCORD (SANGAT PENTING) ---
1.  Setiap pesan yang kamu kirim di Discord memiliki batas maksimal 2000 karakter.
2.  JAWABANMU HARUS SELALU DI BAWAH 2000 KARAKTER. Buat jawabanmu ringkas.
3.  Jika kamu HARUS memberikan jawaban yang sangat panjang (lebih dari 2000 karakter), kamu WAJIB memecahnya menjadi beberapa pesan.
4.  Untuk memecah pesan, gunakan pembatas khusus '[SPLIT]' di antara setiap bagian pesan.
    Contoh: "Ini adalah bagian pertama dari jawabanku.[SPLIT]Dan ini adalah bagian kedua yang akan dikirim sebagai pesan terpisah."
5.  JANGAN PERNAH menghasilkan jawaban tunggal yang lebih dari 2000 karakter. Selalu gunakan '[SPLIT]' jika diperlukan.
6. JANGAN MEMAKAI '[SPLIT]' jika tidak mendekati 2000 karakter.
`;

/**
 * Membangun systemInstruction final dengan menggabungkan semua bagian.
 * @param {object} context - Objek berisi data dinamis (info user, channel, dll).
 * @returns {string} - String systemInstruction yang lengkap.
 */
function buildSystemInstruction(context) {
    const isOwner = context.userId === kythia.owner.id;

    // console.log(isOwner);
    // Mulai dengan instruksi dasar yang berlaku untuk semua orang
    const instructionParts = [personaPrompt, toolRulesPrompt, discordRulesPrompt];

    // JIKA yang berbicara adalah owner, baru kita tambahkan instruksi spesial
    if (isOwner) {
        instructionParts.push(ownerInteractionPrompt);
    }

    // Gabungkan semua bagian instruksi yang relevan
    let instruction = instructionParts.join('\n');

    // GANTI BAGIAN userContext DENGAN INI:
    const userContext = `
   --- INFORMASI SAAT INI ---
   PENTING: Riwayat obrolan di bawah ini mungkin berisi pesan dari pengguna lain, yang ditandai dengan format "Nama: Isi Pesan". Selalu fokus dan personalisasi jawabanmu HANYA untuk "Pengguna yang berbicara" saat ini.
   Pengguna yang berbicara:
   - Nama: ${context.userDisplayName}
   - ID: ${context.userId}
   - Username: ${context.userTag}
   - Bio: ${context.userBio}
   
   Konteks Percakapan:
   - Server: ${context.guildName}
   - Channel: #${context.channelName}
   ${context.userFactsString ? `\nFakta yang sudah kamu ingat tentang user ini:\n${context.userFactsString}` : ''}
   `;

    instruction += userContext;
    return instruction;
}

module.exports = { buildSystemInstruction };
