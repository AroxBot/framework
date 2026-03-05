import { ChatInputCommandInteraction, Message } from "discord.js";
import { currentClient } from "@context";
import { Context, Client } from "@structures/index.js";
import { Logger } from "@utils/index.js";
import type { MaybePromise } from "#types/extra.js";
import { ApplicationCommandBuilder } from "@structures/builder/Builder.js";

type MessageContext = NonNullable<ReturnType<Context<Message>["toJSON"]>>;
type InteractionContext = NonNullable<
	ReturnType<Context<ChatInputCommandInteraction>["toJSON"]>
>;

export class CommandBuilder {
	public readonly client: Client;
	public readonly logger: Logger;
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

	constructor(public readonly data: ApplicationCommandBuilder) {
		const client = currentClient;
		if (!client) throw new Error("Client is not defined");
		this.client = client;
		this.logger = client.logger;
		const commandJSON = data.toJSON();
		const { name, aliases } = commandJSON;
		this.#supportsPrefix = commandJSON.prefix_support ?? false;
		this.#supportsSlash = commandJSON.slash_support ?? false;

		if (!this.#supportsPrefix && !this.#supportsSlash) {
			throw new Error(
				`Command ${name} must support either slash or prefix commands.`
			);
		}

		if (this.client.commands.has(name)) {
			throw new Error(`Command name "${name}" is already registered.`);
		}

		const existingAliasOwner = this.client.aliases.findKey((aliases) =>
			aliases.has(name)
		);
		if (existingAliasOwner) {
			throw new Error(
				`Command name "${name}" is already registered as an alias for command "${existingAliasOwner}".`
			);
		}

		for (const alias of aliases) {
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

		this.client.commands.set(name, this);
		if (aliases.length > 0) {
			this.client.aliases.set(name, new Set(aliases));
		}
		this.logger.debug(`Loaded Command ${name}`);
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
