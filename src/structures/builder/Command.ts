import {
	ApplicationCommandOptionData,
	ChatInputCommandInteraction,
	Message,
} from "discord.js";
import { Context, Client } from "#structures";
import { Argument } from "./Argument";
import { currentClient } from "#ctx";
import { MaybePromise } from "#types/extra.js";
import { Logger } from "#utils";

type MessageContext = NonNullable<ReturnType<Context<Message>["toJSON"]>>;
type InteractionContext = NonNullable<
	ReturnType<Context<ChatInputCommandInteraction>["toJSON"]>
>;

export interface CommandOptions {
	name: string;
	description: string;
	aliases?: string[];
	options?: (ApplicationCommandOptionData | Argument)[];
	slash?: boolean;
	prefix?: boolean;
}

export class CommandBuilder {
	public readonly client: Client;
	public readonly logger: Logger;

	public readonly name: string;
	public readonly description: string;
	public readonly aliases: string[];
	public readonly options: ApplicationCommandOptionData[];
	#supportsSlash: boolean;
	#supportsPrefix: boolean;
	_onMessage?: (ctx: MessageContext) => MaybePromise<void>;
	_onInteraction?: (ctx: InteractionContext) => MaybePromise<void>;

	get supportsSlash() {
		return this.#supportsSlash && this._onInteraction;
	}
	get supportsPrefix() {
		return this.#supportsPrefix && this._onMessage;
	}
	constructor(options: CommandOptions) {
		const client = currentClient;
		if (!client) throw new Error("Client is not defined");
		this.client = client;
		this.logger = client.logger;

		this.name = options.name;
		this.description = options.description;
		this.aliases = options.aliases ?? [];

		this.options = (options.options ?? []).map((opt) => {
			return opt instanceof Argument ? opt.toJSON() : opt;
		});
		this.#supportsPrefix = options.prefix ?? false;
		this.#supportsSlash = options.slash ?? false;

		if (!this.#supportsPrefix && !this.#supportsSlash) {
			throw new Error(
				`Command ${this.name} must support either slash or prefix commands.`
			);
		}

		if (this.client.commands.has(this.name))
			throw new Error(`Command name "${this.name}" is already registered.`);

		const existingAliasOwner = this.client.aliases.findKey((aliases) =>
			aliases.has(this.name)
		);
		if (existingAliasOwner) {
			throw new Error(
				`Command name "${this.name}" is already registered as an alias for command "${existingAliasOwner}".`
			);
		}

		for (const alias of this.aliases) {
			if (this.client.commands.has(alias)) {
				throw new Error(
					`Alias "${alias}" is already registered as a command name.`
				);
			}
			const conflictingCommand = this.client.aliases.findKey((aliases) =>
				aliases.has(alias)
			);
			if (conflictingCommand) {
				throw new Error(
					`Alias "${alias}" is already registered as an alias for command "${conflictingCommand}".`
				);
			}
		}

		this.client.commands.set(this.name, this);
		if (this.aliases.length > 0) {
			this.client.aliases.set(this.name, new Set(this.aliases));
		}
		this.logger.debug(`Loaded Command ${this.name}`);
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
