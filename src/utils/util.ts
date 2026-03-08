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
const templateTokenRegex = /{{\s*([^{}]+?)\s*}}/g;

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
	return String(value).replace(templateTokenRegex, (full, name: string) => {
		const resolved = resolver(name.trim(), ctx);
		return typeof resolved === "string" ? resolved : full;
	});
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
