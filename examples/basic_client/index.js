import { IntentsBitField } from "discord.js";
import i18next from "i18next";
import backend from "i18next-fs-backend";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as arox from "../../dist/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
		level: arox.LogLevel.Debug,
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
	const token = process.env.DISCORD_TOKEN ?? process.env.BOT_TOKEN;
	await client.login(token);
}
void init();
