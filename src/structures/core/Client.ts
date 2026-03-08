import {
	Client as DiscordClient,
	Collection,
	IntentsBitField,
	REST,
	Routes,
} from "discord.js";
import { existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { i18n } from "i18next";
import type {
	AttachableExport,
	FrameworkOptions,
	ModuleExport,
	ModuleExportFactory,
	PrefixFn,
} from "#types/client.js";
import {
	getDefaultLang,
	getFiles,
	getProjectRoot,
	I18nLoggerAdapter,
	Logger,
} from "@utils/index.js";
import { MAX_EXPORT_FACTORY_DEPTH } from "@constants/exports.js";
import { CommandBuilder, EventBuilder } from "@structures/index.js";

const defaultOpts: Omit<FrameworkOptions, "intents"> = {
	includePaths: ["events", "commands"],
	autoRegisterCommands: true,
	getDefaultLang,
};
export class Client<
	Ready extends boolean = boolean,
> extends DiscordClient<Ready> {
	readonly logger: Logger;
	commands: Collection<string, CommandBuilder>;
	aliases: Collection<string, Set<string>>;
	readonly prefix: PrefixFn;
	i18n: i18n | undefined;

	declare options: Omit<FrameworkOptions, "intents"> & {
		intents: IntentsBitField;
	};

	constructor(opts: FrameworkOptions) {
		super({ ...defaultOpts, ...opts } as FrameworkOptions);
		this.logger = new Logger(opts.logger);
		this.commands = new Collection();
		this.aliases = new Collection();
		this.prefix = this.options.prefix ?? (() => false);
		if (this.options.i18n) {
			this.i18n = this.options.i18n;
			this.i18n.use(new I18nLoggerAdapter(this.logger));
		}
	}
	override async login(token?: string) {
		await this.#loadCoreEvents();
		for (const includePath of this.options.includePaths) {
			try {
				const resolvedDir = path.isAbsolute(includePath)
					? includePath
					: path.join(getProjectRoot(), includePath);
				await this.#loadDir(resolvedDir);
			} catch (error) {
				this.logger.error(`Error loading ${includePath}:`, error);
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
		const coreEventLoaders = [
			() => import("../../events/ready.js"),
			() => import("../../events/interaction.js"),
		] as const;
		for (const load of coreEventLoaders) {
			const mod = await load();
			await this.#registerModuleExports(mod, "[core]");
		}
		if (this.options.prefix) {
			const mod = await import("../../events/message.js");
			await this.#registerModuleExports(mod, "[core]");
		}
	}

	async #loadFile(file: string) {
		try {
			const resolvedFileUrl = pathToFileURL(file);
			resolvedFileUrl.searchParams.set("ts", Date.now().toString(36));
			const mod = await import(resolvedFileUrl.href);
			await this.#registerModuleExports(mod, file);
		} catch (error) {
			this.logger.error(`Error loading file ${file}:`, error);
		}
	}

	async #registerModuleExports<T extends object>(mod: T, source: string) {
		const unique = new Set<ModuleExport>();
		for (const value of Object.values(mod) as ModuleExport[]) {
			unique.add(value);
		}

		for (const value of unique) {
			await this.registerExport(value, source);
		}
	}

	async registerExport(
		exported: ModuleExport,
		source: string,
		factoryDepth: number = 0
	) {
		if (exported == null) return;

		if (Array.isArray(exported)) {
			for (const item of exported) {
				await this.registerExport(item, source, factoryDepth);
			}
			return;
		}

		if (exported instanceof CommandBuilder) {
			exported.attach(this);
			return;
		}

		if (exported instanceof EventBuilder) {
			exported.attach(this);
			return;
		}

		if (
			typeof exported === "object" &&
			"attach" in exported &&
			typeof (exported as Partial<AttachableExport>).attach === "function"
		) {
			await (exported as AttachableExport).attach(this);
			return;
		}

		if (typeof exported === "function") {
			if (factoryDepth >= MAX_EXPORT_FACTORY_DEPTH) {
				this.logger.error(
					`Skipped export factory in ${source}: max depth (${MAX_EXPORT_FACTORY_DEPTH}) exceeded.`
				);
				return;
			}
			const maybeBuilt = await (exported as ModuleExportFactory)(this);
			await this.registerExport(maybeBuilt, source, factoryDepth + 1);
			return;
		}

		this.logger.debug(
			`Skipped unsupported export type in ${source}: ${typeof exported}`
		);
	}

	private normalizeCommandName(name: string): string {
		return name.trim().toLowerCase();
	}

	public getSlashCommandsPayload() {
		return this.commands
			.filter((cmd) => cmd.supportsSlash)
			.map((cmd) => cmd.data.toClientJSON(this));
	}

	public resolveInteractionCommand(
		commandName: string
	): CommandBuilder | undefined {
		const normalizedName = this.normalizeCommandName(commandName);

		const direct =
			this.commands.get(normalizedName) ?? this.commands.get(commandName);
		if (direct?.supportsSlash) return direct;

		for (const command of this.commands.values()) {
			if (!command.supportsSlash) continue;

			const json = command.data.toClientJSON(this);
			const localizedNames = Object.values(
				json.name_localizations ?? {}
			).filter((name): name is string => typeof name === "string");
			const candidateNames = new Set<string>([json.name, ...localizedNames]);

			for (const candidateName of candidateNames) {
				if (this.normalizeCommandName(candidateName) === normalizedName) {
					return command;
				}
			}
		}

		return undefined;
	}

	public resolveMessageCommand(
		commandName: string
	): CommandBuilder | undefined {
		const normalizedName = this.normalizeCommandName(commandName);

		const direct =
			this.commands.get(normalizedName) ?? this.commands.get(commandName);
		if (direct?.supportsPrefix) return direct;

		const aliasOwner = this.aliases.findKey((aliases) => {
			for (const alias of aliases) {
				if (this.normalizeCommandName(alias) === normalizedName) {
					return true;
				}
			}
			return false;
		});
		if (aliasOwner) {
			const aliased = this.commands.get(aliasOwner);
			if (aliased?.supportsPrefix) return aliased;
		}

		for (const command of this.commands.values()) {
			if (!command.supportsPrefix) continue;

			const json = command.data.toClientJSON(this);
			const localizedNames = Object.values(
				json.name_localizations ?? {}
			).filter((name): name is string => typeof name === "string");
			const candidateNames = new Set<string>([
				command.data.toJSON().name,
				json.name,
				...localizedNames,
			]);

			for (const candidateName of candidateNames) {
				if (this.normalizeCommandName(candidateName) === normalizedName) {
					return command;
				}
			}
		}

		return undefined;
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

		const slashCommands = this.getSlashCommandsPayload();

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
