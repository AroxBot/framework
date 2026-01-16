import { Client as DiscordClient, Collection } from "discord.js";
import { LoggerInstance } from "../utils/Logger";
import { Command } from "./Command";
import { CommandHandler } from "../handlers/CommandHandler";
import { EventHandler } from "../handlers/EventHandler";
import { ClientOptionsWithFramework } from "../types";
import path from "path";

export class Client extends DiscordClient {
	public readonly logger: LoggerInstance;
	public readonly commands: Collection<string, Command>;
	public readonly aliases: Collection<string, string>;
	public readonly prefix: string;

	public readonly commandHandler: CommandHandler;
	public readonly eventHandler: EventHandler;

	constructor(opts: ClientOptionsWithFramework) {
		super(opts);
		this.logger = new LoggerInstance(opts.logLevel ?? "log");
		this.commands = new Collection();
		this.aliases = new Collection();
		this.prefix = opts.prefix ?? "!";

		if (opts.token) this.token = opts.token;

		this.commandHandler = new CommandHandler(this);
		this.eventHandler = new EventHandler(this);

		this.on("messageCreate", (msg) => this.commandHandler.handleMessage(msg));
		this.on("interactionCreate", (int) =>
			this.commandHandler.handleInteraction(int)
		);

		// Auto-load events
		this.eventHandler
			.loadEvents(path.join(__dirname, "..", "events"))
			.catch((error) => this.logger.error("Error loading events:", error));
	}
}
