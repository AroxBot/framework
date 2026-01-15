import chalk from "chalk";

export class LoggerInstance {
	constructor() { }

	private get timestamp(): string {
		return chalk.gray(`[${new Date().toLocaleTimeString()}]`);
	}

	log(...args: any[]) {
		console.log(this.timestamp, chalk.bgBlue.bold("LOG"), ...args);
	}

	warn(...args: any[]) {
		console.warn(this.timestamp, chalk.bgYellow.bold("WARN"), ...args);
	}

	error(...args: any[]) {
		console.error(this.timestamp, chalk.bgRed.bold("ERROR"), ...args);
	}

	debug(...args: any[]) {
		console.debug(this.timestamp, chalk.bgMagenta.bold("DEBUG"), ...args);
	}
}

