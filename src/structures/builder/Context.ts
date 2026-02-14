import { Message, User, ChatInputCommandInteraction, Locale } from "discord.js";
import { Client } from "../index";
import { TOptions } from "i18next";

type ContextPayload<T extends ChatInputCommandInteraction | Message> =
	T extends ChatInputCommandInteraction
		? { interaction: T; args?: string[] }
		: { message: T; args?: string[] };

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
			(Array.isArray(this.client.i18n.options.fallbackLng)
				? this.client.i18n.options.fallbackLng[0]
				: this.client.i18n.options.fallbackLng) ??
			"en";

		const t = this.client.i18n.getFixedT(locale);

		const result = t(key, options);

		if (result === key && options?.defaultValue) {
			return options.defaultValue;
		}

		return result;
	}

	toJSON() {
		const { data, args, author } = this;

		if (this.isInteraction()) {
			return {
				kind: "interaction" as const,
				interaction: data,
				author,
				t: this.t.bind(this),
			};
		}

		return {
			kind: "message" as const,
			message: data as Message,
			args,
			author,
			t: (this as Context<Message>).t.bind(this),
		};
	}
}
