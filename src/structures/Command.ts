import {
	ApplicationCommandOptionData,
	ChatInputCommandInteraction,
	Message,
} from "discord.js";
import { Context } from "./Context";
import { Client } from "./Client";
import { Argument } from "./Argument";
import { currentClient } from "../context";
import { MaybePromise } from "#types/extra.js";
import { Logger } from "../utils/logger/Logger";

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
	private _supportsSlash: boolean;
	private _supportsPrefix: boolean;
	public _onMessage?: (
		ctx: NonNullable<ReturnType<Context<Message>["toJSON"]>>
	) => MaybePromise<void>;
	public _onInteraction?: (
		ctx: NonNullable<ReturnType<Context<ChatInputCommandInteraction>["toJSON"]>>
	) => MaybePromise<void>;

	public get supportsSlash() {
		return this._supportsSlash && this._onInteraction;
	}
	public get supportsPrefix() {
		return this._supportsPrefix && this._onMessage;
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
		this._supportsPrefix = options.prefix ?? false;
		this._supportsSlash = options.slash ?? false;

		if (!this._supportsPrefix && !this._supportsSlash) {
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

	onMessage(
		func: (
			ctx: NonNullable<ReturnType<Context<Message>["toJSON"]>>
		) => MaybePromise<void>
	) {
		this._onMessage = func;
		return this;
	}

	onInteraction(
		func: (
			ctx: NonNullable<
				ReturnType<Context<ChatInputCommandInteraction>["toJSON"]>
			>
		) => MaybePromise<void>
	) {
		this._onInteraction = func;
		return this;
	}
}
