import {
    companyPostgresRepository
} from "../src/database/repositories/company.postgres.repository.js";

import {
    syncWhatsappRuntime,
    markWhatsappRuntimeConnected,
    markWhatsappRuntimeDisconnected,
    getPersistedWhatsappRuntime
} from "../src/database/runtime/runtime-sync.service.js";

import {
    loadWhatsappRuntimeState
} from "../src/database/runtime/runtime-loader.service.js";

async function main() {
    console.log("");
    console.log("======================================");
    console.log(" MEDSTACK RUNTIME SYNC TEST");
    console.log("======================================");
    console.log("");

    const company =
        await companyPostgresRepository.findCompanyBySlug(
            "empresa-teste"
        );

    if (!company) {
        throw new Error(
            "Empresa Teste não encontrada. Execute npm run db:seed."
        );
    }

    console.log("Company OK:", company.name);

    const instanceKey = "runtime-sync-test";

    const syncResult = await syncWhatsappRuntime({
        companyId: company.id,
        instanceId: instanceKey,
        provider: "baileys",

        status: {
            status: "connecting",
            connected: false,
            hasQr: true,
            reconnectAttempt: 0
        },

        socket: {
            hasSocket: true,
            alive: true,
            reconnectScheduled: false
        },

        monitor: {
            active: true,
            intervalMs: 30000,
            lastCheckAt: new Date().toISOString()
        },

        dispatcher: {
            pending: 0,
            processing: 0,
            completed: 0,
            failed: 0
        },

        worker: {
            running: false,
            idle: true,
            processed: 0,
            failed: 0
        },

        statistics: {
            inbound: 0,
            outbound: 0,
            delivered: 0,
            read: 0,
            failed: 0
        }
    });

    console.log("Sync OK:", syncResult.action);

    const connectedResult =
        await markWhatsappRuntimeConnected({
            companyId: company.id,
            instanceKey,
            provider: "baileys",
            phone: "5535999999999",
            displayName: "MedStack Test"
        });

    console.log(
        "Connected OK:",
        connectedResult.instance.sessionStatus
    );

    const persisted =
        await getPersistedWhatsappRuntime(
            company.id,
            instanceKey
        );

    console.log(
        "Persisted Runtime OK:",
        persisted.instanceKey
    );

    const loaded =
        await loadWhatsappRuntimeState(
            company.id,
            instanceKey
        );

    console.log(
        "Loader OK:",
        loaded.sessionStatus
    );

    const disconnectedResult =
        await markWhatsappRuntimeDisconnected({
            companyId: company.id,
            instanceKey,
            error: "Desconexão simulada para teste."
        });

    console.log(
        "Disconnected OK:",
        disconnectedResult.instance.sessionStatus
    );

    console.log("");
    console.log("RUNTIME SYNC TEST OK");
    console.log("");

    process.exit(0);
}

main().catch((error) => {
    console.error("");
    console.error("RUNTIME SYNC TEST ERROR");
    console.error(error);
    console.error("");

    process.exit(1);
});