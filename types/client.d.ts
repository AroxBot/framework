import { ClientOptions } from "discord.js";
import type { LoggerOptions } from "./logger.js";
import { i18n } from "i18next";

export interface FrameworkPaths {
	events?: string;
	commands?: string;
	locales?: string;
}

export type PrefixOptions =
	| { enabled: true; prefix: string }
	| { enabled: false }
	| string;

export interface FrameworkOptions extends ClientOptions {
	logger?: LoggerOptions;
	prefix?: PrefixOptions;
	autoRegisterCommands?: boolean;
	includePaths: string[];
	i18n?: i18n;
}
