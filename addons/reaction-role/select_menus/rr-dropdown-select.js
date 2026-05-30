/**
 * @namespace: addons/reaction-role/select_menus/rr-dropdown-select.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { MessageFlags } = require('discord.js');

module.exports = {
	execute: async (interaction, container) => {
		const { models, helpers, logger } = container;
		const { ReactionRolePanel, ReactionRole } = models;
		const { simpleContainer } = helpers.discord;

		// customId format: rr-dropdown-select:<panelId>
		const panelId = parseInt(interaction.customId.split(':')[1], 10);

		try {
			await interaction.deferReply({ flags: MessageFlags.Ephemeral });

			if (!panelId) {
				return interaction.editReply({
					components: await simpleContainer(
						interaction,
						'❌ Missing panel ID. Please contact an administrator.',
						{ color: 'Red' },
					),
					flags: MessageFlags.IsComponentsV2,
				});
			}

			const panel = await ReactionRolePanel.getCache({
				where: { id: panelId, guildId: interaction.guildId },
			});

			if (!panel || panel.panelType !== 'dropdown') {
				return interaction.editReply({
					components: await simpleContainer(
						interaction,
						'❌ This dropdown panel no longer exists or is misconfigured.',
						{ color: 'Red' },
					),
					flags: MessageFlags.IsComponentsV2,
				});
			}

			// ------ Whitelist / blacklist check ------
			const member = await interaction.guild.members
				.fetch(interaction.user.id)
				.catch(() => null);

			if (!member) {
				return interaction.editReply({
					components: await simpleContainer(
						interaction,
						'❌ Could not fetch your member info.',
						{ color: 'Red' },
					),
					flags: MessageFlags.IsComponentsV2,
				});
			}

			const memberRoleIds = member.roles.cache.map((r) => r.id);

			const blacklist = panel.blacklistRoles || [];
			if (
				blacklist.length > 0 &&
				memberRoleIds.some((id) => blacklist.includes(id))
			) {
				return interaction.editReply({
					components: await simpleContainer(
						interaction,
						'❌ You are not allowed to use this panel.',
						{ color: 'Red' },
					),
					flags: MessageFlags.IsComponentsV2,
				});
			}

			const whitelist = panel.whitelistRoles || [];
			if (
				whitelist.length > 0 &&
				!memberRoleIds.some((id) => whitelist.includes(id))
			) {
				return interaction.editReply({
					components: await simpleContainer(
						interaction,
						'❌ You do not have permission to use this panel.',
						{ color: 'Red' },
					),
					flags: MessageFlags.IsComponentsV2,
				});
			}

			// ------ Resolve selected role ------
			const roleId = interaction.values[0];
			if (!roleId) {
				return interaction.editReply({
					components: await simpleContainer(
						interaction,
						'❌ No role selected.',
						{ color: 'Red' },
					),
					flags: MessageFlags.IsComponentsV2,
				});
			}

			// Validate the binding still exists in DB
			const rr = await ReactionRole.getCache({
				where: {
					panelId: panel.id,
					roleId,
					guildId: interaction.guildId,
				},
			});

			if (!rr) {
				return interaction.editReply({
					components: await simpleContainer(
						interaction,
						'❌ That role binding no longer exists in this panel.',
						{ color: 'Red' },
					),
					flags: MessageFlags.IsComponentsV2,
				});
			}

			// ------ Toggle role ------
			const hasRole = memberRoleIds.includes(roleId);

			if (hasRole) {
				await member.roles.remove(roleId).catch((err) => {
					logger.warn(
						`Failed to remove role ${roleId} from ${interaction.user.id}: ${err.message}`,
						{ label: 'reactionRole:dropdown:removeRole' },
					);
				});
				return interaction.editReply({
					components: await simpleContainer(
						interaction,
						`✅ Removed <@&${roleId}> from your roles.`,
						{ color: 'Green' },
					),
					flags: MessageFlags.IsComponentsV2,
				});
			} else {
				await member.roles.add(roleId).catch((err) => {
					logger.warn(
						`Failed to add role ${roleId} to ${interaction.user.id}: ${err.message}`,
						{ label: 'reactionRole:dropdown:addRole' },
					);
				});
				return interaction.editReply({
					components: await simpleContainer(
						interaction,
						`✅ Added <@&${roleId}> to your roles.`,
						{ color: 'Green' },
					),
					flags: MessageFlags.IsComponentsV2,
				});
			}
		} catch (error) {
			logger.error(`Error: ${error.message || error}`, {
				label: 'reaction-role:rr-dropdown-select',
			});
			if (interaction.deferred || interaction.replied) {
				await interaction.editReply({
					components: await simpleContainer(
						interaction,
						'❌ An error occurred while processing your selection.',
						{ color: 'Red' },
					),
					flags: MessageFlags.IsComponentsV2,
				});
			}
		}
	},
};
