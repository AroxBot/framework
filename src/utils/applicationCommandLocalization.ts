import { ApplicationCommandOptionType } from "discord.js";
import type { i18n } from "i18next";
import type { ApplicationJSONBody } from "@structures/builder/Builder.js";

type OptionJSON = {
	name: string;
	type: ApplicationCommandOptionType;
	description?: string;
	options?: OptionJSON[];
	name_localizations?: Record<string, string>;
	description_localizations?: Record<string, string>;
};

const optionTypePath: Partial<Record<ApplicationCommandOptionType, string>> = {
	[ApplicationCommandOptionType.User]: "user",
	[ApplicationCommandOptionType.String]: "string",
	[ApplicationCommandOptionType.Number]: "number",
	[ApplicationCommandOptionType.Integer]: "number",
	[ApplicationCommandOptionType.Boolean]: "boolean",
	[ApplicationCommandOptionType.Role]: "role",
	[ApplicationCommandOptionType.Channel]: "channel",
	[ApplicationCommandOptionType.Mentionable]: "mentionable",
	[ApplicationCommandOptionType.Attachment]: "attachment",
};

const getLocales = (instance: i18n): string[] => {
	const byResources = Object.keys(instance.store.data);
	const bySupported = Array.isArray(instance.options.supportedLngs)
		? instance.options.supportedLngs.filter((lang) => lang !== "cimode")
		: [];
	return Array.from(new Set([...byResources, ...bySupported]));
};

const buildLocalizationMap = (
	instance: i18n,
	path: string
): Record<string, string> => {
	const map: Record<string, string> = {};
	for (const locale of getLocales(instance)) {
		const translated = instance.t(path, { lng: locale, defaultValue: path });
		map[locale] = typeof translated === "string" ? translated : path;
	}
	return map;
};

const localizeOption = (
	option: OptionJSON,
	parentPath: string,
	instance: i18n
) => {
	let keyPath = parentPath;
	if (option.type === ApplicationCommandOptionType.Subcommand) {
		keyPath = `${parentPath}.subcommand.${option.name}`;
	} else if (option.type === ApplicationCommandOptionType.SubcommandGroup) {
		keyPath = `${parentPath}.group.${option.name}`;
	} else {
		const typePath = optionTypePath[option.type] ?? "option";
		keyPath = `${parentPath}.${typePath}.${option.name}`;
	}

	option.name_localizations = buildLocalizationMap(instance, `${keyPath}.name`);
	if (typeof option.description === "string") {
		option.description_localizations = buildLocalizationMap(
			instance,
			`${keyPath}.description`
		);
	}

	for (const child of option.options ?? []) {
		localizeOption(child, keyPath, instance);
	}
};

export const localizeApplicationCommand = (
	json: ApplicationJSONBody,
	instance: i18n
): ApplicationJSONBody => {
	const commandPath = `command:${json.name}`;
	json.name_localizations = buildLocalizationMap(
		instance,
		`${commandPath}.name`
	);
	json.description_localizations = buildLocalizationMap(
		instance,
		`${commandPath}.description`
	);

	for (const option of (json.options ?? []) as OptionJSON[]) {
		localizeOption(option, commandPath, instance);
	}

	return json;
};
