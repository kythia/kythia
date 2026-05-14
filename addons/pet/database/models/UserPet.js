/**
 * @namespace: addons/pet/database/models/UserPet.js
 * @type: Database Model
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */

const { KythiaModel } = require('kythia-core');

class UserPet extends KythiaModel {
	static cacheKeys = [['userId']];
	static customInvalidationTags = ['UserPet:leaderboard'];
	static guarded = [];

	static get structure() {
		return {
			options: { timestamps: false },
		};
	}

	static associate(models) {
		this.belongsTo(models.KythiaUser, {
			foreignKey: 'userId',
			as: 'user',
		});

		this.belongsTo(models.Pet, {
			foreignKey: 'petId',
			as: 'pet',
		});
	}
}

module.exports = UserPet;
