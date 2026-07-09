import { companyPostgresRepository } from "../src/database/repositories/company.postgres.repository.js";
import { userPostgresRepository } from "../src/database/repositories/user.postgres.repository.js";
import { whatsappInstancePostgresRepository } from "../src/database/repositories/whatsapp-instance.postgres.repository.js";
import { contactPostgresRepository } from "../src/database/repositories/contact.postgres.repository.js";
import { conversationPostgresRepository } from "../src/database/repositories/conversation.postgres.repository.js";
import { messagePostgresRepository } from "../src/database/repositories/message.postgres.repository.js";

async function main() {
    console.log("");
    console.log("======================================");
    console.log(" MEDSTACK POSTGRES REPOSITORIES TEST");
    console.log("======================================");
    console.log("");

    const company =
        await companyPostgresRepository.findCompanyBySlug("empresa-teste");

    if (!company) {
        throw new Error("Empresa Teste não encontrada. Crie a empresa antes do teste.");
    }

    console.log("Company OK:", company.name);

    const user = await userPostgresRepository.createUser({
        companyId: company.id,
        name: "Usuário Teste",
        email: `user-${Date.now()}@medstack.local`,
        role: "admin"
    });

    console.log("User OK:", user.email);

    const instance = await whatsappInstancePostgresRepository.createInstance({
        companyId: company.id,
        instanceKey: `main-${Date.now()}`,
        provider: "baileys",
        status: "idle"
    });

    console.log("Instance OK:", instance.instanceKey);

    const contact = await contactPostgresRepository.createContact({
        companyId: company.id,
        name: "Contato Teste",
        phone: `55${Date.now()}`,
        source: "whatsapp"
    });

    console.log("Contact OK:", contact.phone);

    const conversation = await conversationPostgresRepository.createConversation({
        companyId: company.id,
        contactId: contact.id,
        whatsappInstanceId: instance.id,
        status: "open",
        channel: "whatsapp"
    });

    console.log("Conversation OK:", conversation.id);

    const message = await messagePostgresRepository.createMessage({
        companyId: company.id,
        conversationId: conversation.id,
        contactId: contact.id,
        whatsappInstanceId: instance.id,
        direction: "outbound",
        type: "text",
        content: "Mensagem de teste PostgreSQL",
        status: "created"
    });

    console.log("Message OK:", message.id);

    await messagePostgresRepository.markSent(company.id, message.id);
    await conversationPostgresRepository.markLastMessage(company.id, conversation.id);

    const messages = await messagePostgresRepository.listMessagesByConversation(
        company.id,
        conversation.id
    );

    console.log("Messages in conversation:", messages.length);

    console.log("");
    console.log("POSTGRES REPOSITORIES TEST OK");
    console.log("");

    process.exit(0);
}

main().catch((error) => {
    console.error("");
    console.error("POSTGRES REPOSITORIES TEST ERROR");
    console.error(error);
    console.error("");

    process.exit(1);
});