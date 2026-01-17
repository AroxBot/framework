import { Events } from "discord.js";
import { Event } from "../structures/Event";
import { Context } from "../structures/Context";

new Event(
	Events.InteractionCreate,
	async function (interaction) {
		if (!interaction.isChatInputCommand()) return;

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
	},
	false
);
