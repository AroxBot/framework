import { ClientOptions } from "discord.js";
import { LoggerOptions } from "../src/utils/logger/Logger";

export interface FrameworkPaths {
	events?: string;
	commands?: string;
}

export type PrefixOptions =
	| { enabled: true; prefix: string }
	| { enabled: false }
	| string;

export interface FrameworkOptions extends ClientOptions {
	logger?: LoggerOptions;
	prefix?: PrefixOptions;
	paths?: FrameworkPaths;
	autoRegisterCommands?: boolean;
}
