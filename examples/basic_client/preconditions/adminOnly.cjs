const { PermissionFlagsBits } = require("discord.js");

/** @type {import("../../../dist/index.cjs").IPrecondition} */
const adminOnly = {
	name: "adminOnly",
	errorMessage:
		"Bu komutu kullanmak için yönetici yetkisine sahip olmalısınız.",
	run: (ctx) => {
		const member =
			ctx.kind === "interaction" ? ctx.interaction.member : ctx.message.member;

		if (!member?.permissions) {
			return false;
		}

		const permissions = new PermissionsBitField(member.permissions);
		return permissions.has(PermissionFlagsBits.Administrator);
	},
};

module.exports = adminOnly;
