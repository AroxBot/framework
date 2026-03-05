//https://github.com/sapphiredev/framework/tree/main/src/lib/utils/logger

/**
 * The logger levels for the {@link ILogger}.
 */
export enum LogLevel {
	/**
	 * The lowest log level, used when calling {@link ILogger.trace}.
	 */
	Trace = 10,

	/**
	 * The debug level, used when calling {@link ILogger.debug}.
	 */
	Debug = 20,

	/**
	 * The info level, used when calling {@link ILogger.info}.
	 */
	Info = 30,

	/**
	 * The warning level, used when calling {@link ILogger.warn}.
	 */
	Warn = 40,

	/**
	 * The error level, used when calling {@link ILogger.error}.
	 */
	Error = 50,

	/**
	 * The critical level, used when calling {@link ILogger.fatal}.
	 */
	Fatal = 60,

	/**
	 * An unknown or uncategorized level.
	 */
	None = 100,
}

export type { ILogger } from "#types/logger.js";
