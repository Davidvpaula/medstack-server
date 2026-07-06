import { AppError } from "../../../core/errors/AppError.js";

import { companyRepository } from "../../company/repositories/company.repository.js";

import { Contact } from "../entities/contact.entity.js";
import { contactRepository } from "../repositories/contact.repository.js";

import { CONTACT_STATUS } from "../constants/contact-status.constants.js";

import {
    validateCreateContact,
    validateUpdateContact
} from "../validators/contact.validator.js";

export function getContactStatus() {
    return {
        module: "contact",
        status: "active"
    };
}

export function listContacts() {
    return contactRepository.list();
}

export function listContactsByCompany(companyId) {
    ensureCompanyExists(companyId);

    return contactRepository.listByCompany(companyId);
}

export function getContactById(contactId) {
    const contact = contactRepository.findById(contactId);

    if (!contact) {
        throw new AppError("Contato não encontrado.", 404);
    }

    return contact;
}

export function searchContactsByName(companyId, name) {
    ensureCompanyExists(companyId);

    return contactRepository.searchByName(companyId, name);
}

export function findContactByPhone(companyId, phone) {
    ensureCompanyExists(companyId);

    const phoneNormalized = normalizePhone(phone);

    const contact = contactRepository.findByPhone(companyId, phoneNormalized);

    if (!contact) {
        throw new AppError("Contato não encontrado.", 404);
    }

    return contact;
}

export function listFavoriteContacts(companyId) {
    ensureCompanyExists(companyId);

    return contactRepository.listFavorites(companyId);
}

export function listArchivedContacts(companyId) {
    ensureCompanyExists(companyId);

    return contactRepository.listArchived(companyId);
}

export function listBlockedContacts(companyId) {
    ensureCompanyExists(companyId);

    return contactRepository.listBlocked(companyId);
}

export async function createContact(data) {
    const validationErrors = validateCreateContact(data);

    if (validationErrors.length) {
        throw new AppError(validationErrors.join(" "), 400);
    }

    const company = ensureCompanyExists(data.companyId);

    const phoneNormalized = normalizePhone(data.phone);

    const existingContact = contactRepository.findByPhone(
        company.id,
        phoneNormalized
    );

    if (existingContact) {
        throw new AppError("Já existe um contato com este telefone.", 409);
    }

    const contact = new Contact({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        companyId: company.id,
        name: data.name,
        phone: data.phone,
        email: data.email || "",
        avatar: data.avatar || "",
        city: data.city || "",
        state: data.state || "",
        country: data.country || "Brasil",
        document: data.document || "",
        birthDate: data.birthDate || null,
        source: data.source || "manual",
        channel: data.channel || "whatsapp",
        ownerId: data.ownerId || null,
        status: data.status || CONTACT_STATUS.ACTIVE,
        tags: data.tags || [],
        notes: data.notes || [],
        customFields: data.customFields || {},
        metadata: data.metadata || {}
    });

    company.updateStatistics({
        contacts: (company.statistics.contacts || 0) + 1
    });

    return contactRepository.create(contact);
}

export async function updateContact(contactId, data) {
    const validationErrors = validateUpdateContact(data);

    if (validationErrors.length) {
        throw new AppError(validationErrors.join(" "), 400);
    }

    const contact = getContactById(contactId);

    const updateData = {
        ...data
    };

    if (updateData.phone) {
        const phoneNormalized = normalizePhone(updateData.phone);

        const existingContact = contactRepository.findByPhone(
            contact.companyId,
            phoneNormalized
        );

        if (existingContact && existingContact.id !== contact.id) {
            throw new AppError("Já existe um contato com este telefone.", 409);
        }
    }

    return contactRepository.update(contactId, updateData);
}

export async function deleteContact(contactId) {
    const contact = getContactById(contactId);

    const company = companyRepository.findById(contact.companyId);

    if (company) {
        company.updateStatistics({
            contacts: Math.max((company.statistics.contacts || 1) - 1, 0)
        });
    }

    contactRepository.remove(contactId);

    return {
        deleted: true,
        contactId
    };
}

export async function favoriteContact(contactId) {
    getContactById(contactId);

    return contactRepository.update(contactId, {
        favorite: true
    });
}

export async function unfavoriteContact(contactId) {
    getContactById(contactId);

    return contactRepository.update(contactId, {
        favorite: false
    });
}

export async function archiveContact(contactId) {
    getContactById(contactId);

    return contactRepository.update(contactId, {
        archived: true,
        status: CONTACT_STATUS.ARCHIVED
    });
}

export async function unarchiveContact(contactId) {
    getContactById(contactId);

    return contactRepository.update(contactId, {
        archived: false,
        status: CONTACT_STATUS.ACTIVE
    });
}

export async function blockContact(contactId) {
    getContactById(contactId);

    return contactRepository.update(contactId, {
        blocked: true,
        status: CONTACT_STATUS.BLOCKED
    });
}

export async function unblockContact(contactId) {
    getContactById(contactId);

    return contactRepository.update(contactId, {
        blocked: false,
        status: CONTACT_STATUS.ACTIVE
    });
}

export async function markContactActivity(contactId) {
    const contact = getContactById(contactId);

    contact.markActivity();

    return contact;
}

function ensureCompanyExists(companyId) {
    const company = companyRepository.findById(companyId);

    if (!company) {
        throw new AppError("Empresa não encontrada.", 404);
    }

    return company;
}

function normalizePhone(phone) {
    return String(phone || "").replace(/\D/g, "");
}