import { Events } from "discord.js";
import { EventBuilder } from "../structures/Event";
import { Context } from "../structures/Context";
import { deleteMessage } from "../utils/util";

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
				.then(deleteMessage);
			return;
		}

		try {
			const ctx = new Context(context.client, { message, args });
			context.logger.debug(
				`${ctx.author?.tag ?? "Unknown"} used ${command.name}(message)`
			);
			if (command._onMessage) await command._onMessage(ctx.toJSON());
		} catch (error) {
			context.client.logger.error(
				`Error executing command ${command.name}:`,
				error
			);
		}
	}
);
