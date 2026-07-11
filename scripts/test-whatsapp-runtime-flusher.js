import {
    companyPostgresRepository
} from "../src/database/repositories/company.postgres.repository.js";

import {
    bindInstanceToCompany
} from "../src/modules/whatsapp/services/instance-company-resolver.service.js";

import {
    startWhatsappRuntimeFlusher,
    flushWhatsappRuntime,
    getWhatsappRuntimeFlusherState,
    stopWhatsappRuntimeFlusher
} from "../src/modules/whatsapp/services/whatsapp-runtime-flusher.service.js";

import {
    getWhatsappPersistenceStatus
} from "../src/modules/whatsapp/services/whatsapp-persistence-status.service.js";

async function main() {
    console.log("");
    console.log("============================================");
    console.log(" WHATSAPP RUNTIME FLUSHER TEST");
    console.log("============================================");
    console.log("");

    const company =
        await companyPostgresRepository
            .findCompanyBySlug("empresa-teste");

    if (!company) {
        throw new Error(
            "Empresa Teste não encontrada. Rode npm run db:seed."
        );
    }

    const instanceId = "main";

    await bindInstanceToCompany(
        instanceId,
        company.id
    );

    console.log(
        "Binding OK:",
        instanceId,
        company.id
    );

    const started =
        startWhatsappRuntimeFlusher(
            instanceId,
            {
                intervalMs: 10000
            }
        );

    console.log(
        "Flusher Started:",
        started.active
    );

    const flushResult =
        await flushWhatsappRuntime(
            instanceId
        );

    console.log(
        "Manual Flush OK:",
        flushResult.flushed
    );

    const state =
        getWhatsappRuntimeFlusherState(
            instanceId
        );

    console.log(
        "Successful Flushes:",
        state.successfulFlushes
    );

    const persistenceStatus =
        await getWhatsappPersistenceStatus(
            instanceId
        );

    console.log(
        "Persistence Status:",
        persistenceStatus.status
    );

    const stopped =
        stopWhatsappRuntimeFlusher(
            instanceId
        );

    console.log(
        "Flusher Stopped:",
        stopped.stopped
    );

    console.log("");
    console.log(
        "WHATSAPP RUNTIME FLUSHER TEST OK"
    );
    console.log("");

    process.exit(0);
}

main().catch((error) => {
    console.error("");
    console.error(
        "WHATSAPP RUNTIME FLUSHER TEST ERROR"
    );
    console.error(error);
    console.error("");

    process.exit(1);
});