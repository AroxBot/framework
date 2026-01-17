import { EventBuilder } from "../structures/Event";

new EventBuilder("clientReady").onExecute(function () {
	if (this.client.options.autoRegiserCommands) {
		this.client.registerCommands();
	}
});
