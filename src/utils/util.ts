import {
	ChatInputCommandInteraction,
	InteractionResponse,
	Locale,
	Message,
} from "discord.js";
import type { Context } from "@structures/index.js";

export const allowedLocales = [
	"id",
	"en-US",
	"en-GB",
	"bg",
	"zh-CN",
	"zh-TW",
	"hr",
	"cs",
	"da",
	"nl",
	"fi",
	"fr",
	"de",
	"el",
	"hi",
	"hu",
	"it",
	"ja",
	"ko",
	"lt",
	"no",
	"pl",
	"pt-BR",
	"ro",
	"ru",
	"es-ES",
	"es-419",
	"sv-SE",
	"th",
	"tr",
	"uk",
	"vi",
] as const satisfies readonly `${Locale}`[];

const allowedLocalesSet = new Set<string>(allowedLocales);

export function sanitizeDiscordText(value: unknown): string {
	if (value == null) return "";

	let text: string;
	if (typeof value === "string") {
		text = value;
	} else if (
		typeof value === "number" ||
		typeof value === "boolean" ||
		typeof value === "bigint"
	) {
		text = `${value}`;
	} else if (value instanceof Date) {
		text = value.toISOString();
	} else if (typeof value === "object") {
		text = JSON.stringify(value);
	} else if (typeof value === "symbol") {
		text = value.description ? `Symbol(${value.description})` : "Symbol()";
	} else if (typeof value === "function") {
		text = value.name ? `[Function: ${value.name}]` : "[Function]";
	} else {
		text = "";
	}

	return text.replaceAll("@", "@\u200b");
}

export function parseThings<TContext>(
	value: string,
	ctx: TContext,
	resolver: (name: string, ctx: TContext) => string | undefined
): string {
	const text = String(value);
	let cursor = 0;
	let result = "";

	while (cursor < text.length) {
		const start = text.indexOf("{{", cursor);
		if (start === -1) {
			result += text.slice(cursor);
			break;
		}

		result += text.slice(cursor, start);

		const end = text.indexOf("}}", start + 2);
		if (end === -1) {
			result += text.slice(start);
			break;
		}

		const fullToken = text.slice(start, end + 2);
		const rawName = text.slice(start + 2, end);
		const name = rawName.trim();

		if (!name || rawName.includes("{") || rawName.includes("}")) {
			result += fullToken;
		} else {
			const resolved = resolver(name, ctx);
			result += typeof resolved === "string" ? resolved : fullToken;
		}

		cursor = end + 2;
	}

	return result;
}

export function collectTemplateTokens(value: string): Set<string> {
	const text = String(value);
	const tokens = new Set<string>();
	let cursor = 0;

	while (cursor < text.length) {
		const start = text.indexOf("{{", cursor);
		if (start === -1) break;

		const end = text.indexOf("}}", start + 2);
		if (end === -1) break;

		const rawName = text.slice(start + 2, end);
		const name = rawName.trim();
		if (name && !rawName.includes("{") && !rawName.includes("}")) {
			tokens.add(name);
		}

		cursor = end + 2;
	}

	return tokens;
}

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

export function toAllowedLocale(
	locale: string | null | undefined
): `${Locale}` | undefined {
	if (!locale) return undefined;
	if (!allowedLocalesSet.has(locale)) return undefined;
	return locale as `${Locale}`;
}

export function getDefaultLang(
	ctx: Context<ChatInputCommandInteraction | Message>
): `${Locale}` {
	if (ctx.isInteraction()) {
		return (
			toAllowedLocale(ctx.data.locale) ??
			toAllowedLocale(ctx.data.guildLocale) ??
			Locale.EnglishUS
		);
	}
	return toAllowedLocale(ctx.data.guild?.preferredLocale) ?? Locale.EnglishUS;
}
