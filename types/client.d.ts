import {
	ChatInputCommandInteraction,
	ClientOptions,
	Locale,
	Message,
} from "discord.js";
import type { LoggerOptions } from "./logger.js";
import { i18n } from "i18next";
import type { Context } from "../src/structures/builder/Context.js";
import type { CommandBuilder } from "../src/structures/builder/Command.js";
import type { EventBuilder } from "../src/structures/builder/Event.js";
import type { Client } from "../src/structures/core/Client.js";

export type PrefixFn = (ctx: Context<Message>) => string | false;
export type TemplateContext = Context<ChatInputCommandInteraction | Message>;

export type GetDefaultLangFn = (
	ctx: TemplateContext
) => `${Locale}` | undefined;
export type TemplateParserFn = (
	key: string,
	context: TemplateContext
) => string | undefined | null;

export interface FrameworkOptions extends ClientOptions {
	logger?: LoggerOptions;
	prefix?: PrefixFn;
	getDefaultLang?: GetDefaultLangFn;
	autoRegisterCommands?: boolean;
	includePaths: string[];
	i18n?: i18n;
}

export type AttachableExport = {
	attach: (client: Client) => void | Promise<void>;
};

export type ModuleExport =
	| CommandBuilder
	| EventBuilder<keyof import("discord.js").ClientEvents>
	| AttachableExport
	| ModuleExportFactory
	| readonly ModuleExport[]
	| null
	| undefined;

/**
 * Factory function that produces module exports.
 * The implementation must handle nested factories with appropriate depth limiting.
 */
export type ModuleExportFactory = (
	client: Client
) => ModuleExport | Promise<ModuleExport>;
