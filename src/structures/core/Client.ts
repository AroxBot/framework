import {
	Client as DiscordClient,
	Collection,
	REST,
	Routes,
	IntentsBitField,
} from "discord.js";
import { CommandBuilder } from "../index.js";
import path from "path";
import { pathToFileURL } from "node:url";
import {
	getFiles,
	getProjectRoot,
	getPrefix,
	I18nLoggerAdapter,
	Logger,
} from "../../utils/index.js";
import type { FrameworkOptions } from "#types/client.js";
import { clearClient, setClient } from "../../context.js";
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
		super({ ...defaultOpts, ...opts } as FrameworkOptions);
		this.logger = new Logger(opts.logger);
		this.commands = new Collection();
		this.aliases = new Collection();
		this.prefix = getPrefix(this.options.prefix ?? { enabled: false });
		if (this.options.i18n) {
			this.i18n = this.options.i18n;
			this.i18n.use(new I18nLoggerAdapter(this.logger));
		}
	}
	override async login(token?: string) {
		await this.#loadCoreEvents();
		if (this.options.includePaths) {
			for (const p of this.options.includePaths) {
				await this.#loadDir(path.join(getProjectRoot(), p)).catch((error) =>
					this.logger.error(`Error loading ${p}:`, error)
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

	async #loadCoreEvents() {
		setClient(this);
		try {
			await import("../../events/ready.js");
			await import("../../events/interaction.js");
			if (this.prefix) {
				await import("../../events/message.js");
			}
		} finally {
			clearClient();
		}
	}

	async #loadFile(file: string) {
		try {
			setClient(this);
			const resolvedFileUrl = pathToFileURL(file);
			resolvedFileUrl.searchParams.set("ts", Date.now().toString(36));
			await import(resolvedFileUrl.href);
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
			.map((cmd) => cmd.data.toClientJSON(this));

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
