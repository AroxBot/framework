import type { TOptions } from "i18next";

export type MaybePromise<T> = Promise<T> | T;
export type TranslateOptions = TOptions & {
	defaultValue?: string;
};
