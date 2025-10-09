/**
 * @namespace: addons/pet/helpers/status.js
 * @type: Helper Script
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc.1
 */

async function updatePetStatus(pet) {
    const now = Date.now();
    const lastUpdated = pet.lastUpdatedAt ? pet.lastUpdatedAt.getTime() : now;
    const hoursPassed = Math.floor((now - lastUpdated) / (1000 * 60 * 60));
    if (hoursPassed <= 0) return;

    pet.hunger = Math.max(pet.hunger - 5 * hoursPassed, 0);
    pet.happiness = Math.max(pet.happiness - 10 * hoursPassed, 0);

    if (pet.hunger <= 0 && pet.happiness <= 0 && !pet.isDead) {
        pet.isDead = true;

        const user = await User.findOne({ where: { userId: pet.userId, isDead: false } });

        if (user) {
            const embed = new EmbedBuilder()
                .setTitle('> 💀 Pet Kamu Telah Mati!')
                .setDescription(`Pet kamu telah mati karena kelaparan!`)
                .setColor('Red');

            try {
                const discordUser = await client.users.fetch(user.userId);
                await discordUser.send({ embeds: [embed] });
            } catch (sendErr) {
                console.error(`gagal mengirim pesan ke user ${user.userId}:`, sendErr);
            }
        }
    }

    pet.lastUpdatedAt = new Date();
    await pet.save();
}
