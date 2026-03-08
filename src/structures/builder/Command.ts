import { Client } from "@structures/index.js";
import { Logger } from "@utils/index.js";
import type { MaybePromise } from "#types/extra.js";
import { ApplicationCommandBuilder } from "@structures/builder/Builder.js";
import { Precondition } from "@structures/builder/Precondition.js";
import type { IPrecondition } from "#types/precondition.js";
import type {
	InteractionContextJSON,
	MessageContextJSON,
} from "@structures/builder/Context.js";

type MessageContext = MessageContextJSON;
type InteractionContext = InteractionContextJSON;
type CommandContext = MessageContext | InteractionContext;

export class CommandBuilder {
	readonly preconditions: Precondition[] = [];
	#client: Client | null = null;
	#logger: Logger | null = null;
	#supportsSlash: boolean;
	#supportsPrefix: boolean;
	#attached = false;
	_onMessage?: (ctx: MessageContext) => MaybePromise<void>;
	_onInteraction?: (ctx: InteractionContext) => MaybePromise<void>;

	protected createContextHandler<T extends CommandContext>(
		primary: ((ctx: T) => MaybePromise<void>) | undefined,
		fallback: ((ctx: CommandContext) => MaybePromise<void>) | undefined
	) {
		if (primary) {
			return (ctx: T) => primary(ctx);
		}
		if (fallback) {
			return (ctx: T) => fallback(ctx);
		}
		return undefined;
	}

	get client(): Client {
		if (!this.#client) throw new Error("Command is not attached to a client");
		return this.#client;
	}

	get logger(): Logger {
		if (!this.#logger) throw new Error("Command is not attached to a client");
		return this.#logger;
	}

	get supportsSlash() {
		return this.#supportsSlash && Boolean(this._onInteraction);
	}
	get supportsPrefix() {
		return this.#supportsPrefix && Boolean(this._onMessage);
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

	addPrecondition(precondition: IPrecondition) {
		this.preconditions.push(new Precondition(precondition));
		return this;
	}

	addPreconditions(...preconditions: IPrecondition[]) {
		for (const precondition of preconditions) {
			this.preconditions.push(new Precondition(precondition));
		}
		return this;
	}

	async checkPreconditions(ctx: CommandContext): Promise<Precondition | null> {
		for (const precondition of this.preconditions) {
			const passed = await precondition.check(ctx);
			if (!passed) return precondition;
		}
		return null;
	}

	attach(client: Client) {
		if (this.#attached) return this;
		const commandJSON = this.data.toJSON();
		const { name } = commandJSON;

		this.#client = client;
		this.#logger = client.logger;

		if (client.commands.has(name)) {
			throw new Error(`Command name "${name}" is already registered.`);
		}

		client.commands.set(name, this);
		client.invalidateCommandLookupCache();
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
		if (commandJSON.prefix_support) {
			const onMessage = this.createContextHandler(
				options.onMessage,
				options.execute
			);
			if (onMessage) this.onMessage(onMessage);
		}
		if (commandJSON.slash_support) {
			const onInteraction = this.createContextHandler(
				options.onInteraction,
				options.execute
			);
			if (onInteraction) this.onInteraction(onInteraction);
		}
	}
}
