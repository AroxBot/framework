import { Events } from "discord.js";
import { EventBuilder } from "../structures/Event";
import { Context } from "../structures/Context";

new EventBuilder(Events.InteractionCreate, false, async function (interaction) {
	if (!interaction.isChatInputCommand()) return;

	const command = this.client.commands.get(interaction.commandName);
	if (!command || !command._supportsSlash) {
		await interaction.reply({
			content: "Command not found or disabled.",
			ephemeral: true,
		});
		return;
	}

	try {
		const context = new Context(this.client, { interaction });
		if (command._onInteraction) await command._onInteraction(context.toJSON());
	} catch (error) {
		this.client.logger.error(`Error executing command ${command.name}:`, error);
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
});
