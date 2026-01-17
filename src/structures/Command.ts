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
import { LoggerInstance } from "../utils/Logger";

export interface CommandOptions {
	name: string;
	description: string;
	aliases?: string[];
	options?: (ApplicationCommandOptionData | Argument)[];
}

export class CommandBuilder {
	public readonly client: Client;
	public readonly logger: LoggerInstance;

	public readonly name: string;
	public readonly description: string;
	public readonly aliases: string[];
	public readonly options: ApplicationCommandOptionData[];
	public _supportsSlash: boolean;
	public _supportsPrefix: boolean;
	_onMessage?: (
		ctx: NonNullable<ReturnType<Context<Message>["toJSON"]>>
	) => MaybePromise<void>;
	_onInteraction?: (
		ctx: NonNullable<ReturnType<Context<ChatInputCommandInteraction>["toJSON"]>>
	) => MaybePromise<void>;
	constructor(options: CommandOptions) {
		if (!currentClient) throw new Error("Client is not defined");
		this.client = currentClient;
		this.logger = currentClient.logger;

		this.name = options.name;
		this.description = options.description;
		this.aliases = options.aliases ?? [];

		this.options = (options.options ?? []).map((opt) => {
			return opt instanceof Argument ? opt.toJSON() : opt;
		});
		this._supportsPrefix = false;
		this._supportsSlash = false;

		if (this.client.commands.has(this.name))
			throw new Error(`Command ${this.name} already registered to framework`);
		this.client.commands.set(this.name, this);
		if (this.aliases.length > 0) {
			this.client.aliases.set(this.name, new Set(this.aliases));
		}
		this.logger.debug(`Loaded Command ${this.name}(${__filename})`);
	}

	onMessage(
		func: (
			ctx: NonNullable<ReturnType<Context<Message>["toJSON"]>>
		) => MaybePromise<void>
	) {
		this._supportsPrefix = true;
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
		this._supportsSlash = true;
		this._onInteraction = func;
		return this;
	}
}
