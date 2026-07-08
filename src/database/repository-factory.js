import { companyPostgresRepository } from "./repositories/company.postgres.repository.js";
import { userPostgresRepository } from "./repositories/user.postgres.repository.js";
import { whatsappInstancePostgresRepository } from "./repositories/whatsapp-instance.postgres.repository.js";

const repositories = {
    company: companyPostgresRepository,
    user: userPostgresRepository,
    whatsappInstance: whatsappInstancePostgresRepository
};

export function getRepository(name) {
    const repository = repositories[name];

    if (!repository) {
        throw new Error(`Repository "${name}" não encontrado.`);
    }

    return repository;
}

export function listRepositories() {
    return Object.keys(repositories);
}