import { AppError } from "../../../core/errors/AppError.js";

import {
    companyPostgresRepository
} from "../../../database/repositories/company.postgres.repository.js";

import {
    contactPostgresRepository
} from "../../../database/repositories/contact.postgres.repository.js";

import { CONTACT_STATUS } from "../constants/contact-status.constants.js";

import {
    validateCreateContact,
    validateUpdateContact
} from "../validators/contact.validator.js";

export function getContactStatus() {
    return {
        module: "contact",
        status: "active",
        persistence: "postgres"
    };
}

export async function listContacts() {
    return contactPostgresRepository.listContacts();
}

export async function listContactsByCompany(companyId) {
    await ensureCompanyExists(companyId);

    return contactPostgresRepository.listContactsByCompany(companyId);
}

export async function getContactById(contactId) {
    const contact = await contactPostgresRepository.findContactById(contactId);

    if (!contact) {
        throw new AppError("Contato não encontrado.", 404);
    }

    return contact;
}

export async function searchContactsByName(companyId, name) {
    await ensureCompanyExists(companyId);

    return contactPostgresRepository.searchContactsByName(companyId, name);
}

export async function findContactByPhone(companyId, phone) {
    await ensureCompanyExists(companyId);

    const phoneNormalized = normalizePhone(phone);

    const contact = await contactPostgresRepository.findContactByPhone(
        companyId,
        phoneNormalized
    );

    if (!contact) {
        throw new AppError("Contato não encontrado.", 404);
    }

    return contact;
}

export async function listFavoriteContacts(companyId) {
    await ensureCompanyExists(companyId);

    return contactPostgresRepository.listFavoriteContacts(companyId);
}

export async function listArchivedContacts(companyId) {
    await ensureCompanyExists(companyId);

    return contactPostgresRepository.listArchivedContacts(companyId);
}

export async function listBlockedContacts(companyId) {
    await ensureCompanyExists(companyId);

    return contactPostgresRepository.listBlockedContacts(companyId);
}

export async function createContact(data) {
    const validationErrors = validateCreateContact(data);

    if (validationErrors.length) {
        throw new AppError(validationErrors.join(" "), 400);
    }

    const company = await ensureCompanyExists(data.companyId);

    const phoneNormalized = normalizePhone(data.phone);

    const existingContact = await contactPostgresRepository.findContactByPhone(
        company.id,
        phoneNormalized
    );

    if (existingContact) {
        throw new AppError("Já existe um contato com este telefone.", 409);
    }

    return contactPostgresRepository.createContact({
        companyId: company.id,
        name: data.name,
        phone: phoneNormalized,
        email: data.email || null,
        source: data.source || "manual",
        status: data.status || CONTACT_STATUS.ACTIVE,
        metadata: buildContactMetadata(data)
    });
}

export async function updateContact(contactId, data) {
    const validationErrors = validateUpdateContact(data);

    if (validationErrors.length) {
        throw new AppError(validationErrors.join(" "), 400);
    }

    const contact = await getContactById(contactId);

    const updateData = {
        ...data
    };

    if (updateData.phone) {
        const phoneNormalized = normalizePhone(updateData.phone);

        const existingContact = await contactPostgresRepository.findContactByPhone(
            contact.companyId,
            phoneNormalized
        );

        if (existingContact && existingContact.id !== contact.id) {
            throw new AppError("Já existe um contato com este telefone.", 409);
        }

        updateData.phone = phoneNormalized;
    }

    const metadata = {
        ...(contact.metadata || {}),
        ...buildContactMetadata(updateData)
    };

    return contactPostgresRepository.updateContact(contactId, {
        name: updateData.name,
        phone: updateData.phone,
        email: updateData.email,
        source: updateData.source,
        status: updateData.status,
        metadata
    });
}

export async function deleteContact(contactId) {
    await getContactById(contactId);

    await contactPostgresRepository.softDeleteContact(contactId);

    return {
        deleted: true,
        contactId
    };
}

export async function favoriteContact(contactId) {
    const contact = await getContactById(contactId);

    return contactPostgresRepository.updateContact(contactId, {
        metadata: {
            ...(contact.metadata || {}),
            favorite: true
        }
    });
}

export async function unfavoriteContact(contactId) {
    const contact = await getContactById(contactId);

    return contactPostgresRepository.updateContact(contactId, {
        metadata: {
            ...(contact.metadata || {}),
            favorite: false
        }
    });
}

export async function archiveContact(contactId) {
    const contact = await getContactById(contactId);

    return contactPostgresRepository.updateContact(contactId, {
        status: CONTACT_STATUS.ARCHIVED,
        metadata: {
            ...(contact.metadata || {}),
            archived: true
        }
    });
}

export async function unarchiveContact(contactId) {
    const contact = await getContactById(contactId);

    return contactPostgresRepository.updateContact(contactId, {
        status: CONTACT_STATUS.ACTIVE,
        metadata: {
            ...(contact.metadata || {}),
            archived: false
        }
    });
}

export async function blockContact(contactId) {
    const contact = await getContactById(contactId);

    return contactPostgresRepository.updateContact(contactId, {
        status: CONTACT_STATUS.BLOCKED,
        metadata: {
            ...(contact.metadata || {}),
            blocked: true
        }
    });
}

export async function unblockContact(contactId) {
    const contact = await getContactById(contactId);

    return contactPostgresRepository.updateContact(contactId, {
        status: CONTACT_STATUS.ACTIVE,
        metadata: {
            ...(contact.metadata || {}),
            blocked: false
        }
    });
}

export async function markContactActivity(contactId) {
    const contact = await getContactById(contactId);

    return contactPostgresRepository.updateContact(contactId, {
        metadata: {
            ...(contact.metadata || {}),
            lastActivityAt: new Date().toISOString()
        }
    });
}

async function ensureCompanyExists(companyId) {
    const company = await companyPostgresRepository.findCompanyById(companyId);

    if (!company) {
        throw new AppError("Empresa não encontrada.", 404);
    }

    return company;
}

function normalizePhone(phone) {
    return String(phone || "").replace(/\D/g, "");
}

function buildContactMetadata(data = {}) {
    return {
        avatar: data.avatar || "",
        city: data.city || "",
        state: data.state || "",
        country: data.country || "Brasil",
        document: data.document || "",
        birthDate: data.birthDate || null,
        channel: data.channel || "whatsapp",
        ownerId: data.ownerId || null,
        tags: data.tags || [],
        notes: data.notes || [],
        customFields: data.customFields || {},
        favorite: Boolean(data.favorite),
        archived: Boolean(data.archived),
        blocked: Boolean(data.blocked),
        ...(data.metadata || {})
    };
}