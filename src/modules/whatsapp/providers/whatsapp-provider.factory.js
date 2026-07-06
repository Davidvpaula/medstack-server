import { AppError } from "../../../core/errors/AppError.js";

import { BaileysProvider } from "./baileys/baileys.provider.js";
import { MetaProvider } from "./meta/meta.provider.js";

const providers = {
    baileys: new BaileysProvider(),
    meta: new MetaProvider()
};

export function getWhatsAppProvider(providerName = "baileys") {
    const provider = providers[providerName];

    if (!provider) {
        throw new AppError("Provider de WhatsApp não encontrado.", 404);
    }

    return provider;
}

export function listWhatsAppProviders() {
    return Object.keys(providers).map((key) => ({
        key,
        name: providers[key].name,
        status: providers[key].status
    }));
}