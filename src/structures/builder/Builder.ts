import {
	SlashCommandBuilder,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js";
import { normalizeArray } from "../../utils/normalizeArray";

import { currentClient } from "../../context";
import {
	applyLocalization,
	applyOptionsLocalization,
	getFallbackLng,
} from "../../utils/localeMap";

export interface ApplicationJSONBody extends RESTPostAPIChatInputApplicationCommandsJSONBody {
	prefix_support: boolean;
	slash_support: boolean;
	aliases: string[];
}
export class ApplicationCommandBuilder extends SlashCommandBuilder {
	constructor() {
		super();
	}
	protected prefix_support: boolean = true;
	protected slash_support: boolean = true;
	protected aliases: string[] = [];

	setAliases(...alias: string[]) {
		Reflect.set(this, "aliases", normalizeArray(alias));
		return this;
	}

	addAliases(...alias: string[]) {
		const currentAliases = Reflect.get(this, "aliases") || [];
		Reflect.set(
			this,
			"aliases",
			normalizeArray([...currentAliases, ...normalizeArray(alias)])
		);
		return this;
	}

	setPrefixSupport(support: boolean) {
		Reflect.set(this, "prefix_support", support);
		return this;
	}

	setSlashSupport(support: boolean) {
		Reflect.set(this, "slash_support", support);
		return this;
	}

	autoSet(namespace: string, key: string) {
		const client = currentClient;
		if (!client?.i18n) {
			throw new Error("autoSet requires i18n to be configured on the client.");
		}
		const i18nInstance = client.i18n;
		const fallbackLng = getFallbackLng(i18nInstance);
		const keyPath = `${namespace}:${key}`;

		// Apply to command (name, description, localizations)
		applyLocalization(i18nInstance, fallbackLng, this, keyPath);

		// Apply to all options recursively (subcommands, groups, etc.)
		if (this.options.length > 0) {
			applyOptionsLocalization(
				i18nInstance,
				fallbackLng,
				this.options as any,
				keyPath
			);
		}

		return this;
	}

	override toJSON(): ApplicationJSONBody {
		return super.toJSON() as ApplicationJSONBody;
	}

	toClientJSON(): ReturnType<ApplicationCommandBuilder["toJSON"]> {
		return {
			...this.toJSON(),
		};
	}
}
