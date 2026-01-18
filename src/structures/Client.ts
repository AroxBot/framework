import {
	Client as DiscordClient,
	Collection,
	REST,
	Routes,
	IntentsBitField,
} from "discord.js";
import { CommandBuilder } from "./Command";
import path from "path";
import { getFiles, getProjectRoot } from "../utils/Files";
import { FrameworkOptions } from "#types/client.js";
import { merge } from "lodash";
import { clearClient, setClient } from "../context";
import { getPrefix } from "../utils/util";
import { Logger } from "../utils/logger/Logger";

const defaultOpts: Omit<FrameworkOptions, "intents"> = {
	paths: {
		events: "events",
		commands: "commands",
	},
	autoRegisterCommands: true,
};

export class Client<
	Ready extends boolean = boolean,
> extends DiscordClient<Ready> {
	public readonly logger: Logger;
	public commands: Collection<string, CommandBuilder>;
	public aliases: Collection<string, Set<string>>;
	public readonly prefix: string | false;

	declare public options: Omit<FrameworkOptions, "intents"> & {
		intents: IntentsBitField;
	};

	constructor(opts: FrameworkOptions) {
		super(merge({}, defaultOpts, opts) as FrameworkOptions);
		this.logger = new Logger(opts.logger);
		this.commands = new Collection();
		this.aliases = new Collection();
		this.prefix = getPrefix(this.options.prefix ?? { enabled: false });

		if (this.options.paths?.events) {
			this.loadFiles(
				path.join(getProjectRoot(), this.options.paths?.events)
			).catch((error) => this.logger.error("Error loading events:", error));
		}

		setClient(this);
		try {
			require("../events/ready");
			require("../events/interaction");
			if (this.prefix) require("../events/message");
		} finally {
			clearClient();
		}
	}

	async loadFiles(dir: string) {
		if (!require("fs").existsSync(dir)) {
			this.logger.warn(`Directory not found: ${dir}`);
			return;
		}
		const files = getFiles(dir);
		for (const file of files) {
			await this.loadFile(file);
		}
	}

	async loadFile(file: string) {
		try {
			delete require.cache[require.resolve(file)];
			setClient(this);
			require(file);
		} catch (error) {
			this.logger.error(`Error loading file ${file}:`, error);
		} finally {
			clearClient();
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
			this.logger.debug(
				`Started refreshing ${slashCommands.length} application (/) commands.`
			);
			await rest.put(Routes.applicationCommands(this.application.id), {
				body: slashCommands,
			});
			this.logger.info(
				`Loaded ${slashCommands.length} application (/) commands.`
			);
		} catch (error) {
			this.logger.error("Failed to register commands:", error);
		}
	}
}
