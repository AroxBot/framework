import { Events, MessageFlags } from "discord.js";
import { EventBuilder, Context } from "#structures";

new EventBuilder(Events.InteractionCreate, false).onExecute(
	async function (context, interaction) {
		if (!interaction.isChatInputCommand()) return;

		const command = context.client.commands.get(interaction.commandName);
		if (!command || !command.supportsSlash) {
			await interaction.reply({
				content: "Command not found or disabled.",
				flags: MessageFlags.Ephemeral,
			});
			return;
		}

		try {
			const ctx = new Context(context.client, { interaction });
			ctx.locale = interaction.locale;
			context.logger.debug(
				`${ctx.author?.tag ?? "Unknown"} used ${command.name}(interaction)`
			);

			for (const preconditionName of command.preconditions) {
				const precondition = context.client.preconditions.get(preconditionName);
				if (!precondition) {
					context.logger.warn(
						`Precondition "${preconditionName}" not found for command "${command.name}".`
					);
					continue;
				}

				const result = await precondition.run(ctx);
				if (!result.ok) {
					await interaction.reply({
						content: result.message,
						flags: MessageFlags.Ephemeral,
					});
					return;
				}
			}

			if (command._onInteraction) await command._onInteraction(ctx.toJSON());
		} catch (error) {
			context.client.logger.error(
				`Error executing command ${command.name}:`,
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
