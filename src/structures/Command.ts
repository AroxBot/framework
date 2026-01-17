import { ApplicationCommandOptionData } from "discord.js";
import { Context } from "./Context";
import { Client } from "./Client";
import { Argument } from "./Argument";
import { currentClient } from "../context";
import { MaybePromise } from "#types/extra.js";

export interface CommandOptions {
	name: string;
	description: string;
	aliases?: string[];
	options?: (ApplicationCommandOptionData | Argument)[];
	slash?: boolean;
	prefix?: boolean;
}

export abstract class Command {
	public readonly client: Client;

	public readonly name: string;
	public readonly description: string;
	public readonly aliases: string[];
	public readonly options: ApplicationCommandOptionData[];
	public readonly supportsSlash: boolean;
	public readonly supportsPrefix: boolean;

	constructor(
		options: CommandOptions,
		public readonly execute: (ctx: Context) => MaybePromise<void>
	) {
		if (!currentClient) throw new Error("Client is not defined");

		this.client = currentClient;

		this.name = options.name;
		this.description = options.description;
		this.aliases = options.aliases ?? [];

		this.options = (options.options ?? []).map((opt) => {
			return opt instanceof Argument ? opt.toJSON() : opt;
		});

		this.supportsSlash = options.slash ?? false;
		this.supportsPrefix = options.prefix ?? false;

		process.nextTick(() => {
			if (this.client.commands.has(this.name))
				throw new Error(`Command ${this.name} already registered to framework`);
			this.client.commands.set(this.name, this);

			this.client.aliases.set(this.name, new Set(this.aliases));
		});
	}
}
