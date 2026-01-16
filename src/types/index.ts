import { ApplicationCommandOptionData, ClientOptions } from "discord.js";
import { LogLevel } from "../utils/Logger";
import { Argument } from "../structures/Argument";

export interface ClientOptionsWithFramework extends ClientOptions {
	logLevel?: LogLevel;
	prefix?: string;
	token?: string;
}

export interface CommandOptions {
	name: string;
	description: string;
	aliases?: string[];
	options?: (ApplicationCommandOptionData | Argument)[];
	slash?: boolean;
	prefix?: boolean;
}
