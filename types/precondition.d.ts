import type { MaybePromise, TranslateOptions } from "./extra.js";
import type { TemplateContext } from "./client.js";

export type PreconditionTranslateOptions = TranslateOptions;

export type PreconditionCheckResult = [
	success: boolean,
	options?: PreconditionTranslateOptions,
];

export type PreconditionRun = (
	context: TemplateContext
) => MaybePromise<boolean | PreconditionCheckResult>;

export interface IPrecondition {
	name: string;
	run: PreconditionRun;
}
