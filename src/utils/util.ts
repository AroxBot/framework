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
	if (ctx.isMessage()) {
		return toAllowedLocale(ctx.data.guild?.preferredLocale) ?? Locale.EnglishUS;
	}
	return Locale.EnglishUS;
}
