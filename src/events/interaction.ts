import { Events, MessageFlags } from "discord.js";
import { EventBuilder, Context } from "../structures/index.js";

new EventBuilder(Events.InteractionCreate, false).onExecute(
	async function (context, interaction) {
		if (!interaction.isChatInputCommand()) return;

		const command = context.client.commands.get(interaction.commandName);
		const ctx = new Context(context.client, { interaction });

		if (!command) {
			await interaction.reply({
				content: ctx.t("error.command.notfound", {
					defaultValue: "Command not found or disabled.",
				}),
				flags: MessageFlags.Ephemeral,
			});
			return;
		}
		if (!command.supportsSlash) {
			await interaction.reply({
				content: ctx.t("error.command.disabled", {
					defaultValue: "Command not found or disabled.",
				}),
				flags: MessageFlags.Ephemeral,
			});
			return;
		}
		try {
			ctx.locale = interaction.locale;
			context.logger.debug(
				`${ctx.author?.tag ?? "Unknown"} used ${command.data.name}(interaction)`
			);
			if (command._onInteraction) await command._onInteraction(ctx.toJSON());
		} catch (error) {
			context.client.logger.error(
				`Error executing command ${command.data.name}:`,
				error
			);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({
					content: "There was an error while executing this command!",
					flags: MessageFlags.Ephemeral,
				});
			} else {
				await interaction.reply({
					content: "There was an error while executing this command!",
					flags: MessageFlags.Ephemeral,
				});
			}
		}
	}
);
