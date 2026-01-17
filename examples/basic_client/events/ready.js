const { EventBuilder } = require("../../../dist");

new EventBuilder("clientReady", function () {
	this.logger.log("Client connected!");
	this.logger.warn(`Current user: ${this.client.user.username}`);
	this.logger.warn(`Current prefix: ${this.client.prefix ?? "none"}`);
});
