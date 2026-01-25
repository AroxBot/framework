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
				flags: "Ephemeral",
			});
			return;
		}

		try {
			const ctx = new Context(context.client, { interaction });
			ctx.locale = interaction.locale;
			context.logger.debug(
				`${ctx.author?.tag ?? "Unknown"} used ${command.name}(interaction)`
			);
			if (command._onInteraction) await command._onInteraction(ctx.toJSON());
		} catch (error) {
			context.client.logger.error(
				`Error executing command ${command.name}:`,
				error
			);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({
					content: "There was an error while executing this command!",
					flags: "Ephemeral",
				});
			} else {
				await interaction.reply({
					content: "There was an error while executing this command!",
					flags: "Ephemeral",
				});
			}
		}
	}
);
