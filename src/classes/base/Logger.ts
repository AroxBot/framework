import chalk from "chalk";
export type LogLevel = "debug" | "log" | "warn" | "error";

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
	debug: 0,
	log: 1,
	warn: 2,
	error: 3,
};

export class LoggerInstance {
	private level: LogLevel;

	constructor(level: LogLevel = "log") {
		this.level = level;
	}

	private shouldLog(level: LogLevel): boolean {
		return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[this.level];
	}

	private get timestamp(): string {
		return chalk.gray(`[${new Date().toISOString()}]`);
	}

	log(...args: any[]) {
		if (!this.shouldLog("log")) return;
		console.log(this.timestamp, chalk.bgBlue.bold("LOG"), ...args);
	}

	warn(...args: any[]) {
		if (!this.shouldLog("warn")) return;
		console.warn(this.timestamp, chalk.bgYellow.bold("WARN"), ...args);
	}

	error(...args: any[]) {
		if (!this.shouldLog("error")) return;
		console.error(this.timestamp, chalk.bgRed.bold("ERROR"), ...args);
	}

	debug(...args: any[]) {
		if (!this.shouldLog("debug")) return;
		console.debug(this.timestamp, chalk.bgMagenta.bold("DEBUG"), ...args);
	}
}
