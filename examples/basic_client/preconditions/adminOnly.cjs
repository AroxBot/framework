const { PermissionFlagsBits } = require("discord.js");

/** @type {import("../../../dist/index.cjs").IPrecondition} */
const adminOnly = {
	name: "adminOnly",
	run: (ctx) => {
		const member = ctx.data.member;

		if (!member?.permissions) {
			return [
				false,
				{
					reason: "missing_member_permissions",
					defaultValue: "Precondition blocked: {{reason}}",
				},
			];
		}

		if (!member.permissions.has(PermissionFlagsBits.Administrator)) {
			return [false];
		}

		return [true];
	},
};

module.exports = adminOnly;
