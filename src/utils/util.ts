import type { PrefixOptions } from "#types/client.js";
import { InteractionResponse, Message } from "discord.js";

export function deleteMessageAfterSent(
	message: Message | InteractionResponse,
	time = 15_000
) {
	return new Promise<void>((r) => {
		setTimeout(() => {
			message.delete().catch(() => {});
			r();
		}, time);
	});
}

export function getPrefix(opts: PrefixOptions): string | false {
	if (typeof opts === "string") {
		return opts;
	}

	if (opts.enabled && opts.prefix) {
		return opts.prefix;
	}

	return false;
}
