import { companyPostgresRepository } from "../repositories/company.postgres.repository.js";
import { userPostgresRepository } from "../repositories/user.postgres.repository.js";
import { whatsappInstancePostgresRepository } from "../repositories/whatsapp-instance.postgres.repository.js";

export async function runDevSeed() {
    const company = await seedCompany();

    const user = await seedAdminUser(company.id);

    const whatsappInstance = await seedWhatsappInstance(company.id);

    return {
        seeded: true,
        company,
        user,
        whatsappInstance
    };
}

async function seedCompany() {
    const existing = await companyPostgresRepository.findCompanyBySlug(
        "empresa-teste"
    );

    if (existing) {
        return existing;
    }

    return companyPostgresRepository.createCompany({
        name: "Empresa Teste",
        slug: "empresa-teste",
        email: "teste@medstack.local",
        phone: "35999999999",
        plan: "dev",
        status: "active",
        metadata: {
            seed: true
        }
    });
}

async function seedAdminUser(companyId) {
    const existing = await userPostgresRepository.findUserByEmail(
        companyId,
        "admin@medstack.local"
    );

    if (existing) {
        return existing;
    }

    return userPostgresRepository.createUser({
        companyId,
        name: "Admin MedStack",
        email: "admin@medstack.local",
        role: "owner",
        status: "active",
        metadata: {
            seed: true
        }
    });
}

async function seedWhatsappInstance(companyId) {
    const existing = await whatsappInstancePostgresRepository.findInstanceByKey(
        companyId,
        "main"
    );

    if (existing) {
        return existing;
    }

    return whatsappInstancePostgresRepository.createInstance({
        companyId,
        instanceKey: "main",
        provider: "baileys",
        status: "idle",
        sessionStatus: "disconnected",
        metadata: {
            seed: true
        }
    });
}