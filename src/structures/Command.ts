import { ApplicationCommandOptionData } from "discord.js";
import { Context } from "./Context";
import { Client } from "./Client";
import { Argument } from "./Argument";
import { CommandOptions } from "../types";

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

	public toJSON(): any {
		return {
			name: this.name,
			description: this.description,
			type: 1, // ChatInput
			options: this.options,
		};
	}

	public abstract execute(ctx: Context): Promise<any>;
}
