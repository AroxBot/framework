import { Events } from "discord.js";
import { EventBuilder } from "../structures/Event";
import { Context } from "../structures/Context";
import { deleteMessage } from "../utils/util";

new EventBuilder(Events.MessageCreate, false, async function (message) {
	if (message.author.bot) return;
	const prefix = this.client.prefix as string;
	if (!message.content.startsWith(prefix)) return;

	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const commandName = args.shift()?.toLowerCase();
	if (!commandName) return;

	const commandAlias = this.client.aliases.findKey((cmd) =>
		cmd.has(commandName)
	);

	let command = this.client.commands.get(commandAlias ?? commandName);
	if (!command || !command._supportsPrefix) {
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
		this.logger.debug(`${context.author} used ${command.name}(message)`);
		if (command._onMessage) await command._onMessage(context.toJSON());
	} catch (error) {
		this.client.logger.error(`Error executing command ${command.name}:`, error);
	}
});
