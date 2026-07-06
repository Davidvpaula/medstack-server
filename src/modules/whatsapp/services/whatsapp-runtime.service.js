import { WHATSAPP_DEFAULT_INSTANCE_ID } from "../../../constants/index.js";

import { whatsappRepository } from "../repositories/whatsapp.repository.js";
import { whatsappConnectionManager } from "./connection-manager.service.js";
import { whatsappSocketLifecycle } from "./socket-lifecycle.service.js";

import {
    listWhatsAppProviders
} from "../providers/whatsapp-provider.factory.js";

import {
    getInstanceCompanyBinding,
    listInstanceCompanyBindings
} from "./instance-company-resolver.service.js";

import {
    getWhatsappHealthMonitorState
} from "./whatsapp-health-monitor.service.js";

import {
    getRuntimeState
} from "./whatsapp-runtime-state.service.js";

export function getWhatsappRuntime(
    instanceId = WHATSAPP_DEFAULT_INSTANCE_ID
) {

    const status =
        whatsappRepository.getStatusSnapshot(instanceId);

    const qr =
        whatsappRepository.getQrSnapshot(instanceId);

    const health =
        whatsappConnectionManager.getHealth(instanceId);

    return {

        instanceId,

        companyBinding:
            getInstanceCompanyBinding(instanceId),

        bindings:
            listInstanceCompanyBindings(),

        status,

        qr: {
            hasQr: Boolean(qr.qr),
            connected: qr.connected,
            status: qr.status
        },

        socket: {
            hasSocket:
                whatsappSocketLifecycle.hasSocket(instanceId),

            alive:
                whatsappSocketLifecycle.isSocketAlive(instanceId)
        },

        health,

        monitor:
            getWhatsappHealthMonitorState(instanceId),

        // NOVO
        ...getRuntimeState(),

        providers:
            listWhatsAppProviders(),

        createdAt:
            status.createdAt || null,

        updatedAt:
            status.updatedAt || null

    };

}