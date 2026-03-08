import { SlashCommandBuilder } from "discord.js";
import { Client } from "@structures/core/index.js";
import { normalizeArray } from "@utils/normalizeArray.js";
import type { RESTPostAPIChatInputApplicationCommandsJSONBody } from "discord.js";
export interface ApplicationJSONBody extends RESTPostAPIChatInputApplicationCommandsJSONBody {
	prefix_support: boolean;
	slash_support: boolean;
	aliases: string[];
}
export class ApplicationCommandBuilder extends SlashCommandBuilder {
	protected prefix_support: boolean = true;
	protected slash_support: boolean = true;
	protected aliases: string[] = [];

	setAliases(...alias: string[]) {
		this.aliases = normalizeArray(alias);
		return this;
	}

	addAliases(...alias: string[]) {
		this.aliases = normalizeArray([...this.aliases, ...normalizeArray(alias)]);
		return this;
	}

	setPrefixSupport(support: boolean) {
		this.prefix_support = support;
		return this;
	}

	setSlashSupport(support: boolean) {
		this.slash_support = support;
		return this;
	}
	override toJSON(): ApplicationJSONBody {
		return super.toJSON() as ApplicationJSONBody;
	}

	toClientJSON(
		_client: Client
	): ReturnType<ApplicationCommandBuilder["toJSON"]> {
		return {
			...this.toJSON(),
		};
	}
}
