const {
	Command,
	ApplicationCommandBuilder,
	MessageCommandParser,
	sanitizeDiscordText,
} = require("../../../dist/index.cjs");

const safeReply = (content) => ({
	content,
	allowedMentions: { parse: [] },
});

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
			return ctx.interaction.reply(safeReply(ctx.t("test:report_admin_reset")));
		}

		if (subcommand === "summary") {
			const member = ctx.interaction.options.getUser("member", false);
			const days = ctx.interaction.options.getNumber("days", false) ?? 7;
			return ctx.interaction.reply(
				safeReply(
					ctx.t("test:report_summary", {
						member: sanitizeDiscordText(
							member?.username ?? ctx.interaction.user.username
						),
						days,
					})
				)
			);
		}

		return ctx.interaction.reply(safeReply(ctx.t("test:report_ready")));
	},
	onMessage: (ctx) => {
		const parser = new MessageCommandParser(ctx);
		const first = ctx.args[0];
		if (!first) {
			return ctx.message.reply(safeReply(ctx.t("test:report_prefix")));
		}

		const summaryMatch = parser.matchesArg(
			0,
			"command:report.subcommand.summary.alias",
			["summary"],
			{ useFuzzy: true, maxDistance: 1 }
		);
		const adminMatch = parser.matchesArg(
			0,
			"command:report.group.admin.alias",
			["admin"],
			{ useFuzzy: true, maxDistance: 1 }
		);
		const resetMatch = parser.matchesArg(
			1,
			"command:report.group.admin.subcommand.reset.alias",
			["reset"],
			{ useFuzzy: true, maxDistance: 1 }
		);

		if (summaryMatch) {
			const days = parser.parseIntegerOption({
				key: "command:report.subcommand.summary.number.days.alias",
				fallbackAliases: ["days"],
				defaultValue: 7,
				startIndex: 0,
				useFuzzy: true,
				maxDistance: 1,
			});

			return ctx.message.reply(
				safeReply(
					ctx.t("test:report_summary", {
						member: sanitizeDiscordText(ctx.message.author.username),
						days,
					})
				)
			);
		}

		if (adminMatch && resetMatch) {
			return ctx.message.reply(safeReply(ctx.t("test:report_admin_reset")));
		}

		return ctx.message.reply(safeReply(ctx.t("test:report_prefix")));
	},
	preconditions: [require("../preconditions/error.cjs")],
});
