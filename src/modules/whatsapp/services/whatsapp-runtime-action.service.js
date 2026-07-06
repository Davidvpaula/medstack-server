import { WHATSAPP_DEFAULT_INSTANCE_ID } from "../../../constants/index.js";

import {
    startWhatsappConnection,
    restartWhatsappConnection,
    getWhatsappStatus
} from "./connection.service.js";

import { getWhatsappRuntime } from "./whatsapp-runtime.service.js";

export async function startWhatsappRuntime(instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
    await startWhatsappConnection(instanceId);

    return getWhatsappRuntime(instanceId);
}

export async function restartWhatsappRuntime(instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
    await restartWhatsappConnection(instanceId);

    return getWhatsappRuntime(instanceId);
}

export function getWhatsappRuntimeStatus(instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
    return {
        status: getWhatsappStatus(instanceId),
        runtime: getWhatsappRuntime(instanceId)
    };
}