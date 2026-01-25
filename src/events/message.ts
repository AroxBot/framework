import { Events } from "discord.js";
import { EventBuilder, Context } from "#structures";
import { deleteMessageAfterSent } from "#utils";

new EventBuilder(
	Events.MessageCreate,
	false,
	async function (context, message) {
		if (message.author.bot) return;
		const prefix = context.client.prefix;
		if (
			typeof prefix !== "string" ||
			prefix.length === 0 ||
			!message.content.startsWith(prefix)
		)
			return;

		const args = message.content.slice(prefix.length).trim().split(/ +/);
		const commandName = args.shift()?.toLowerCase();
		if (!commandName) return;

		const commandAlias = context.client.aliases.findKey((cmd) =>
			cmd.has(commandName)
		);

		let command = context.client.commands.get(commandAlias ?? commandName);
		if (!command || !command.supportsPrefix) {
			await message
				.reply({
					content: "Command not found or disabled.",
					allowedMentions: { repliedUser: false },
				})
				.then(deleteMessageAfterSent);
			return;
		}

		try {
			const ctx = new Context(context.client, { message, args });
			context.logger.debug(
				`${ctx.author?.tag ?? "Unknown"} used ${command.name}(message)`
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
					await message
						.reply({
							content: result.message,
							allowedMentions: { repliedUser: false },
						})
						.then(deleteMessageAfterSent);
					return;
				}
			}

			if (command._onMessage) await command._onMessage(ctx.toJSON());
		} catch (error) {
			context.client.logger.error(
				`Error executing command ${command.name}:`,
				error
			);
		}
	}
);
