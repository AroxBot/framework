import { Client } from "../structures/Client";
import { Event } from "../structures/Event";
import fs from "fs";
import path from "path";

export class EventHandler {
	public readonly client: Client;

	constructor(client: Client) {
		this.client = client;
	}

	public async loadEvents(dir: string) {
		const files = this.getFiles(dir);
		for (const file of files) {
			try {
				delete require.cache[require.resolve(file)];
				const { default: EventClass } = await require(file);

				if (!EventClass || !(EventClass.prototype instanceof Event)) {
					continue;
				}

				const event: Event<any> = new EventClass(this.client);
				if (event.once) {
					this.client.once(event.name, (...args) => event.execute(...args));
				} else {
					this.client.on(event.name, (...args) => event.execute(...args));
				}

				this.client.logger.debug(`Loaded event: ${event.name}`);
			} catch (error) {
				this.client.logger.error(`Error loading event ${file}:`, error);
			}
		}
	}

	private getFiles(dir: string, fileList: string[] = []): string[] {
		if (!fs.existsSync(dir)) return [];
		const files = fs.readdirSync(dir);
		for (const file of files) {
			const filePath = path.join(dir, file);
			if (fs.statSync(filePath).isDirectory()) {
				this.getFiles(filePath, fileList);
			} else if (file.endsWith(".ts") || file.endsWith(".js")) {
				fileList.push(filePath);
			}
		}
		return fileList;
	}
}
