import {
    getNodeHealth,
    getSocketHealth,
    getRepositoryHealth
} from "../providers/health/index.js";

export function getWhatsappHealth() {
    return {
        repository: getRepositoryHealth(),
        socket: getSocketHealth(),
        node: getNodeHealth()
    };
}