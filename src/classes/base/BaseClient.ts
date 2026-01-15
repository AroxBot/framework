import { Client, ClientOptions } from "discord.js";
import { LoggerInstance } from "./Logger";

export interface BaseOptions extends ClientOptions {}

export default class BaseClient extends Client {
	logger = new LoggerInstance();

	constructor(opts: BaseOptions) {
		super(opts);
	}
}
