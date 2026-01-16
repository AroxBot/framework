import { REST, Routes } from "discord.js";
import { Client } from "../structures/Client";

export class Deployer {
	public readonly client: Client;

	constructor(client: Client) {
		this.client = client;
	}

	public async deployGlobal() {
		if (!this.client.token || !this.client.application) return;

		const slashCommands = this.client.commands
			.filter((cmd) => cmd.supportsSlash)
			.map((cmd) => cmd.toJSON());

		const rest = new REST({ version: "10" }).setToken(this.client.token);

		try {
			this.client.logger.log(
				`Started refreshing ${slashCommands.length} application (/) commands globaly.`
			);
			await rest.put(Routes.applicationCommands(this.client.application.id), {
				body: slashCommands,
			});
			this.client.logger.log(
				`Successfully reloaded application (/) commands globaly.`
			);
		} catch (error) {
			this.client.logger.error("Failed to register commands globaly:", error);
		}
	}

	public async deployGuild(guildId: string) {
		if (!this.client.token || !this.client.application) return;

		const slashCommands = this.client.commands
			.filter((cmd) => cmd.supportsSlash)
			.map((cmd) => cmd.toJSON());

		const rest = new REST({ version: "10" }).setToken(this.client.token);

		try {
			this.client.logger.log(
				`Started refreshing ${slashCommands.length} application (/) commands for guild ${guildId}.`
			);
			await rest.put(
				Routes.applicationGuildCommands(this.client.application.id, guildId),
				{
					body: slashCommands,
				}
			);
			this.client.logger.log(
				`Successfully reloaded application (/) commands for guild ${guildId}.`
			);
		} catch (error) {
			this.client.logger.error(
				`Failed to register commands for guild ${guildId}:`,
				error
			);
		}
	}
}
