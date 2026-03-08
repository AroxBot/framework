import { Events, MessageFlags } from "discord.js";
import {
	COMMAND_DISABLED_MESSAGE,
	COMMAND_EXECUTE_ERROR_MESSAGE,
} from "@constants/lang.js";
import { EventBuilder, Context } from "@structures/index.js";

export default new EventBuilder(Events.InteractionCreate, false).onExecute(
	async function (context, interaction) {
		if (!interaction.isChatInputCommand()) return;

		const command = context.client.resolveInteractionCommand(
			interaction.commandName
		);
		const ctx = new Context(context.client, { interaction });

		if (!command) {
			await interaction.reply({
				content: ctx.t("error:command.notfound", {
					defaultValue: COMMAND_DISABLED_MESSAGE,
				}),
				flags: MessageFlags.Ephemeral,
			});
			return;
		}
		if (!command.supportsSlash) {
			await interaction.reply({
				content: ctx.t("error:command.disabled", {
					defaultValue: COMMAND_DISABLED_MESSAGE,
				}),
				flags: MessageFlags.Ephemeral,
			});
			return;
		}
		try {
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
					content: COMMAND_EXECUTE_ERROR_MESSAGE,
					flags: MessageFlags.Ephemeral,
				});
			} else {
				await interaction.reply({
					content: COMMAND_EXECUTE_ERROR_MESSAGE,
					flags: MessageFlags.Ephemeral,
				});
			}
		}
	}
);
