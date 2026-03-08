import { ClientEvents } from "discord.js";
import type { MaybePromise } from "#types/extra.js";
import { Client } from "@structures/index.js";
import { Logger } from "@utils/index.js";

type EventArgs<K extends keyof ClientEvents> = ClientEvents[K];
type EventHandler<K extends keyof ClientEvents> = (
	context: EventBuilder<K>,
	...args: EventArgs<K>
) => MaybePromise<void>;

export class EventBuilder<K extends keyof ClientEvents> {
	#client: Client | null = null;
	#logger: Logger | null = null;
	#handler?: EventHandler<K>;
	#bound = false;

	get client(): Client {
		if (!this.#client) throw new Error("Event is not attached to a client");
		return this.#client;
	}

	get logger(): Logger {
		if (!this.#logger) throw new Error("Event is not attached to a client");
		return this.#logger;
	}

	#listener = async (...args: EventArgs<K>) => {
		if (!this.#client) return;
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
		if (_handler) {
			this.#handler = _handler;
		}
	}

	#register(): void {
		if (this.#bound || !this.#handler || !this.#client || !this.#logger) return;

		if (this.once) {
			this.client.once(this.name as string, this.#listener);
		} else {
			this.client.on(this.name as string, this.#listener);
		}

		this.#bound = true;
		this.logger.debug(`Loaded Event ${String(this.name)}`);
	}

	public attach(client: Client) {
		if (this.#client) return this;
		this.#client = client;
		this.#logger = client.logger;
		this.#register();
		return this;
	}

	public onExecute(func: EventHandler<K>) {
		this.#handler = func;
		this.#register();
		return this;
	}
}
