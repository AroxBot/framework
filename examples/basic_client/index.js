const i18next = require("i18next");
const arox = require("../../dist/index");
const backend = require("i18next-fs-backend");
const path = require("node:path");
const { LogLevel } = require("../../dist/utils/logger/ILogger");
const { IntentsBitField } = require("discord.js");

const myinstance = i18next.createInstance({
	supportedLngs: ["en-US", "tr"],
	fallbackLng: "en-US",
	defaultNS: "translation",
	ns: ["translation", "test", "error"],
	backend: {
		loadPath: path.join(__dirname, "locales/{{lng}}/{{ns}}.json"),
	},
	interpolation: {
		escapeValue: false,
	},
});
myinstance.use(backend);

const client = new arox.Client({
	intents: [
		IntentsBitField.Flags.Guilds,
		IntentsBitField.Flags.GuildMessages,
		IntentsBitField.Flags.MessageContent,
	],
	prefix: { enabled: true, prefix: "a!" },
	logger: {
		level: LogLevel.Trace,
	},
	autoRegisterCommands: false,
	i18n: myinstance,
});

arox.setClient(client);
const command = new arox.CommandBuilder(
	new arox.ApplicationCommandBuilder()
		.setName("arox")
		.setDescription("Arox Test Command")
		.addAliases("a")
);
arox.clearClient();

command
	.onMessage(function (ctx) {
		const { message, t, author } = ctx;
		void message.reply(
			t("test:hello", { user: author?.username ?? "Unknown" })
		);
	})
	.onInteraction(function (ctx) {
		const { interaction, t, author } = ctx;
		void interaction.reply(
			t("test:hello", { user: author?.username ?? "Unknown" })
		);
	});

async function init() {
	await client.login(process.env.BOT_TOKEN);
}
void init();
