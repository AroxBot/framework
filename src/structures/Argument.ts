import {
	ApplicationCommandOptionData,
	ApplicationCommandOptionType,
} from "discord.js";

export class Argument {
	public readonly name: string;
	public readonly description: string;
	public readonly type: ApplicationCommandOptionType;
	public readonly required: boolean;
	public readonly choices?: { name: string; value: string | number }[];

	constructor(data: {
		name: string;
		description: string;
		type: ApplicationCommandOptionType;
		required?: boolean;
		choices?: { name: string; value: string | number }[];
	}) {
		this.name = data.name;
		this.description = data.description;
		this.type = data.type;
		this.required = data.required ?? false;
		this.choices = data.choices;
	}

	public toJSON(): ApplicationCommandOptionData {
		return {
			name: this.name,
			description: this.description,
			type: this.type,
			required: this.required,
			choices: this.choices,
		} as ApplicationCommandOptionData;
	}
}
