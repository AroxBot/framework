const { PermissionFlagsBits } = require("discord.js");

/** @type {import("../../../dist/index.cjs").IPrecondition} */
const adminOnly = {
	name: "adminOnly",
	errorMessage: "Bu komutu kullanmak için yönetici yetkisine sahip olmalısınız.",
	run: (ctx) => {
		const member =
			ctx.kind === "interaction"
				? ctx.interaction.member
				: ctx.message.member;

		if (!member) return false;

		const permissions =
			typeof member.permissions === "string"
				? BigInt(member.permissions)
				: member.permissions?.bitfield;

		if (!permissions) return false;

		return (
			(BigInt(permissions) & PermissionFlagsBits.Administrator) ===
			PermissionFlagsBits.Administrator
		);
	},
};

module.exports = adminOnly;
