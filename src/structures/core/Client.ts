import {
	Client as DiscordClient,
	Collection,
	REST,
	Routes,
	IntentsBitField,
} from "discord.js";
import { CommandBuilder } from "#structures";
import path from "path";
import {
	getFiles,
	getProjectRoot,
	getPrefix,
	I18nLoggerAdapter,
	Logger,
} from "#utils";
import { FrameworkOptions } from "#types/client.js";
import { merge } from "lodash";
import { clearClient, setClient } from "#ctx";
import { i18n } from "i18next";
import { existsSync } from "fs";

const defaultOpts: Omit<FrameworkOptions, "intents"> = {
	includePaths: ["events", "commands"],
	autoRegisterCommands: true,
};

export class Client<
	Ready extends boolean = boolean,
> extends DiscordClient<Ready> {
	readonly logger: Logger;
	commands: Collection<string, CommandBuilder>;
	aliases: Collection<string, Set<string>>;
	readonly prefix: string | false;
	i18n: i18n | undefined;

	declare options: Omit<FrameworkOptions, "intents"> & {
		intents: IntentsBitField;
	};

	constructor(opts: FrameworkOptions) {
		super(merge({}, defaultOpts, opts) as FrameworkOptions);
		this.logger = new Logger(opts.logger);
		this.commands = new Collection();
		this.aliases = new Collection();
		this.prefix = getPrefix(this.options.prefix ?? { enabled: false });
		if (this.options.i18n) {
			this.i18n = this.options.i18n;
			this.i18n.use(new I18nLoggerAdapter(this.logger));
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
	override async login(token?: string) {
		if (this.options.includePaths) {
			for (const p of this.options.includePaths) {
				this.#loadDir(path.join(getProjectRoot(), p)).catch((error) =>
					this.logger.error("Error loading events:", error)
				);
			}
		}
		if (this.i18n && !this.i18n.isInitialized) {
			await this.i18n.init();
		}
		return super.login(token);
	}

	async #loadDir(dir: string) {
		if (!existsSync(dir)) {
			this.logger.debug(`Directory not found: ${dir}`);
			return;
		}
		const files = getFiles(dir);
		for (const file of files) {
			await this.#loadFile(file);
		}
	}

	async #loadFile(file: string) {
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
