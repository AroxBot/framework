import { Client, ClientOptions } from "discord.js";
import { LoggerInstance, LogLevel } from "./Logger";

export interface BaseOptions extends ClientOptions {
	logLevel?: LogLevel;
}

export default class BaseClient extends Client {
	readonly logger: LoggerInstance;

	constructor(opts: BaseOptions) {
		super(opts);
		this.logger = new LoggerInstance(opts.logLevel ?? "log");
	}
}
