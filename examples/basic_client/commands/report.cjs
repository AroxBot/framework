const {
	Command,
	ApplicationCommandBuilder,
} = require("../../../dist/index.cjs");

module.exports = new Command({
	data: new ApplicationCommandBuilder()
		.autoSet("report")
		.addSubcommand((sub) =>
			sub
				.autoSet("summary")
				.addUserOption((opt) => opt.autoSet("member"))
				.addNumberOption((num) => num.autoSet("days"))
		)
		.addSubcommandGroup((group) =>
			group.autoSet("admin").addSubcommand((sub) => sub.autoSet("reset"))
		),
	onInteraction: (ctx) => {
		const group = ctx.interaction.options.getSubcommandGroup(false);
		const subcommand = ctx.interaction.options.getSubcommand(false);

		if (group === "admin" && subcommand === "reset") {
			return ctx.interaction.reply(
				ctx.t("test:report_admin_reset", {
					user: ctx.interaction.user.username,
				})
			);
		}

		if (subcommand === "summary") {
			const memberOption = ctx.getDefaultLocalization(
				"command:report.subcommand.summary.user.member.name",
				"member"
			);
			const member = ctx.interaction.options.getUser(memberOption, false);
			const days = ctx.interaction.options.getNumber("days", false) ?? 7;
			return ctx.interaction.reply(
				ctx.t("test:report_summary", {
					user: ctx.interaction.user.username,
					member: member?.username ?? ctx.interaction.user.username,
					days,
				})
			);
		}

		return ctx.interaction.reply(
			ctx.t("test:report_ready", {
				user: ctx.interaction.user.username,
			})
		);
	},
	onMessage: (ctx) =>
		ctx.message.reply(
			ctx.t("test:report_prefix", { user: ctx.message.author.username })
		),
});
