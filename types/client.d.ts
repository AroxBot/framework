import { ClientOptions } from "discord.js";
import { LogLevel } from "./logger";

export interface FrameworkPaths {
	events?: string;
	commands?: string;
}

export type PrefixOptions =
	| { enabled: true; prefix: string }
	| { enabled: false }
	| string;

export interface FrameworkOptions extends ClientOptions {
	logLevel?: LogLevel;
	prefix?: PrefixOptions;
	paths?: FrameworkPaths;
	autoRegiserCommands?: boolean;
}
