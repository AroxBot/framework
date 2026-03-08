const {
	Command,
	ApplicationCommandBuilder,
} = require("../../../dist/index.cjs");

module.exports = new Command({
	data: new ApplicationCommandBuilder()
		.autoSet("ban")
		.addUserOption((opt) => opt.autoSet("target"))
		.addSubcommand((sub) =>
			sub.autoSet("extra").addNumberOption((num) => num.autoSet("yup"))
		)
		.addSubcommandGroup((group) =>
			group.autoSet("admin").addSubcommand((sub) => sub.autoSet("reset"))
		),
	onInteraction: (ctx) =>
		ctx.interaction.reply(
			ctx.t("test:hello", { user: ctx.interaction.user.username })
		),
	onMessage: (ctx) =>
		ctx.message.reply(
			ctx.t("test:hello", { user: ctx.message.author.username })
		),
});
