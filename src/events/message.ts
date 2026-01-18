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

		const commandAlias = this.client.aliases.findKey((cmd) =>
			cmd.has(commandName)
		);

		let command = this.client.commands.get(commandAlias ?? commandName);
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
			const context = new Context(this.client, { message, args });
			this.logger.debug(
				`${context.author?.tag ?? "Unknown"} used ${command.name}(message)`
			);
			if (command) await command.onMessageCallback(context.toJSON());
		} catch (error) {
			this.client.logger.error(
				`Error executing command ${command.name}:`,
				error
			);
		}
	}
);
