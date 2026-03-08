import { ChatInputCommandInteraction, Locale, Message, User } from "discord.js";
import type { TOptions } from "i18next";
import type { Client } from "@structures/index.js";

type ContextPayload<T extends ChatInputCommandInteraction | Message> =
	T extends ChatInputCommandInteraction
		? { interaction: T; args?: string[] }
		: { message: T; args?: string[] };
type TranslateFn = (
	key: string,
	options?: TOptions & { defaultValue?: string }
) => string;
type DefaultLocalizationFn = (key: string, fallback?: string) => string;
type LocalizationAliasesFn = (
	key: string,
	fallback?: string | string[]
) => string[];

export interface InteractionContextJSON {
	kind: "interaction";
	interaction: ChatInputCommandInteraction;
	author: User | null;
	t: TranslateFn;
	getDefaultLocalization: DefaultLocalizationFn;
	getLocalizationAliases: LocalizationAliasesFn;
}

export interface MessageContextJSON {
	kind: "message";
	message: Message;
	args: string[];
	author: User | null;
	t: TranslateFn;
	getDefaultLocalization: DefaultLocalizationFn;
	getLocalizationAliases: LocalizationAliasesFn;
}

export class Context<T extends ChatInputCommandInteraction | Message> {
	readonly args: string[];
	readonly data: T;
	locale?: `${Locale}`;

	constructor(
		public readonly client: Client,
		payload: ContextPayload<T>
	) {
		this.args = payload.args ?? [];

		if ("interaction" in payload) {
			this.data = payload.interaction as T;
		} else {
			this.data = payload.message as T;
		}

		this.locale = this.client.options.getDefaultLang?.(
			this as Context<ChatInputCommandInteraction | Message>
		) as `${Locale}` | undefined;
	}

	#getFallbackLocale(): `${Locale}` {
		const fallbackLng = this.client.i18n!.options.fallbackLng;
		return ((Array.isArray(fallbackLng) ? fallbackLng[0] : fallbackLng) ??
			Locale.EnglishUS) as `${Locale}`;
	}

	#resolveLocale(): `${Locale}` {
		return (this.locale ??
			this.client.options.getDefaultLang?.(
				this as Context<ChatInputCommandInteraction | Message>
			) ??
			this.#getFallbackLocale()) as `${Locale}`;
	}

	#createTranslator() {
		return (key: string, options?: TOptions & { defaultValue?: string }) =>
			this.t(key, options);
	}

	#createDefaultLocalizationResolver() {
		return (key: string, fallback?: string) =>
			this.getDefaultLocalization(key, fallback);
	}

	#createLocalizationAliasesResolver() {
		return (key: string, fallback?: string | string[]) =>
			this.getLocalizationAliases(key, fallback);
	}

	#toAliasList(value: unknown): string[] {
		if (Array.isArray(value)) {
			return value
				.flatMap((item) => this.#toAliasList(item))
				.filter((item) => item.length > 0);
		}

		if (typeof value === "string") {
			return value
				.split(/[,\n|]/g)
				.map((item) => item.trim())
				.filter((item) => item.length > 0);
		}

		return [];
	}

	isInteraction(): this is Context<ChatInputCommandInteraction> {
		return this.data instanceof ChatInputCommandInteraction;
	}

	isMessage(): this is Context<Message> {
		return this.data instanceof Message;
	}

	get author(): User | null {
		if (this.isInteraction()) {
			return this.data.user;
		}
		if (this.isMessage()) {
			return this.data.author;
		}
		return null;
	}

	t(key: string, options?: TOptions & { defaultValue?: string }): string {
		if (!this.client.i18n) {
			throw new Error("i18n is not initialized");
		}

		const t = this.client.i18n.getFixedT(this.#resolveLocale());

		const result = t(key, options);

		if (result === key && options?.defaultValue) {
			return options.defaultValue;
		}

		return result;
	}

	getDefaultLocalization(key: string, fallback?: string): string {
		if (!this.client.i18n) return fallback ?? key;

		const fallbackResolved = this.client.i18n.t(key, {
			lng: this.#getFallbackLocale(),
			defaultValue: fallback ?? key,
		});
		return typeof fallbackResolved === "string"
			? fallbackResolved
			: (fallback ?? key);
	}

	getLocalizationAliases(
		key: string,
		fallback?: string | string[]
	): string[] {
		const fallbackList = this.#toAliasList(fallback ?? []);
		if (!this.client.i18n) return fallbackList;

		const locales = Array.from(
			new Set([this.#resolveLocale(), this.#getFallbackLocale()])
		);
		const aliases = new Set<string>();

		for (const locale of locales) {
			const value = this.client.i18n.t(key, {
				lng: locale,
				defaultValue: "",
				returnObjects: true,
			});
			for (const alias of this.#toAliasList(value)) {
				if (alias !== key) aliases.add(alias);
			}
		}

		if (aliases.size === 0) {
			for (const alias of fallbackList) aliases.add(alias);
		}

		return Array.from(aliases);
	}

	toJSON(this: Context<ChatInputCommandInteraction>): InteractionContextJSON;
	toJSON(this: Context<Message>): MessageContextJSON;
	toJSON(): InteractionContextJSON | MessageContextJSON {
		const { data, args, author } = this;
		const t = this.#createTranslator();
		const getDefaultLocalization = this.#createDefaultLocalizationResolver();
		const getLocalizationAliases = this.#createLocalizationAliasesResolver();

		if (this.isInteraction()) {
			return {
				kind: "interaction" as const,
				interaction: data as ChatInputCommandInteraction,
					author,
					t,
					getDefaultLocalization,
					getLocalizationAliases,
				};
		}

		return {
			kind: "message" as const,
			message: data as Message,
			args,
			author,
			t,
			getDefaultLocalization,
			getLocalizationAliases,
		};
	}
}
