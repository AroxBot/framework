import { ChatInputCommandInteraction, Message } from "discord.js";
import { Context, Client } from "#structures";
import { currentClient } from "#ctx";
import { MaybePromise } from "#types/extra.js";

export type PreconditionResult =
    | { ok: true }
    | { ok: false, message: string };

export type PreconditionHandler = (
    ctx: Context<ChatInputCommandInteraction | Message>
) => MaybePromise<PreconditionResult>;

export class PreconditionBuilder {
    public readonly client: Client;
    private handler?: PreconditionHandler;

    constructor(public readonly name: string) {
        const client = currentClient;
        if (!client) throw new Error("Client is not defined");
        this.client = client;

        if (this.client.preconditions.has(this.name)) {
            throw new Error(`Precondition "${this.name}" is already registered.`);
        }

        this.client.preconditions.set(this.name, this);
        this.client.logger.debug(`Loaded Precondition ${this.name}`);
    }

    public onExecute(func: PreconditionHandler) {
        this.handler = func;
        return this;
    }

    public async run(ctx: Context<ChatInputCommandInteraction | Message>): Promise<PreconditionResult> {
        if (!this.handler) {
            return { ok: true };
        }
        return await this.handler(ctx);
    }
}
