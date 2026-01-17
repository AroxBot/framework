import {
	Client as DiscordClient,
	Collection,
	REST,
	Routes,
	IntentsBitField,
} from "discord.js";
import { LoggerInstance } from "../utils/Logger";
import { Command } from "./Command";
import path from "path";
import { getFiles, getProjectRoot } from "../utils/Files";
import { FrameworkOptions, PrefixOptions } from "#types/client.js";
import { merge } from "lodash";
import { setClient } from "../context";
import { getPrefix } from "../utils/util";

const defaultOpts: Omit<FrameworkOptions, "intents"> = {
	paths: {
		events: "events",
		commands: "commands",
	},
};

export class Client extends DiscordClient {
	public readonly logger: LoggerInstance;
	public commands: Collection<string, Command>;
	public aliases: Collection<string, Set<string>>;
	declare public options: Omit<FrameworkOptions, "intents"> & {
		intents: IntentsBitField;
	};

	constructor(opts: FrameworkOptions) {
		super(merge(defaultOpts, opts) as FrameworkOptions);
		this.logger = new LoggerInstance(this.options.logLevel ?? "log");
		this.commands = new Collection();
		this.aliases = new Collection();
		this.options.prefix = getPrefix(
			this.options.prefix ?? { enabled: false }
		) as PrefixOptions;

		if (this.options.paths?.events) {
			this.loadFiles(
				path.join(getProjectRoot(), this.options.paths?.events)
			).catch((error) => this.logger.error("Error loading events:", error));
		}

		setClient(this);
		require("../handler/interaction");
	}

	async loadFiles(dir: string) {
		const files = getFiles(dir);
		for (const file of files) {
			await this.loadFile(file);
		}
	}

	async loadFile(file: string) {
		try {
			delete require.cache[require.resolve(file)];
			setClient(this);

			await require(file);
		} catch (error) {
			this.logger.error(`Error loading file ${file}:`, error);
		}
	}

	public async registerCommands() {
		if (!this.token) {
			this.logger.warn("registerCommands skipped: client token is not set.");
			return;
		}
		if (!this.application) {
			this.logger.warn(
				"registerCommands skipped: client application is not ready."
			);
			return;
		}

		const slashCommands = this.commands
			.filter((cmd) => cmd.supportsSlash)
			.map((cmd) => ({
				name: cmd.name,
				description: cmd.description,
				options: cmd.options,
			}));

		const rest = new REST({ version: "10" }).setToken(this.token);

		try {
			this.logger.log(
				`Started refreshing ${slashCommands.length} application (/) commands.`
			);
			await rest.put(Routes.applicationCommands(this.application.id), {
				body: slashCommands,
			});
			this.logger.log(`Successfully reloaded application (/) commands.`);
		} catch (error) {
			this.logger.error("Failed to register commands:", error);
		}
	}
}
