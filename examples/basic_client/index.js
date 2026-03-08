import { IntentsBitField } from "discord.js";
import i18next from "i18next";
import backend from "i18next-fs-backend";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as arox from "../../dist/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const myinstance = i18next.createInstance({
	supportedLngs: ["en-US", "tr"], // Required to be `${Locale}` (LocaleString)
	preload: ["en-US", "tr"], // Ensure command localizations are generated from all locales
	fallbackLng: "en-US",
	defaultNS: "translation",
	ns: ["translation", "test", "error", "command"],
	backend: {
		loadPath: path.join(__dirname, "locales/{{lng}}/{{ns}}.json"),
	},
	interpolation: {
		escapeValue: false,
	},
});
myinstance.use(backend);

const client = new arox.Client({
	autoRegisterCommands: true,
	intents: [
		IntentsBitField.Flags.Guilds,
		IntentsBitField.Flags.GuildMessages,
		IntentsBitField.Flags.MessageContent,
	],
	prefix: () => "a!",
	includePaths: [
		path.join(__dirname, "events"),
		path.join(__dirname, "commands"),
	],
	logger: {
		level: arox.LogLevel.Debug,
	},
	i18n: myinstance,
});

async function init() {
	const token = process.env.DISCORD_TOKEN ?? process.env.BOT_TOKEN;
	await client.login(token);
}
void init();
