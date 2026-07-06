import { WHATSAPP_STATUS } from "../../../constants/index.js";

export class WhatsappInstance {

    constructor(instanceId) {

        this.id = instanceId;

        this.status = WHATSAPP_STATUS.DISCONNECTED;

        this.socket = null;

        this.connected = false;

        this.qr = null;

        this.createdAt = new Date().toISOString();

        this.updatedAt = new Date().toISOString();

        this.connectedAt = null;

        this.disconnectedAt = null;

        this.startedAt = null;

        this.lastReconnectAt = null;

        this.lastDisconnectReason = null;

        this.lastError = null;

        this.reconnectAttempts = 0;

        this.messages = [];

        this.metadata = {};

        this.runtime = {};

        this.health = {};

        this.statistics = {};

        this.configuration = {};

    }

    touch() {

        this.updatedAt = new Date().toISOString();

    }

}