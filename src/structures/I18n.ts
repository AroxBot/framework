import { Logger } from "../utils/logger/Logger";
import { getFiles } from "../utils/Files";
import { get } from "lodash";

export class I18n {
    public locales: Map<string, Record<string, any>> = new Map();
    public defaultLocale: string;
    private logger: Logger;

    constructor(defaultLocale: string = "en-US", logger: Logger) {
        this.defaultLocale = defaultLocale;
        this.logger = logger;
    }

    public async loadLocales(dir: string) {
        if (!require("fs").existsSync(dir)) {
            this.logger.warn(`Locales directory not found: ${dir}`);
            return;
        }

        const files = getFiles(dir);

        for (const file of files) {
            try {
                const localeName = file.split(/[\\/]/).pop()?.split(".")[0];
                if (!localeName) continue;

                delete require.cache[require.resolve(file)];
                const content = require(file);
                this.locales.set(localeName, content);
                this.logger.debug(`Loaded locale: ${localeName}`);
            } catch (error) {
                this.logger.error(`Error loading locale ${file}:`, error);
            }
        }

        this.logger.info(`Loaded ${this.locales.size} locales.`);
    }

    public t(locale: string, key: string, args?: Record<string, any>): string {
        const lang = this.locales.get(locale) || this.locales.get(this.defaultLocale);

        if (!lang) return key;

        let value = get(lang, key);

        if (!value && locale !== this.defaultLocale) {
            const defaultLang = this.locales.get(this.defaultLocale);
            value = get(defaultLang, key);
        }

        if (!value) return key;

        if (typeof value !== "string") return value;

        if (args) {
            for (const [k, v] of Object.entries(args)) {
                value = value.replace(new RegExp(`{${k}}`, "g"), String(v));
            }
        }

        return value;
    }
}
