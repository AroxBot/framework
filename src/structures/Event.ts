import { ClientEvents } from "discord.js";
import { MaybePromise } from "#types/extra.js";
import { currentClient } from "../context";
import { Client } from "./Client";

type EventArgs<K extends keyof ClientEvents | string> =
	K extends keyof ClientEvents ? ClientEvents[K] : any[];

export class Event<K extends keyof ClientEvents | string> {
	public readonly client: Client;

	constructor(
		public readonly name: K,
		public readonly execute: (
			this: Event<K>,
			...args: EventArgs<K>
		) => MaybePromise<void>,
		public readonly once: boolean = false
	) {
		if (!currentClient) throw new Error("Client is not defined");
		this.client = currentClient;

		if (!this.name) {
			throw new Error(`${this.constructor.name}: Event name is missing!`);
		}
		process.nextTick(() => {
			const listener = (...args: any[]) =>
				this.execute(...(args as EventArgs<K>));
			if (this.once) {
				this.client.once(this.name as string, listener);
			} else {
				this.client.on(this.name as string, listener);
			}
		});
	}
}
