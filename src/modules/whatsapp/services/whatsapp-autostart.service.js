import { logger } from "../../../core/logger.js";
import { WHATSAPP_DEFAULT_INSTANCE_ID } from "../../../constants/index.js";

import {
    listInstanceCompanyBindings
} from "./instance-company-resolver.service.js";

import {
    startWhatsappRuntime
} from "./whatsapp-runtime-action.service.js";

export async function autoStartWhatsappRuntimes() {
    const bindings = listInstanceCompanyBindings();

    if (!bindings.length) {
        logger.info("WhatsApp AutoStart: nenhuma instância vinculada.");
        return [];
    }

    const results = [];

    for (const binding of bindings) {
        const instanceId = binding.instanceId || WHATSAPP_DEFAULT_INSTANCE_ID;

        try {
            const runtime = await startWhatsappRuntime(instanceId);

            results.push({
                instanceId,
                started: true,
                runtime
            });

            logger.success(`WhatsApp AutoStart iniciado. Instância: ${instanceId}`);
        } catch (error) {
            results.push({
                instanceId,
                started: false,
                error: error.message
            });

            logger.error(`WhatsApp AutoStart falhou. Instância: ${instanceId}`, error);
        }
    }

    return results;
}