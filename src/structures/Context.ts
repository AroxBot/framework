import {
	Message,
	Guild,
	User,
	TextBasedChannel,
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
	public readonly args: string[] = [];

	constructor(
		client: Client,
		data: {
			interaction?: CommandInteraction;
			message?: Message;
			args?: string[];
		}
	) {
		this.client = client;
		this.interaction = data.interaction;
		this.message = data.message;
		if (data.args) this.args = data.args;
	}

	public get author(): User {
		return this.interaction?.user ?? this.message!.author;
	}

	public get guild(): Guild | null {
		return this.interaction?.guild ?? this.message!.guild;
	}

	public get channel(): TextBasedChannel | null {
		return (this.interaction?.channel ??
			this.message?.channel) as TextBasedChannel;
	}

	public async reply(options: ReplyOptions): Promise<any> {
		if (this.interaction) {
			if (this.interaction.replied || this.interaction.deferred) {
				return this.interaction.followUp(options as InteractionReplyOptions);
			}
			return this.interaction.reply(options as InteractionReplyOptions);
		}
		return this.message!.reply(options as MessageReplyOptions);
	}

	public async send(options: ReplyOptions): Promise<Message | undefined> {
		const channel = this.channel as any;
		return channel?.send(options);
	}
}
