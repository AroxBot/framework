const { EventBuilder } = require("../../../dist/index.cjs");

module.exports = new EventBuilder("clientReady", false, (context) => {
	context.logger.log("Client connected!");
	context.logger.warn(`Current user: ${context.client.user.username}`);
	context.logger.warn(`Current prefix: ${context.client.prefix ?? "none"}`);
});
