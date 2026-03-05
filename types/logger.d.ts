import type { Color } from "colorette";
import type { LogLevel } from "../src/utils/logger/ILogger.js";
import type {
	LoggerStyleBackground,
	LoggerStyleEffect,
	LoggerStyleText,
} from "../src/utils/logger/Logger.js";

export interface ILogger {
	has(level: LogLevel): boolean;
	trace(...values: readonly unknown[]): void;
	debug(...values: readonly unknown[]): void;
	info(...values: readonly unknown[]): void;
	warn(...values: readonly unknown[]): void;
	error(...values: readonly unknown[]): void;
	fatal(...values: readonly unknown[]): void;
	write(level: LogLevel, ...values: readonly unknown[]): void;
}

export interface LoggerOptions {
	stdout?: NodeJS.WritableStream;
	stderr?: NodeJS.WritableStream;
	defaultFormat?: LoggerLevelOptions;
	format?: LoggerFormatOptions;
	level?: LogLevel;
	join?: string;
	depth?: number;
}

export interface LoggerFormatOptions {
	trace?: LoggerLevelOptions;
	debug?: LoggerLevelOptions;
	info?: LoggerLevelOptions;
	warn?: LoggerLevelOptions;
	error?: LoggerLevelOptions;
	fatal?: LoggerLevelOptions;
	none?: LoggerLevelOptions;
}

export interface LoggerLevelOptions {
	timestamp?: LoggerTimestampOptions | null;
	infix?: string;
	message?: LoggerStyleResolvable | null;
}

export interface LoggerTimestampOptions {
	pattern?: string;
	utc?: boolean;
	color?: LoggerStyleResolvable | null;
	formatter?: LoggerTimestampFormatter;
}

export interface LoggerTimestampFormatter {
	(timestamp: string): string;
}

export interface LoggerStyleOptions {
	effects?: LoggerStyleEffect[];
	text?: LoggerStyleText;
	background?: LoggerStyleBackground;
}

export type LoggerStyleResolvable = Color | LoggerStyleOptions;
