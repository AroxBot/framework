export type PrefixOptions =
	| { enabled: true; prefix: string }
	| { enabled: false }
	| string;

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
