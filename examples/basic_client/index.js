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
	ns: ["translation", "test", "error", "commands"],
	backend: {
		loadPath: path.join(__dirname, "locales/{{lng}}/{{ns}}.json"),
	},
	interpolation: {
		escapeValue: false,
	},
	preload: ["en-US", "tr"],
});
myinstance.use(backend);

const client = new arox.Client({
	intents: [
		IntentsBitField.Flags.Guilds,
		IntentsBitField.Flags.GuildMessages,
		IntentsBitField.Flags.MessageContent,
	],
	prefix: { enabled: true, prefix: "a!" },
	includePaths: ["events", "commands"],
	logger: {
		level: LogLevel.Trace,
		depth: 5,
	},
	autoRegisterCommands: true,
	i18n: myinstance,
});

async function init() {
	await myinstance.init();

	await client.login(process.env.BOT_TOKEN);
}
void init();
