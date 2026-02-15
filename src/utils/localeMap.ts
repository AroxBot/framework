import { Locale, SharedNameAndDescription } from "discord.js";
import type { i18n } from "i18next";

const DISCORD_LOCALE_VALUES = new Set<string>(Object.values(Locale));

/**
 * Converts an i18next locale string to a Discord Locale value.
 * Returns null if no matching Discord locale is found.
 */
export function toDiscordLocale(i18nLocale: string): Locale | null {
	if (DISCORD_LOCALE_VALUES.has(i18nLocale)) {
		return i18nLocale as Locale;
	}
	if (i18nLocale === "en") return Locale.EnglishUS;
	return null;
}

/**
 * Extracts the fallback language from an i18n instance configuration.
 */
export function getFallbackLng(instance: i18n): string {
	const fallback = instance.options.fallbackLng;
	if (typeof fallback === "string") return fallback;
	if (Array.isArray(fallback) && fallback.length > 0) return fallback[0];
	return "en-US";
}

interface LocalizedNode {
	name?: string;
	description?: string;
	options?: Record<string, LocalizedNode>;
}

/**
 * Applies name/description and their localizations to a builder element (command, option, subcommand, etc.)
 * using nested i18next objects.
 *
 * @param instance - The i18n instance
 * @param fallbackLng - The fallback language code
 * @param builder - The builder to apply localizations to (command, option, subcommand — anything with setName/setDescription)
 * @param keyPath - The i18next key path (e.g. "commands:ping" or "commands:ping.options.target")
 */
export function applyLocalization(
	instance: i18n,
	fallbackLng: string,
	builder: SharedNameAndDescription,
	keyPath: string
): void {
	const defaultT = instance.getFixedT(fallbackLng);
	const defaultData = defaultT(keyPath, {
		returnObjects: true,
	}) as LocalizedNode;

	if (typeof defaultData !== "object" || defaultData === null) return;

	if (defaultData.name) builder.setName(defaultData.name);
	if (defaultData.description) builder.setDescription(defaultData.description);

	// Build localization maps from all supported languages
	const nameMap: Partial<Record<Locale, string>> = {};
	const descMap: Partial<Record<Locale, string>> = {};
	const languages: readonly string[] = Array.isArray(
		instance.options.supportedLngs
	)
		? instance.options.supportedLngs
		: [];

	for (const lng of languages) {
		if (lng === "cimode") continue;

		const locale = toDiscordLocale(lng);
		if (!locale) continue;

		const data = instance.t(keyPath, {
			lng,
			returnObjects: true,
		}) as LocalizedNode;
		if (typeof data !== "object" || data === null) continue;

		if (data.name) nameMap[locale] = data.name;
		if (data.description) descMap[locale] = data.description;
	}

	if (Object.keys(nameMap).length > 0) {
		builder.setNameLocalizations(nameMap);
	}
	if (Object.keys(descMap).length > 0) {
		builder.setDescriptionLocalizations(descMap);
	}
}

/**
 * Recursively applies localizations to an array of option builders.
 * Handles subcommands and subcommand groups by recursing into their nested options.
 *
 * @param instance - The i18n instance
 * @param fallbackLng - The fallback language code
 * @param options - Array of option/subcommand builders from the parent
 * @param parentKeyPath - The i18next key path of the parent (e.g. "commands:ping")
 */
export function applyOptionsLocalization(
	instance: i18n,
	fallbackLng: string,
	options: readonly { name: string; options?: readonly unknown[] }[],
	parentKeyPath: string
): void {
	for (const option of options) {
		const optKeyPath = `${parentKeyPath}.options.${option.name}`;

		// Apply localization to this option
		applyLocalization(
			instance,
			fallbackLng,
			option as unknown as SharedNameAndDescription,
			optKeyPath
		);

		// Recurse into nested options (subcommands / subcommand groups)
		if (option.options && option.options.length > 0) {
			applyOptionsLocalization(
				instance,
				fallbackLng,
				option.options as typeof options,
				optKeyPath
			);
		}
	}
}
