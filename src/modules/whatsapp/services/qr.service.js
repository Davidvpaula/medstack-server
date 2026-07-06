import { WHATSAPP_DEFAULT_INSTANCE_ID } from "../../../constants/index.js";
import { whatsappRepository } from "../repositories/whatsapp.repository.js";

export function getWhatsappQr(instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
    return whatsappRepository.getQrSnapshot(instanceId);
}