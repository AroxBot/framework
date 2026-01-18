import { Events } from "discord.js";
import { EventBuilder } from "../structures/Event";

new EventBuilder(Events.ClientReady).onExecute(async function (context) {
	if (context.client.options.autoRegisterCommands) {
		await context.client.registerCommands();
	}
});
