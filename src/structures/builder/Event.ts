import { ClientEvents } from "discord.js";
import type { MaybePromise } from "#types/extra.js";
import { currentClient } from "@context";
import { Client } from "@structures/index.js";
import { Logger } from "@utils/index.js";

type EventArgs<K extends keyof ClientEvents> = ClientEvents[K];
type EventHandler<K extends keyof ClientEvents> = (
	context: EventBuilder<K>,
	...args: EventArgs<K>
) => MaybePromise<void>;

export class EventBuilder<K extends keyof ClientEvents> {
	readonly client: Client;
	readonly logger: Logger;
	#handler?: EventHandler<K>;
	#bound = false;

	#listener = async (...args: EventArgs<K>) => {
		if (!this.#handler) return;
		try {
			await this.#handler(this, ...args);
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
			this.#handler = _handler;
			this.#register();
		}
	}

	#register(): void {
		if (this.#bound || !this.#handler) return;

		if (this.once) {
			this.client.once(this.name as string, this.#listener);
		} else {
			this.client.on(this.name as string, this.#listener);
		}

		this.#bound = true;
		this.logger.debug(`Loaded Event ${String(this.name)}`);
	}

	public onExecute(func: EventHandler<K>) {
		this.#handler = func;
		this.#register();
		return this;
	}
}
