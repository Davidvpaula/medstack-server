import { contactManager } from "../services/contact-manager.service.js";

export function getContacts() {
    return contactManager.list();
}

export function getContactById(contactId) {
    return contactManager.findById(contactId);
}

export function getContactsByCompany(companyId) {
    return contactManager.listByCompany(companyId);
}

export function getContactByPhone(companyId, phoneNormalized) {
    return contactManager.findByPhone(companyId, phoneNormalized);
}

export function addContact(contact) {
    return contactManager.create(contact);
}

export function updateContact(contactId, data) {
    return contactManager.update(contactId, data);
}

export function removeContact(contactId) {
    return contactManager.remove(contactId);
}