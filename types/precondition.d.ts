import type { MaybePromise } from "./extra.js";
import type {
	InteractionContextJSON,
	MessageContextJSON,
} from "../src/structures/builder/Context.js";

type CommandContext = MessageContextJSON | InteractionContextJSON;

export interface IPrecondition {
	name: string;
	run: (ctx: CommandContext) => MaybePromise<boolean>;
	errorMessage: string;
}