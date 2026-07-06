import { WHATSAPP_DEFAULT_INSTANCE_ID } from "../../../constants/index.js";
import { WhatsappInstance } from "../entities/whatsapp-instance.entity.js";

class WhatsappInstanceManager {
    constructor() {
        this.instances = new Map();

        this.ensureInstance(WHATSAPP_DEFAULT_INSTANCE_ID);
    }

    ensureInstance(instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
        if (!this.instances.has(instanceId)) {
            this.instances.set(
                instanceId,
                new WhatsappInstance(instanceId)
            );
        }

        return this.instances.get(instanceId);
    }

    getInstance(instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
        return this.ensureInstance(instanceId);
    }

    getAllInstances() {
        return Array.from(this.instances.values());
    }

    setSocket(instanceId = WHATSAPP_DEFAULT_INSTANCE_ID, socket) {
        const instance = this.ensureInstance(instanceId);

        instance.socket = socket;
        instance.touch();

        return instance;
    }

    getSocket(instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
        return this.ensureInstance(instanceId).socket;
    }

    hasSocket(instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
        return Boolean(this.getSocket(instanceId));
    }

    removeSocket(instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
        const instance = this.ensureInstance(instanceId);

        instance.socket = null;
        instance.touch();

        return instance;
    }

    setMetadata(instanceId = WHATSAPP_DEFAULT_INSTANCE_ID, metadata = {}) {
        const instance = this.ensureInstance(instanceId);

        instance.metadata = {
            ...instance.metadata,
            ...metadata
        };

        instance.touch();

        return instance;
    }

    setRuntime(instanceId = WHATSAPP_DEFAULT_INSTANCE_ID, runtime = {}) {
        const instance = this.ensureInstance(instanceId);

        instance.runtime = {
            ...instance.runtime,
            ...runtime
        };

        instance.touch();

        return instance;
    }

    setHealth(instanceId = WHATSAPP_DEFAULT_INSTANCE_ID, health = {}) {
        const instance = this.ensureInstance(instanceId);

        instance.health = {
            ...instance.health,
            ...health
        };

        instance.touch();

        return instance;
    }

    setStatistics(instanceId = WHATSAPP_DEFAULT_INSTANCE_ID, statistics = {}) {
        const instance = this.ensureInstance(instanceId);

        instance.statistics = {
            ...instance.statistics,
            ...statistics
        };

        instance.touch();

        return instance;
    }

    setConfiguration(instanceId = WHATSAPP_DEFAULT_INSTANCE_ID, configuration = {}) {
        const instance = this.ensureInstance(instanceId);

        instance.configuration = {
            ...instance.configuration,
            ...configuration
        };

        instance.touch();

        return instance;
    }

    resetInstance(instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
        this.instances.set(
            instanceId,
            new WhatsappInstance(instanceId)
        );

        return this.instances.get(instanceId);
    }

    removeInstance(instanceId = WHATSAPP_DEFAULT_INSTANCE_ID) {
        return this.instances.delete(instanceId);
    }
}

export const whatsappInstanceManager = new WhatsappInstanceManager();