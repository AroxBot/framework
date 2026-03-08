import { Events } from "discord.js";
import { COMMAND_DISABLED_MESSAGE } from "@constants/lang.js";
import { EventBuilder, Context } from "@structures/index.js";
import { deleteMessageAfterSent } from "@utils/index.js";

export default new EventBuilder(
	Events.MessageCreate,
	false,
	async function (context, message) {
		if (message.author.bot) return;
		const prefix = context.client.prefix(
			new Context(context.client, { message })
		);
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
		const ctx = new Context(context.client, { message, args });

		const command = context.client.commands.get(commandAlias ?? commandName);

		if (!command) {
			await message
				.reply({
					content: ctx.t("error:command.notfound", {
						defaultValue: COMMAND_DISABLED_MESSAGE,
					}),
					allowedMentions: { repliedUser: false },
				})
				.then(deleteMessageAfterSent);
			return;
		}

		if (!command.supportsPrefix) {
			await message
				.reply({
					content: ctx.t("error:command.disabled", {
						defaultValue: COMMAND_DISABLED_MESSAGE,
					}),
					allowedMentions: { repliedUser: false },
				})
				.then(deleteMessageAfterSent);
			return;
		}

		try {
			context.logger.debug(
				`${ctx.author?.tag ?? "Unknown"} used ${command.data.name}(message)`
			);
			if (command._onMessage) await command._onMessage(ctx.toJSON());
		} catch (error) {
			context.client.logger.error(
				`Error executing command ${command.data.name}:`,
				error
			);
		}
	}
);
