import { Client } from "./structures/index.js";

// Birden fazla client olursa hata çıkartabilir ama aklıma gelen tek şey bu
export let currentClient: Client | null = null;

export function setClient(client: Client) {
	currentClient = client;
}

export function clearClient() {
	currentClient = null;
}
