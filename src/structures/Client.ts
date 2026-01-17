import {
	Client as DiscordClient,
	ClientOptions,
	Collection,
	Interaction,
	Message,
	REST,
	Routes,
} from "discord.js";
import { LoggerInstance, LogLevel } from "../utils/Logger";
import { Command } from "./Command";
import { Context } from "./Context";
import { Event } from "./Event";
import path from "path";
import { getFiles, getProjectRoot } from "../utils/Files";

export interface ClientOptionsWithFramework extends ClientOptions {
	logLevel?: LogLevel;
	prefix?: string;
	token?: string;
}

export class Client extends DiscordClient {
	public readonly logger: LoggerInstance;
	public readonly commands: Collection<string, Command>;
	public readonly aliases: Collection<string, string>;
	public readonly prefix: string;

	constructor(opts: ClientOptionsWithFramework) {
		super(opts);
		this.logger = new LoggerInstance(opts.logLevel ?? "log");
		this.commands = new Collection();
		this.aliases = new Collection();
		this.prefix = opts.prefix ?? "!";

		if (opts.token) this.token = opts.token;

		this.on("messageCreate", this.handleMessage.bind(this));
		this.on("interactionCreate", this.handleInteraction.bind(this));
		const eventsPath = path.join(getProjectRoot(), "events");

		this.loadEvents(eventsPath).catch((error) =>
			this.logger.error("Error loading events:", error)
		);
	}

	public async loadCommands(dir: string) {
		const files = getFiles(dir);
		for (const file of files) {
			try {
				delete require.cache[require.resolve(file)];
				const { default: CommandClass } = await require(file);

				if (!CommandClass || !(CommandClass.prototype instanceof Command)) {
					continue;
				}

				const command: Command = new CommandClass(this);
				this.commands.set(command.name, command);

				for (const alias of command.aliases) {
					this.aliases.set(alias, command.name);
				}

				this.logger.debug(`Loaded command: ${command.name}`);
			} catch (error) {
				this.logger.error(`Error loading command ${file}:`, error);
			}
		}
		this.logger.log(`Loaded ${this.commands.size} commands.`);
	}

	public async loadEvents(dir: string) {
		const files = getFiles(dir);
		for (const file of files) {
			try {
				delete require.cache[require.resolve(file)];
				const { default: EventClass } = await require(file);

				if (!EventClass || !(EventClass.prototype instanceof Event)) {
					continue;
				}

				const event: Event<any> = new EventClass(this);
				if (event.once) {
					this.once(event.name, (...args) => event.execute(...args));
				} else {
					this.on(event.name, (...args) => event.execute(...args));
				}

				this.logger.debug(`Loaded event: ${event.name}`);
			} catch (error) {
				this.logger.error(`Error loading event ${file}:`, error);
			}
		}
	}

	public async registerCommands() {
		if (!this.token || !this.application) return;

		const slashCommands = this.commands
			.filter((cmd) => cmd.supportsSlash)
			.map((cmd) => ({
				name: cmd.name,
				description: cmd.description,
				options: cmd.options,
			}));

		const rest = new REST({ version: "10" }).setToken(this.token);

		try {
			this.logger.log(
				`Started refreshing ${slashCommands.length} application (/) commands.`
			);
			await rest.put(Routes.applicationCommands(this.application.id), {
				body: slashCommands,
			});
			this.logger.log(`Successfully reloaded application (/) commands.`);
		} catch (error) {
			this.logger.error("Failed to register commands:", error);
		}
	}

	private async handleMessage(message: Message) {
		if (message.author.bot) return;
		if (!message.content.startsWith(this.prefix)) return;

		const args = message.content.slice(this.prefix.length).trim().split(/ +/);
		const commandName = args.shift()?.toLowerCase();

		if (!commandName) return;

		const name = this.aliases.get(commandName) || commandName;
		const command = this.commands.get(name);

		if (!command || !command.supportsPrefix) return;

		try {
			const context = new Context(this, { message, args });
			await command.execute(context);
		} catch (error) {
			this.logger.error(`Error executing command ${command.name}:`, error);
			await message.reply("There was an error trying to execute that command!");
		}
	}

	private async handleInteraction(interaction: Interaction) {
		if (!interaction.isCommand()) return;

		const command = this.commands.get(interaction.commandName);
		if (!command || !command.supportsSlash) {
			await interaction.reply({
				content: "Command not found or disabled.",
				ephemeral: true,
			});
			return;
		}

		try {
			const context = new Context(this, { interaction });
			await command.execute(context);
		} catch (error) {
			this.logger.error(`Error executing command ${command.name}:`, error);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({
					content: "There was an error while executing this command!",
					ephemeral: true,
				});
			} else {
				await interaction.reply({
					content: "There was an error while executing this command!",
					ephemeral: true,
				});
			}
		}
	}
}
