import {
	Message,
	Guild,
	User,
	InteractionReplyOptions,
	MessageReplyOptions,
	CommandInteraction,
} from "discord.js";
import { Client } from "./Client";

export type ReplyOptions =
	| string
	| MessageReplyOptions
	| InteractionReplyOptions;

export class Context {
	public readonly client: Client;
	public readonly interaction?: CommandInteraction;
	public readonly message?: Message;
	public readonly args: string[];

	constructor(
		client: Client,
		data:
			| { interaction: CommandInteraction; message?: never; args?: string[] }
			| { message: Message; interaction?: never; args?: string[] }
	) {
		if (!data.interaction && !data.message) {
			throw new Error("Context requires either interaction or message");
		}
		this.client = client;
		this.interaction = data.interaction;
		this.message = data.message;
		this.args = data.args ?? [];
	}

	public get author(): User | null {
		return this.interaction?.user ?? this.message?.author ?? null;
	}

	public get guild(): Guild | null {
		return this.interaction?.guild ?? this.message?.guild ?? null;
	}

	public get channel() {
		return this.interaction?.channel ?? this.message?.channel;
	}
}
