import type { MessageContextJSON } from "@structures/builder/Context.js";
import { closest, distance } from "fastest-levenshtein";

interface IntegerOptionConfig {
	key: string;
	fallbackAliases?: string[];
	defaultValue?: number;
	startIndex?: number;
	useFuzzy?: boolean;
	maxDistance?: number;
}

interface MatchOptions {
	useFuzzy?: boolean;
	maxDistance?: number;
}

export class MessageCommandParser {
	readonly args: string[];
	readonly normalizedArgs: string[];

	constructor(private readonly ctx: MessageContextJSON) {
		this.args = ctx.args;
		this.normalizedArgs = this.args.map((arg) =>
			MessageCommandParser.normalizeToken(arg)
		);
	}

	static normalizeToken(value: string): string {
		return String(value)
			.trim()
			.toLowerCase()
			.normalize("NFD")
			.replace(/[\u0300-\u036f]/g, "");
	}

	getAliases(key: string, fallbackAliases: string[] = []): string[] {
		return this.ctx
			.getLocalizationAliases(key, fallbackAliases)
			.map(MessageCommandParser.normalizeToken)
			.filter((value, index, arr) => value.length > 0 && arr.indexOf(value) === index);
	}

	private findClosestAlias(
		token: string,
		aliases: string[],
		maxDistance: number = 1
	): string | null {
		if (!token || aliases.length === 0) return null;
		const best = closest(token, aliases);
		if (!best) return null;
		const d = distance(token, best);
		return d <= maxDistance ? best : null;
	}

	matchesArg(
		index: number,
		key: string,
		fallbackAliases: string[] = [],
		options: MatchOptions = {}
	): boolean {
		const token = this.normalizedArgs[index];
		if (!token) return false;
		const aliases = this.getAliases(key, fallbackAliases);
		const aliasSet = new Set(aliases);
		if (aliasSet.has(token)) return true;
		if (!options.useFuzzy) return false;
		return this.findClosestAlias(token, aliases, options.maxDistance ?? 1) !== null;
	}

	parseIntegerOption(config: IntegerOptionConfig): number {
		const {
			key,
			fallbackAliases = [],
			defaultValue = 0,
			startIndex = 0,
			useFuzzy = false,
			maxDistance = 1,
		} = config;
		const aliasList = this.getAliases(key, fallbackAliases);
		const aliases = new Set(aliasList);
		const directValue = Number.parseInt(
			this.normalizedArgs[startIndex + 1] ?? "",
			10
		);
		if (Number.isFinite(directValue) && directValue > 0) {
			return directValue;
		}

		for (let i = startIndex + 1; i < this.normalizedArgs.length; i += 1) {
			const token = this.normalizedArgs[i];
			const [keyPart, valuePart] = token.split(":");
			const nearestKey = useFuzzy
				? this.findClosestAlias(keyPart, aliasList, maxDistance)
				: null;

			if (
				aliases.has(token) ||
				(useFuzzy &&
					this.findClosestAlias(token, aliasList, maxDistance))
			) {
				const parsed = Number.parseInt(this.normalizedArgs[i + 1] ?? "", 10);
				if (Number.isFinite(parsed) && parsed > 0) return parsed;
			}

			if (valuePart && (aliases.has(keyPart) || nearestKey)) {
				const parsed = Number.parseInt(valuePart, 10);
				if (Number.isFinite(parsed) && parsed > 0) return parsed;
			}
		}

		return defaultValue;
	}
}
