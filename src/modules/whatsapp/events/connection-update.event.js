import { WHATSAPP_DEFAULT_INSTANCE_ID } from "../../../constants/index.js";
import { handleWhatsappConnectionUpdate } from "../services/connection.service.js";

export async function handleConnectionUpdate(
    update,
    reconnectCallback,
    instanceId = WHATSAPP_DEFAULT_INSTANCE_ID
) {
    await handleWhatsappConnectionUpdate(
        update,
        reconnectCallback,
        instanceId
    );
}