import { whatsappConnectionManager } from "../../services/connection-manager.service.js";

export function getSocketHealth() {
    return whatsappConnectionManager.getHealth();
}