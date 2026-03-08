const {
	Command,
	ApplicationCommandBuilder,
} = require("../../../dist/index.cjs");

module.exports = new Command({
	data: new ApplicationCommandBuilder()
		.setName("ping")
		.setDescription("Replies with pong")
		.setAliases("p")
		.setPrefixSupport(true)
		.setSlashSupport(true),
	onMessage: (ctx) =>
		ctx.message.reply(
			ctx.t("test:hello", {
				user: ctx.message.author.username,
			})
		),
	onInteraction: (ctx) =>
		ctx.interaction.reply(
			ctx.t("test:hello", { user: ctx.interaction.user.username })
		),
});
