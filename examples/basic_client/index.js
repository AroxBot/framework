const arox = require("../../dist/index");

const client = new arox.Client({
	intents: 37376,
	prefix: { enabled: true, prefix: "a!" },
	logger: {
		depth: 0,
	},
	autoRegisterCommands: false,
});

arox.setClient(client);
const command = new arox.CommandBuilder({
	name: "arox",
	description: "Arox test command",
	slash: true,
	prefix: true,
});
arox.clearClient();

command
	.onMessage(function (ctx) {
		const { message } = ctx;
		void message.reply("Çalışıyom ulan şurda rahat bırak beni");
	})
	.onInteraction(function (ctx) {
		const { interaction } = ctx;
		void interaction.reply("Çalışıyom ulan şurda rahat bırak beni");
	});

async function init() {
	await client.login(process.env.BOT_TOKEN);
}
void init();
