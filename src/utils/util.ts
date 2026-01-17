import { PrefixOptions } from "#types/client.js";
import { InteractionResponse, Message } from "discord.js";

export function deleteMessage(
	message: Message | InteractionResponse,
	time = 15_000
) {
	return new Promise<void>((r) => {
		setTimeout(() => {
			message.delete().catch();
			r();
		}, time);
	});
}
export function getPrefix(opts: PrefixOptions): string | false {
	if (typeof opts === "string") {
		return opts;
	}

	if (opts && typeof opts === "object") {
		if (opts.enabled) {
			return opts.prefix;
		}
	}

	return false;
}
