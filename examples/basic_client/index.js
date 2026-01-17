const arox = require("../../dist/index");

const client = new arox.Client({
	intents: 37376,
	prefix: { enabled: true, prefix: "a!" },
	logLevel: "debug",
});

const command = new arox.CommandBuilder({
	name: "arox",
	description: "Arox test command",
	slash: true,
	prefix: true,
});

command
	.onMessage(function (ctx) {
		const { message } = ctx;
		message.reply("Çalışıyom ulan şurda rahat bırak beni");
	})
	.onInteraction(function (ctx) {
		const { interaction } = ctx;
		interaction.reply("Çalışıyom ulan şurda rahat bırak beni");
	});

client.login(process.env.BOT_TOKEN);
