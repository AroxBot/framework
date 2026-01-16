import { ApplicationCommandOptionData } from "discord.js";
import { Context } from "./Context";
import { Client } from "./Client";
import { Argument } from "./Argument";

export interface CommandOptions {
	name: string;
	description: string;
	aliases?: string[];
	options?: (ApplicationCommandOptionData | Argument)[];
	slash?: boolean; // Default true
	prefix?: boolean; // Default true (if user enabled prefix generally)
}

export abstract class Command {
	public readonly client: Client;
	public readonly name: string;
	public readonly description: string;
	public readonly aliases: string[];
	public readonly options: ApplicationCommandOptionData[];
	public readonly supportsSlash: boolean;
	public readonly supportsPrefix: boolean;

	constructor(client: Client, options: CommandOptions) {
		this.client = client;
		this.name = options.name;
		this.description = options.description;
		this.aliases = options.aliases ?? [];

		// Handle Argument instances or raw data
		this.options = (options.options ?? []).map((opt) => {
			if (opt instanceof Argument) {
				return opt.toJSON();
			}
			return opt;
		});

		this.supportsSlash = options.slash ?? true;
		this.supportsPrefix = options.prefix ?? true;
	}

	public abstract execute(ctx: Context): Promise<any>;
}
