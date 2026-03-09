import type {
	PreconditionCheckResult,
	PreconditionTranslateOptions,
	PreconditionRun,
} from "#types/precondition.js";
import type { TemplateContext } from "#types/client.js";
export type { PreconditionTranslateOptions };

export interface PreconditionOptions {
	name: string;
	run: PreconditionRun;
}

export interface FailedPrecondition {
	precondition: Precondition;
	translateOptions?: PreconditionTranslateOptions;
}

export class Precondition {
	public readonly name: string;
	#run: PreconditionRun;

	public constructor(options: PreconditionOptions) {
		this.name = options.name;
		this.#run = options.run;
	}

	public async check(
		context: TemplateContext
	): Promise<PreconditionCheckResult> {
		const result = await this.#run(context);
		if (typeof result === "boolean") return [result];
		return result;
	}

	public setRun(run: PreconditionRun) {
		this.#run = run;
		return this;
	}

	public getErrorKey(): string {
		return `error:precondition.${this.name}`;
	}
}
