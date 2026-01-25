const i18next = require("i18next");
const arox = require("../../dist/index");
const backend = require("i18next-fs-backend");
const path = require("node:path");
const { LogLevel } = require("../../dist/utils/logger/ILogger");

const myinstance = i18next.createInstance({
	supportedLngs: ["en-US", "tr"],
	fallbackLng: "en-US",
	defaultNS: "translation",
	ns: ["translation", "test"],
	backend: {
		loadPath: path.join(__dirname, "locales/{{lng}}/{{ns}}.json"),
	},
});
myinstance.use(backend);

const client = new arox.Client({
	intents: 37376,
	prefix: { enabled: true, prefix: "a!" },
	logger: {
		level: LogLevel.Trace,
	},
	autoRegisterCommands: false,
	i18n: myinstance,
	interpolation: {
		escapeValue: false,
	},
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
		const { message, t, author } = ctx;
		void message.reply(t("test:hello", { user: author.username }));
	})
	.onInteraction(function (ctx) {
		const { interaction, t, author } = ctx;
		void interaction.reply(t("test:hello", { user: author.username }));
	});

async function init() {
	await client.login(process.env.BOT_TOKEN);
}
void init();
