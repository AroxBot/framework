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

export interface InteractionContextJSON {
	kind: "interaction";
	interaction: ChatInputCommandInteraction;
	author: User | null;
	t: TranslateFn;
}

export interface MessageContextJSON {
	kind: "message";
	message: Message;
	args: string[];
	author: User | null;
	t: TranslateFn;
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

		const locale =
			this.locale ??
			this.client.options.getDefaultLang?.(
				this as Context<ChatInputCommandInteraction | Message>
			) ??
			(Array.isArray(this.client.i18n.options.fallbackLng)
				? this.client.i18n.options.fallbackLng[0]
				: this.client.i18n.options.fallbackLng) ??
			Locale.EnglishUS;

		const t = this.client.i18n.getFixedT(locale);

		const result = t(key, options);

		if (result === key && options?.defaultValue) {
			return options.defaultValue;
		}

		return result;
	}

	toJSON(this: Context<ChatInputCommandInteraction>): InteractionContextJSON;
	toJSON(this: Context<Message>): MessageContextJSON;
	toJSON(): InteractionContextJSON | MessageContextJSON {
		const { data, args, author } = this;

		if (this.isInteraction()) {
			return {
				kind: "interaction" as const,
				interaction: data as ChatInputCommandInteraction,
				author,
				t: (key, options) => this.t(key, options),
			};
		}

		return {
			kind: "message" as const,
			message: data as Message,
			args,
			author,
			t: (key, options) => this.t(key, options),
		};
	}
}
