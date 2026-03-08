import {
	ApplicationCommandOptionType,
	SlashCommandAttachmentOption,
	SlashCommandBooleanOption,
	SlashCommandBuilder,
	SlashCommandChannelOption,
	SlashCommandIntegerOption,
	SlashCommandMentionableOption,
	SlashCommandNumberOption,
	SlashCommandRoleOption,
	SlashCommandStringOption,
	SlashCommandSubcommandBuilder,
	SlashCommandSubcommandGroupBuilder,
	SlashCommandUserOption,
	type APIApplicationCommandOption,
	type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js";
import { Client } from "@structures/core/index.js";
import { asCustomBuilder, applyAutoSet } from "@utils/builderAutoSet.js";
import { localizeApplicationCommand } from "@utils/applicationCommandLocalization.js";

export interface ApplicationJSONBody extends RESTPostAPIChatInputApplicationCommandsJSONBody {
	prefix_support: boolean;
	slash_support: boolean;
}

export class AutoSlashCommandStringOption extends SlashCommandStringOption {
	autoSet(key: string) {
		return applyAutoSet(this, key);
	}
}

export class AutoSlashCommandIntegerOption extends SlashCommandIntegerOption {
	autoSet(key: string) {
		return applyAutoSet(this, key);
	}
}

export class AutoSlashCommandNumberOption extends SlashCommandNumberOption {
	autoSet(key: string) {
		return applyAutoSet(this, key);
	}
}

export class AutoSlashCommandBooleanOption extends SlashCommandBooleanOption {
	autoSet(key: string) {
		return applyAutoSet(this, key);
	}
}

export class AutoSlashCommandUserOption extends SlashCommandUserOption {
	autoSet(key: string) {
		return applyAutoSet(this, key);
	}
}

export class AutoSlashCommandChannelOption extends SlashCommandChannelOption {
	autoSet(key: string) {
		return applyAutoSet(this, key);
	}
}

export class AutoSlashCommandRoleOption extends SlashCommandRoleOption {
	autoSet(key: string) {
		return applyAutoSet(this, key);
	}
}

export class AutoSlashCommandMentionableOption extends SlashCommandMentionableOption {
	autoSet(key: string) {
		return applyAutoSet(this, key);
	}
}

export class AutoSlashCommandAttachmentOption extends SlashCommandAttachmentOption {
	autoSet(key: string) {
		return applyAutoSet(this, key);
	}
}

export class AutoSlashCommandSubcommandBuilder extends SlashCommandSubcommandBuilder {
	autoSet(key: string) {
		return applyAutoSet(this, key);
	}

	override addStringOption(
		input:
			| SlashCommandStringOption
			| ((builder: SlashCommandStringOption) => SlashCommandStringOption)
	) {
		if (typeof input !== "function") return super.addStringOption(input);
		return super.addStringOption((builder) =>
			input(asCustomBuilder(builder, AutoSlashCommandStringOption))
		);
	}

	override addIntegerOption(
		input:
			| SlashCommandIntegerOption
			| ((builder: SlashCommandIntegerOption) => SlashCommandIntegerOption)
	) {
		if (typeof input !== "function") return super.addIntegerOption(input);
		return super.addIntegerOption((builder) =>
			input(asCustomBuilder(builder, AutoSlashCommandIntegerOption))
		);
	}

	override addNumberOption(
		input:
			| SlashCommandNumberOption
			| ((builder: SlashCommandNumberOption) => SlashCommandNumberOption)
	) {
		if (typeof input !== "function") return super.addNumberOption(input);
		return super.addNumberOption((builder) =>
			input(asCustomBuilder(builder, AutoSlashCommandNumberOption))
		);
	}

	override addBooleanOption(
		input:
			| SlashCommandBooleanOption
			| ((builder: SlashCommandBooleanOption) => SlashCommandBooleanOption)
	) {
		if (typeof input !== "function") return super.addBooleanOption(input);
		return super.addBooleanOption((builder) =>
			input(asCustomBuilder(builder, AutoSlashCommandBooleanOption))
		);
	}

	override addUserOption(
		input:
			| SlashCommandUserOption
			| ((builder: SlashCommandUserOption) => SlashCommandUserOption)
	) {
		if (typeof input !== "function") return super.addUserOption(input);
		return super.addUserOption((builder) =>
			input(asCustomBuilder(builder, AutoSlashCommandUserOption))
		);
	}

	override addChannelOption(
		input:
			| SlashCommandChannelOption
			| ((builder: SlashCommandChannelOption) => SlashCommandChannelOption)
	) {
		if (typeof input !== "function") return super.addChannelOption(input);
		return super.addChannelOption((builder) =>
			input(asCustomBuilder(builder, AutoSlashCommandChannelOption))
		);
	}

	override addRoleOption(
		input:
			| SlashCommandRoleOption
			| ((builder: SlashCommandRoleOption) => SlashCommandRoleOption)
	) {
		if (typeof input !== "function") return super.addRoleOption(input);
		return super.addRoleOption((builder) =>
			input(asCustomBuilder(builder, AutoSlashCommandRoleOption))
		);
	}

	override addMentionableOption(
		input:
			| SlashCommandMentionableOption
			| ((
				builder: SlashCommandMentionableOption
			) => SlashCommandMentionableOption)
	) {
		if (typeof input !== "function") return super.addMentionableOption(input);
		return super.addMentionableOption((builder) =>
			input(asCustomBuilder(builder, AutoSlashCommandMentionableOption))
		);
	}

	override addAttachmentOption(
		input:
			| SlashCommandAttachmentOption
			| ((
				builder: SlashCommandAttachmentOption
			) => SlashCommandAttachmentOption)
	) {
		if (typeof input !== "function") return super.addAttachmentOption(input);
		return super.addAttachmentOption((builder) =>
			input(asCustomBuilder(builder, AutoSlashCommandAttachmentOption))
		);
	}
}

export class AutoSlashCommandSubcommandGroupBuilder extends SlashCommandSubcommandGroupBuilder {
	autoSet(key: string) {
		return applyAutoSet(this, key);
	}

	override addSubcommand(
		input:
			| SlashCommandSubcommandBuilder
			| ((
				subcommandGroup: SlashCommandSubcommandBuilder
			) => SlashCommandSubcommandBuilder)
	) {
		if (typeof input !== "function") return super.addSubcommand(input);
		return super.addSubcommand((builder) =>
			input(asCustomBuilder(builder, AutoSlashCommandSubcommandBuilder))
		);
	}
}

export class ApplicationCommandBuilder extends SlashCommandBuilder {

	protected prefix_support: boolean = true;
	protected slash_support: boolean = true;

	setPrefixSupport(value: boolean = true) {
		this.prefix_support = value;
		return this;
	}

	setSlashSupport(value: boolean = true) {
		this.slash_support = value;
		return this;
	}

	autoSet(key: string) {
		return applyAutoSet(this, key);
	}

	override addStringOption(
		input:
			| SlashCommandStringOption
			| ((builder: SlashCommandStringOption) => SlashCommandStringOption)
	) {
		if (typeof input !== "function") return super.addStringOption(input);
		return super.addStringOption((builder) =>
			input(asCustomBuilder(builder, AutoSlashCommandStringOption))
		);
	}

	override addIntegerOption(
		input:
			| SlashCommandIntegerOption
			| ((builder: SlashCommandIntegerOption) => SlashCommandIntegerOption)
	) {
		if (typeof input !== "function") return super.addIntegerOption(input);
		return super.addIntegerOption((builder) =>
			input(asCustomBuilder(builder, AutoSlashCommandIntegerOption))
		);
	}

	override addNumberOption(
		input:
			| SlashCommandNumberOption
			| ((builder: SlashCommandNumberOption) => SlashCommandNumberOption)
	) {
		if (typeof input !== "function") return super.addNumberOption(input);
		return super.addNumberOption((builder) =>
			input(asCustomBuilder(builder, AutoSlashCommandNumberOption))
		);
	}

	override addBooleanOption(
		input:
			| SlashCommandBooleanOption
			| ((builder: SlashCommandBooleanOption) => SlashCommandBooleanOption)
	) {
		if (typeof input !== "function") return super.addBooleanOption(input);
		return super.addBooleanOption((builder) =>
			input(asCustomBuilder(builder, AutoSlashCommandBooleanOption))
		);
	}

	override addUserOption(
		input:
			| SlashCommandUserOption
			| ((builder: SlashCommandUserOption) => SlashCommandUserOption)
	) {
		if (typeof input !== "function") return super.addUserOption(input);
		return super.addUserOption((builder) =>
			input(asCustomBuilder(builder, AutoSlashCommandUserOption))
		);
	}

	override addChannelOption(
		input:
			| SlashCommandChannelOption
			| ((builder: SlashCommandChannelOption) => SlashCommandChannelOption)
	) {
		if (typeof input !== "function") return super.addChannelOption(input);
		return super.addChannelOption((builder) =>
			input(asCustomBuilder(builder, AutoSlashCommandChannelOption))
		);
	}

	override addRoleOption(
		input:
			| SlashCommandRoleOption
			| ((builder: SlashCommandRoleOption) => SlashCommandRoleOption)
	) {
		if (typeof input !== "function") return super.addRoleOption(input);
		return super.addRoleOption((builder) =>
			input(asCustomBuilder(builder, AutoSlashCommandRoleOption))
		);
	}

	override addMentionableOption(
		input:
			| SlashCommandMentionableOption
			| ((
				builder: SlashCommandMentionableOption
			) => SlashCommandMentionableOption)
	) {
		if (typeof input !== "function") return super.addMentionableOption(input);
		return super.addMentionableOption((builder) =>
			input(asCustomBuilder(builder, AutoSlashCommandMentionableOption))
		);
	}

	override addAttachmentOption(
		input:
			| SlashCommandAttachmentOption
			| ((
				builder: SlashCommandAttachmentOption
			) => SlashCommandAttachmentOption)
	) {
		if (typeof input !== "function") return super.addAttachmentOption(input);
		return super.addAttachmentOption((builder) =>
			input(asCustomBuilder(builder, AutoSlashCommandAttachmentOption))
		);
	}

	override addSubcommand(
		input:
			| SlashCommandSubcommandBuilder
			| ((
				subcommandGroup: SlashCommandSubcommandBuilder
			) => SlashCommandSubcommandBuilder)
	) {
		if (typeof input !== "function") return super.addSubcommand(input);
		return super.addSubcommand((builder) =>
			input(asCustomBuilder(builder, AutoSlashCommandSubcommandBuilder))
		);
	}

	override addSubcommandGroup(
		input:
			| SlashCommandSubcommandGroupBuilder
			| ((
				subcommandGroup: SlashCommandSubcommandGroupBuilder
			) => SlashCommandSubcommandGroupBuilder)
	) {
		if (typeof input !== "function") return super.addSubcommandGroup(input);
		return super.addSubcommandGroup((builder) =>
			input(asCustomBuilder(builder, AutoSlashCommandSubcommandGroupBuilder))
		);
	}

	override toJSON(): ApplicationJSONBody {
		const json = super.toJSON() as ApplicationJSONBody;
		json.prefix_support = this.prefix_support;
		json.slash_support = this.slash_support;
		this.assertNoMixedTopLevelOptionTypes(json);
		return json;
	}

	toClientJSON(
		_client: Client
	): ReturnType<ApplicationCommandBuilder["toJSON"]> {
		const json = this.toJSON();
		if (!_client.i18n) return json;
		return localizeApplicationCommand(json, _client.i18n);
	}

	private assertNoMixedTopLevelOptionTypes(json: ApplicationJSONBody) {
		const options = json.options as APIApplicationCommandOption[] | undefined;
		if (!options || options.length === 0) return;

		const hasSubcommands = options.some(
			(option) =>
				option.type === ApplicationCommandOptionType.Subcommand ||
				option.type === ApplicationCommandOptionType.SubcommandGroup
		);
		if (!hasSubcommands) return;

		const hasRegularOptions = options.some(
			(option) =>
				option.type !== ApplicationCommandOptionType.Subcommand &&
				option.type !== ApplicationCommandOptionType.SubcommandGroup
		);
		if (!hasRegularOptions) return;

		throw new Error(
			`Command "${json.name}" mixes subcommands/subcommand groups with regular options at the top level. Discord requires choosing one structure.`
		);
	}
}
