import { Events } from "discord.js";
import { EventBuilder } from "../structures/Event";

new EventBuilder(Events.ClientReady).onExecute(function () {
	if (this.client.options.autoRegisterCommands) {
		this.client.registerCommands();
	}
});
