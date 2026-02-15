const {
	CommandBuilder,
	ApplicationCommandBuilder,
} = require("../../../dist/index");

const command = new CommandBuilder(
	new ApplicationCommandBuilder()
		.addBooleanOption((opt) => opt.setName("ephemeral").setDescription("_"))
		.autoSet("commands", "ping")
		.addAliases("p")
);

command
	.onMessage(function (ctx) {
		const { message, args } = ctx;
		const isEphemeral = args[0] === "true";
		void message.reply(
			`Pong! (Prefix) ${isEphemeral ? "(Ephemeral mode)" : ""}`
		);
	})
	.onInteraction(function (ctx) {
		const { interaction } = ctx;
		const isEphemeral = interaction.options.getBoolean("ephemeral");
		void interaction.reply({
			content: `Pong! (Slash)`,
			ephemeral: !!isEphemeral,
		});
	});

module.exports = command;
