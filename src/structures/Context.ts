import { Message, User, ChatInputCommandInteraction } from "discord.js";
import { Client } from "../structures/Client";

type ContextPayload<T extends ChatInputCommandInteraction | Message> =
	T extends ChatInputCommandInteraction
		? { interaction: T; args?: string[] }
		: { message: T; args?: string[] };

export class Context<T extends ChatInputCommandInteraction | Message> {
	public readonly client: Client;
	public readonly args: string[];
	public readonly data: T;

	constructor(client: Client, payload: ContextPayload<T>) {
		this.client = client;
		this.args = payload.args ?? [];

		if ("interaction" in payload) {
			this.data = payload.interaction as T;
		} else {
			this.data = payload.message as T;
		}
	}

	public isInteraction(): this is Context<ChatInputCommandInteraction> {
		return this.data instanceof ChatInputCommandInteraction;
	}

	public isMessage(): this is Context<Message> {
		return this.data instanceof Message;
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

	toJSON() {
		const { data, args, author } = this;

		if (this.isInteraction()) {
			return {
				kind: "interaction" as const,
				interaction: data,
				author: author,
			};
		}

		return {
			kind: "message" as const,
			message: data as Message,
			args: args,
			author: author,
		};
	}
}
