import { ClientEvents } from "discord.js";
import { MaybePromise } from "#types/extra.js";
import { currentClient } from "../context";
import { Client } from "./Client";
import { LoggerInstance } from "../utils/Logger";

type EventArgs<K extends keyof ClientEvents | string> =
	K extends keyof ClientEvents ? ClientEvents[K] : any[];

export class EventBuilder<K extends keyof ClientEvents | string> {
	public readonly client: Client;
	public readonly logger: LoggerInstance;
	private handler?: (...args: EventArgs<K>) => MaybePromise<void>;

	constructor(
		public readonly name: K,
		public readonly once: boolean = false,
		_handler?: (...args: EventArgs<K>) => MaybePromise<void>
	) {
		if (!currentClient) throw new Error("Client is not defined");
		this.client = currentClient;
		this.logger = currentClient.logger;
		if (_handler) this.handler = _handler;
		this.logger.debug(`Loaded Event ${this.name}(${__filename})`);

		process.nextTick(() => {
			const wrapper = async (...args: EventArgs<K>) => {
				if (this.handler) {
					await this.handler(...args);
				}
			};

			if (this.once) {
				this.client.once(this.name as string, wrapper);
			} else {
				this.client.on(this.name as string, wrapper);
			}
		});
	}

	public onExecute(func: (...args: EventArgs<K>) => MaybePromise<void>) {
		this.handler = func;
		return this;
	}
}
