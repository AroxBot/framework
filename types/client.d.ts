import { ClientOptions } from "discord.js";
import { LoggerOptions } from "../src/utils/logger/Logger";

export interface FrameworkPaths {
	events?: string;
	commands?: string;
	locales?: string;
}

export type PrefixOptions =
	| { enabled: true; prefix: string }
	| { enabled: false }
	| string;

export interface I18nOptions {
	defaultLocale?: string;
}

export interface FrameworkOptions extends ClientOptions {
	logger?: LoggerOptions;
	prefix?: PrefixOptions;
	paths?: FrameworkPaths;
	autoRegisterCommands?: boolean;
	i18n?: I18nOptions;
}
