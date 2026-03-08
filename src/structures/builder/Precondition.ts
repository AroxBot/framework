import type { IPrecondition } from "#types/precondition.js";
import type {
	InteractionContextJSON,
	MessageContextJSON,
} from "@structures/builder/Context.js";

type CommandContext = MessageContextJSON | InteractionContextJSON;

export class Precondition {
	readonly name: string;
	readonly errorMessage: string;
	readonly #run: (ctx: CommandContext) => boolean | Promise<boolean>;

	constructor(data: IPrecondition) {
		this.name = data.name;
		this.errorMessage = data.errorMessage;
		this.#run = data.run;
	}

	async check(ctx: CommandContext): Promise<boolean> {
		return this.#run(ctx);
	}
}