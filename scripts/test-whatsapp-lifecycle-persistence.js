import {
    companyPostgresRepository
} from "../src/database/repositories/company.postgres.repository.js";

import {
    bindInstanceToCompany
} from "../src/modules/whatsapp/services/instance-company-resolver.service.js";

import {
    startWhatsappRuntimeFlusher,
    flushWhatsappRuntime,
    stopWhatsappRuntimeFlusher
} from "../src/modules/whatsapp/services/whatsapp-runtime-flusher.service.js";

import {
    persistWhatsappConnected,
    persistWhatsappDisconnected
} from "../src/modules/whatsapp/services/whatsapp-runtime-persistence.service.js";

import {
    getWhatsappPersistenceStatus
} from "../src/modules/whatsapp/services/whatsapp-persistence-status.service.js";

async function main() {
    console.log("");
    console.log("============================================");
    console.log(" WHATSAPP LIFECYCLE PERSISTENCE TEST");
    console.log("============================================");
    console.log("");

    const company =
        await companyPostgresRepository
            .findCompanyBySlug(
                "empresa-teste"
            );

    if (!company) {
        throw new Error(
            "Empresa Teste não encontrada."
        );
    }

    const instanceId =
        "lifecycle-test";

    await bindInstanceToCompany(
        instanceId,
        company.id
    );

    console.log(
        "Binding OK:",
        instanceId
    );

    startWhatsappRuntimeFlusher(
        instanceId,
        {
            intervalMs: 10000
        }
    );

    console.log(
        "Flusher OK"
    );

    await persistWhatsappConnected(
        instanceId,
        {
            phone:
                "5535999999999",
            displayName:
                "Lifecycle Test"
        }
    );

    console.log(
        "Connected Persistence OK"
    );

    await flushWhatsappRuntime(
        instanceId
    );

    console.log(
        "Snapshot OK"
    );

    let status =
        await getWhatsappPersistenceStatus(
            instanceId
        );

    console.log(
        "Active Status:",
        status.status
    );

    await persistWhatsappDisconnected(
        instanceId,
        "Teste de desligamento."
    );

    console.log(
        "Disconnected Persistence OK"
    );

    status =
        await getWhatsappPersistenceStatus(
            instanceId
        );

    console.log(
        "Final Session Status:",
        status.databaseInstance.sessionStatus
    );

    stopWhatsappRuntimeFlusher(
        instanceId
    );

    console.log(
        "Flusher Stopped OK"
    );

    console.log("");
    console.log(
        "WHATSAPP LIFECYCLE PERSISTENCE TEST OK"
    );
    console.log("");

    process.exit(0);
}

main().catch((error) => {
    console.error("");
    console.error(
        "WHATSAPP LIFECYCLE PERSISTENCE TEST ERROR"
    );
    console.error(error);
    console.error("");

    process.exit(1);
});