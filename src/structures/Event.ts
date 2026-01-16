import { ClientEvents } from "discord.js";
import { Client } from "./Client";

export abstract class Event<K extends keyof ClientEvents> {
	public readonly client: Client;
	public readonly name: K;
	public readonly once: boolean;

	constructor(client: Client, name: K, once: boolean = false) {
		this.client = client;
		this.name = name;
		this.once = once;
	}

	public abstract execute(...args: ClientEvents[K]): Promise<void> | void;
}
