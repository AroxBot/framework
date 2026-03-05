import {
	SlashCommandBuilder,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js";
import { normalizeArray } from "../../utils/normalizeArray.js";
import { Client } from "../core/index.js";

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
