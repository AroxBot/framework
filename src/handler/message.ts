import { Events } from "discord.js";
import { Event } from "../structures/Event";
import { Context } from "../structures/Context";

new Event(
	Events.MessageCreate,
	async function (message) {
		if (message.author.bot) return;
		const prefix = this.client.options.prefix as string;
		if (!message.content.startsWith(prefix)) return;

		const args = message.content.slice(prefix.length).trim().split(/ +/);
		const commandName = args.shift()?.toLowerCase();
		if (!commandName) return;

		const commandAlias = this.client.aliases.findKey((cmd) =>
			cmd.has(commandName)
		);
		let command = this.client.commands.get(commandAlias ?? commandName);
		if (!command || !command.supportsSlash) {
			await message.reply({
				content: "Command not found or disabled.",
				allowedMentions: { repliedUser: false },
			});
			return;
		}

		try {
			const context = new Context(this.client, { message });
			await command.execute(context);
		} catch (error) {
			this.client.logger.error(
				`Error executing command ${command.name}:`,
				error
			);
		}
	},
	false
);
