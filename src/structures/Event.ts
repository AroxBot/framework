import { ClientEvents } from "discord.js";
import { MaybePromise } from "#types/extra.js";
import { currentClient } from "../context";
import { Client } from "./Client";
import { Logger } from "../utils/logger/Logger";

type EventArgs<K extends keyof ClientEvents> = ClientEvents[K];
type EventHandler<K extends keyof ClientEvents> = (
	context: EventBuilder<K>,
	...args: EventArgs<K>
) => MaybePromise<void>;

export class EventBuilder<K extends keyof ClientEvents> {
	public readonly client: Client;
	public readonly logger: Logger;
	private handler?: EventHandler<K>;
	private bound = false;

	private readonly listener = async (...args: EventArgs<K>) => {
		if (!this.handler) return;
		try {
			await this.handler(this, ...args);
		} catch (error) {
			this.client.logger.error(
				`Error executing event ${this.name} (${this.constructor.name}):`,
				error
			);
		}
	};

	constructor(
		public readonly name: K,
		public readonly once: boolean = false,
		_handler?: EventHandler<K>
	) {
		if (!currentClient) throw new Error("Client is not defined");
		this.client = currentClient;
		this.logger = currentClient.logger;

		if (_handler) {
			this.handler = _handler;
			this.register();
		}

		this.logger.debug(`Loaded Event ${String(this.name)}`);
	}

	private register(): void {
		if (this.bound || !this.handler) return;

		if (this.once) {
			this.client.once(this.name as string, this.listener);
		} else {
			this.client.on(this.name as string, this.listener);
		}

		this.bound = true;
	}

	public onExecute(func: EventHandler<K>) {
		this.handler = func;
		this.register();
		return this;
	}
}
