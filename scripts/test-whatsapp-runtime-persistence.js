import {
    companyPostgresRepository
} from "../src/database/repositories/company.postgres.repository.js";

import {
    bindInstanceToCompany,
    resolveCompanyIdFromInstancePersistent
} from "../src/modules/whatsapp/services/instance-company-resolver.service.js";

import {
    persistWhatsappRuntime
} from "../src/modules/whatsapp/services/whatsapp-runtime-persistence.service.js";

import {
    whatsappInstancePostgresRepository
} from "../src/database/repositories/whatsapp-instance.postgres.repository.js";

async function main() {
    console.log("");
    console.log("============================================");
    console.log(" WHATSAPP RUNTIME PERSISTENCE TEST");
    console.log("============================================");
    console.log("");

    const company =
        await companyPostgresRepository
            .findCompanyBySlug("empresa-teste");

    if (!company) {
        throw new Error(
            "Empresa Teste não encontrada."
        );
    }

    const instanceId = "main";

    const binding =
        await bindInstanceToCompany(
            instanceId,
            company.id
        );

    console.log(
        "Binding OK:",
        binding.instanceId,
        binding.companyId
    );

    const resolvedCompanyId =
        await resolveCompanyIdFromInstancePersistent(
            instanceId
        );

    console.log(
        "Resolver OK:",
        resolvedCompanyId
    );

    const persistenceResult =
        await persistWhatsappRuntime(instanceId);

    console.log(
        "Persistence OK:",
        persistenceResult.action
    );

    const instance =
        await whatsappInstancePostgresRepository
            .findInstanceByKey(
                company.id,
                instanceId
            );

    if (!instance) {
        throw new Error(
            "Instância não foi persistida."
        );
    }

    console.log(
        "Database Instance OK:",
        instance.instanceKey
    );

    console.log(
        "Session Status:",
        instance.sessionStatus
    );

    console.log("");
    console.log(
        "WHATSAPP RUNTIME PERSISTENCE TEST OK"
    );
    console.log("");

    process.exit(0);
}

main().catch((error) => {
    console.error("");
    console.error(
        "WHATSAPP RUNTIME PERSISTENCE TEST ERROR"
    );
    console.error(error);
    console.error("");

    process.exit(1);
});