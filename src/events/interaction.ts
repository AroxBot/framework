import { Events } from "discord.js";
import { EventBuilder } from "../structures/Event";
import { Context } from "../structures/Context";

new EventBuilder(Events.InteractionCreate, false).onExecute(
	async function (context, interaction) {
		if (!interaction.isChatInputCommand()) return;

		const command = context.client.commands.get(interaction.commandName);
		if (!command || !command.supportsSlash) {
			await interaction.reply({
				content: "Command not found or disabled.",
				ephemeral: true,
			});
			return;
		}

		try {
			const ctx = new Context(context.client, { interaction });
			if (command._onInteraction) await command._onInteraction(ctx.toJSON());
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
);
