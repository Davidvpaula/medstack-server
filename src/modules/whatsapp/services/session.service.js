import fs from "fs/promises";

import { WHATSAPP_DEFAULT_INSTANCE_ID } from "../../../constants/index.js";

const SESSION_BASE_PATH = "./sessions";

function sanitizeInstanceId(instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
    return String(instanceId)
        .trim()
        .replace(/[^a-zA-Z0-9._-]/g, "_");
}

export function getWhatsappSessionPath(instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
    const safeInstanceId = sanitizeInstanceId(instanceId);

    return `${SESSION_BASE_PATH}/${safeInstanceId}`;
}

export async function removeWhatsappSession(instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
    await fs.rm(getWhatsappSessionPath(instanceId), {
        recursive: true,
        force: true
    });
}