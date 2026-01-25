import { Message, User, ChatInputCommandInteraction, Locale } from "discord.js";
import { Client } from "../structures/Client";

type ContextPayload<T extends ChatInputCommandInteraction | Message> =
	T extends ChatInputCommandInteraction
		? { interaction: T; args?: string[] }
		: { message: T; args?: string[] };

export class Context<T extends ChatInputCommandInteraction | Message> {
	public readonly args: string[];
	public readonly data: T;
	public locale: `${Locale}`;

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

	public isInteraction(): this is Context<ChatInputCommandInteraction> {
		return "user" in this.data;
	}

	public isMessage(): this is Context<Message> {
		return "author" in this.data;
	}

	public get author(): User | null {
		if (this.isInteraction()) {
			return this.data.user;
		}
		if (this.isMessage()) {
			return this.data.author;
		}
		return null;
	}

	public t(key: string, args?: Record<string, any>): string {
		if (!this.client.i18n) {
			throw new Error("i18n is not initalized");
		}
		let locale =
			this.locale ??
			(Array.isArray(this.client.i18n.options.fallbackLng)
				? this.client.i18n.options.fallbackLng[0]
				: this.client.i18n.options.fallbackLng);

		const t = this.client.i18n.getFixedT(locale);

		return t(key, args) as string;
	}

	public toJSON() {
		const { data, args, author, t } = this;

		if (this.isInteraction()) {
			return {
				kind: "interaction" as const,
				interaction: data,
				author,
				t: t.bind(this),
			};
		}

		return {
			kind: "message" as const,
			message: data as Message,
			args,
			author,
			t: t.bind(this),
		};
	}
}
