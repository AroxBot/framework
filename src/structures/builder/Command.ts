import { ChatInputCommandInteraction, Message } from "discord.js";
import { Context, Client } from "../index.js";
import { currentClient } from "../../context.js";
import type { MaybePromise } from "#types/extra.js";
import { Logger } from "../../utils/index.js";
import { ApplicationCommandBuilder } from "./Builder.js";

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
		let commandJSON = data.toJSON();
		this.#supportsPrefix = commandJSON.prefix_support ?? false;
		this.#supportsSlash = commandJSON.slash_support ?? false;

		if (!this.#supportsPrefix && !this.#supportsSlash) {
			throw new Error(
				`Command ${data.name} must support either slash or prefix commands.`
			);
		}

		if (this.client.commands.has(data.name))
			throw new Error(`Command name "${data.name}" is already registered.`);

		const existingAliasOwner = this.client.aliases.findKey((aliases) =>
			aliases.has(data.name)
		);
		if (existingAliasOwner) {
			throw new Error(
				`Command name "${data.name}" is already registered as an alias for command "${existingAliasOwner}".`
			);
		}

		for (const alias of commandJSON.aliases) {
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

		this.client.commands.set(commandJSON.name, this);
		if (commandJSON.aliases.length > 0) {
			this.client.aliases.set(commandJSON.name, new Set(commandJSON.aliases));
		}
		this.logger.debug(`Loaded Command ${commandJSON.name}`);
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
