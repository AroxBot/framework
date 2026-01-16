import { Client } from "../structures/Client";
import { Command } from "../structures/Command";
import { Context } from "../structures/Context";
import { Interaction, Message } from "discord.js";
import fs from "fs";
import path from "path";

export class CommandHandler {
	public readonly client: Client;

	constructor(client: Client) {
		this.client = client;
	}

	public async loadCommands(dir: string) {
		const files = this.getFiles(dir);
		for (const file of files) {
			try {
				delete require.cache[require.resolve(file)];
				const { default: CommandClass } = await require(file);

				if (!CommandClass || !(CommandClass.prototype instanceof Command)) {
					continue;
				}

				const command: Command = new CommandClass(this.client);
				this.client.commands.set(command.name, command);

				for (const alias of command.aliases) {
					this.client.aliases.set(alias, command.name);
				}

				this.client.logger.debug(`Loaded command: ${command.name}`);
			} catch (error) {
				this.client.logger.error(`Error loading command ${file}:`, error);
			}
		}
		this.client.logger.log(`Loaded ${this.client.commands.size} commands.`);
	}

	public async handleMessage(message: Message) {
		if (message.author.bot) return;
		if (!message.content.startsWith(this.client.prefix)) return;

		const args = message.content
			.slice(this.client.prefix.length)
			.trim()
			.split(/ +/);
		const commandName = args.shift()?.toLowerCase();

		if (!commandName) return;

		const name = this.client.aliases.get(commandName) || commandName;
		const command = this.client.commands.get(name);

		if (!command || !command.supportsPrefix) return;

		try {
			const context = new Context(this.client, { message, args });
			await command.execute(context);
		} catch (error) {
			this.client.logger.error(
				`Error executing command ${command.name}:`,
				error
			);
			await message.reply("There was an error trying to execute that command!");
		}
	}

	public async handleInteraction(interaction: Interaction) {
		if (!interaction.isCommand()) return;

		const command = this.client.commands.get(interaction.commandName);
		if (!command || !command.supportsSlash) {
			await interaction.reply({
				content: "Command not found or disabled.",
				ephemeral: true,
			});
			return;
		}

		try {
			const context = new Context(this.client, { interaction });
			await command.execute(context);
		} catch (error) {
			this.client.logger.error(
				`Error executing command ${command.name}:`,
				error
			);
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

	private getFiles(dir: string, fileList: string[] = []): string[] {
		if (!fs.existsSync(dir)) return [];
		const files = fs.readdirSync(dir);
		for (const file of files) {
			const filePath = path.join(dir, file);
			if (fs.statSync(filePath).isDirectory()) {
				this.getFiles(filePath, fileList);
			} else if (file.endsWith(".ts") || file.endsWith(".js")) {
				fileList.push(filePath);
			}
		}
		return fileList;
	}
}
