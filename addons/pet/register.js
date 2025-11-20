/**
 * @namespace: addons/pet/register.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

module.exports = {
    async initialize(bot) {
        bot.addDbReadyHook((sequelize) => {
            const { KythiaUser, UserPet, Pet } = sequelize.models;

            if (KythiaUser && UserPet) {
                KythiaUser.hasMany(UserPet, { foreignKey: 'userId', as: 'pets' });
            }
            if (UserPet && KythiaUser) {
                UserPet.belongsTo(KythiaUser, { foreignKey: 'userId', as: 'user' });
            }
            if (UserPet && Pet) {
                UserPet.belongsTo(Pet, { foreignKey: 'petId', as: 'pet' });
            }
        });

        return [' └─ Model associations registered.'];
    },
};