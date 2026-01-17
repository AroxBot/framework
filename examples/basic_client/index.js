const arox = require("../../dist/index");

const client = new arox.Client({ intents: 37376 });

new arox.Command(
	{ name: "arox", description: "Arox test command", slash: true, prefix: true },
	(interaction, message, args) => {
		if (interaction) {
		}
		if (message) {
		}
	}
);
client.login(process.env.BOT_TOKEN);
