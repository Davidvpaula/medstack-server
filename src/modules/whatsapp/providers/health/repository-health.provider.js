import { whatsappRepository } from "../../repositories/whatsapp.repository.js";

export function getRepositoryHealth() {
    const snapshot = whatsappRepository.getSnapshot();

    return {
        status: snapshot.status,
        connected: snapshot.connected,
        hasQr: Boolean(snapshot.qr),
        messagesCount: snapshot.messages.length,
        reconnectAttempts: snapshot.reconnectAttempts,
        startedAt: snapshot.startedAt,
        connectedAt: snapshot.connectedAt,
        disconnectedAt: snapshot.disconnectedAt,
        lastReconnectAt: snapshot.lastReconnectAt,
        lastDisconnectReason: snapshot.lastDisconnectReason,
        lastError: snapshot.lastError
    };
}