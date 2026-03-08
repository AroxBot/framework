import { Client } from "@structures/index.js";
import { Logger } from "@utils/index.js";
import type { MaybePromise } from "#types/extra.js";
import { ApplicationCommandBuilder } from "@structures/builder/Builder.js";
import type {
	InteractionContextJSON,
	MessageContextJSON,
} from "@structures/builder/Context.js";

type MessageContext = MessageContextJSON;
type InteractionContext = InteractionContextJSON;
type CommandContext = MessageContext | InteractionContext;

export class CommandBuilder {
	#client: Client | null = null;
	#logger: Logger | null = null;
	#supportsSlash: boolean;
	#supportsPrefix: boolean;
	#attached = false;
	_onMessage?: (ctx: MessageContext) => MaybePromise<void>;
	_onInteraction?: (ctx: InteractionContext) => MaybePromise<void>;

	get client(): Client {
		if (!this.#client) throw new Error("Command is not attached to a client");
		return this.#client;
	}

	get logger(): Logger {
		if (!this.#logger) throw new Error("Command is not attached to a client");
		return this.#logger;
	}

	get supportsSlash() {
		return this.#supportsSlash && this._onInteraction;
	}
	get supportsPrefix() {
		return this.#supportsPrefix && this._onMessage;
	}

	constructor(public readonly data: ApplicationCommandBuilder) {
		const commandJSON = data.toJSON();
		const { name } = commandJSON;
		this.#supportsPrefix = commandJSON.prefix_support ?? false;
		this.#supportsSlash = commandJSON.slash_support ?? false;

		if (!this.#supportsPrefix && !this.#supportsSlash) {
			throw new Error(
				`Command ${name} must support either slash or prefix commands.`
			);
		}
	}

	attach(client: Client) {
		if (this.#attached) return this;
		const commandJSON = this.data.toJSON();
		const { name, aliases } = commandJSON;

		this.#client = client;
		this.#logger = client.logger;

		if (client.commands.has(name)) {
			throw new Error(`Command name "${name}" is already registered.`);
		}

		const existingAliasOwner = client.aliases.findKey((aliases) =>
			aliases.has(name)
		);
		if (existingAliasOwner) {
			throw new Error(
				`Command name "${name}" is already registered as an alias for command "${existingAliasOwner}".`
			);
		}

		for (const alias of aliases) {
			if (client.commands.has(alias)) {
				throw new Error(
					`Alias "${alias}" is already registered as a command name.`
				);
			}
			const conflictingCommand = client.aliases.findKey((aliases) =>
				aliases.has(alias)
			);
			if (conflictingCommand) {
				throw new Error(
					`Alias "${alias}" is already registered as an alias for command "${conflictingCommand}".`
				);
			}
		}

		client.commands.set(name, this);
		if (aliases.length > 0) {
			client.aliases.set(name, new Set(aliases));
		}
		this.logger.debug(`Loaded Command ${name}`);
		this.#attached = true;
		return this;
	}

	onMessage(func: (ctx: MessageContext) => MaybePromise<void>) {
		this._onMessage = func;
		return this;
	}

	onInteraction(func: (ctx: InteractionContext) => MaybePromise<void>) {
		this._onInteraction = func;
		return this;
	}
}

export interface CommandOptions {
	data: ApplicationCommandBuilder;
	execute?: (ctx: CommandContext) => MaybePromise<void>;
	onMessage?: (ctx: MessageContext) => MaybePromise<void>;
	onInteraction?: (ctx: InteractionContext) => MaybePromise<void>;
}

export class Command extends CommandBuilder {
	constructor(options: CommandOptions) {
		super(options.data);
		const commandJSON = options.data.toJSON();
		const execute = options.execute;
		if (
			(commandJSON.prefix_support ?? false) &&
			(options.onMessage || execute)
		) {
			this.onMessage((ctx) => {
				if (options.onMessage) return options.onMessage(ctx);
				return execute?.(ctx);
			});
		}
		if (
			(commandJSON.slash_support ?? false) &&
			(options.onInteraction || execute)
		) {
			this.onInteraction((ctx) => {
				if (options.onInteraction) return options.onInteraction(ctx);
				return execute?.(ctx);
			});
		}
	}
}
