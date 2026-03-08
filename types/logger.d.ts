import type { Color } from "colorette";
import type { Console } from "node:console";
import type { LogLevel } from "../src/utils/logger/ILogger.js";
import type {
	LoggerStyleBackground,
	LoggerStyleEffect,
	LoggerStyleText,
} from "../src/utils/logger/Logger.js";

export interface ILogger {
	has(level: LogLevel): boolean;
	trace(...values: LoggerValues): void;
	debug(...values: LoggerValues): void;
	info(...values: LoggerValues): void;
	warn(...values: LoggerValues): void;
	error(...values: LoggerValues): void;
	fatal(...values: LoggerValues): void;
	write(level: LogLevel, ...values: LoggerValues): void;
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

export type LoggerValues = Parameters<Console["log"]>;

export type LoggerStyleResolvable = Color | LoggerStyleOptions;
