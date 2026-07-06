import {
    getContacts,
    getContactById,
    getContactsByCompany,
    getContactByPhone,
    addContact,
    updateContact,
    removeContact
} from "../stores/contact.store.js";

export const contactRepository = {
    list() {
        return getContacts();
    },

    findById(contactId) {
        return getContactById(contactId);
    },

    listByCompany(companyId) {
        return getContactsByCompany(companyId);
    },

    findByPhone(companyId, phoneNormalized) {
        return getContactByPhone(companyId, phoneNormalized);
    },

    create(contact) {
        return addContact(contact);
    },

    update(contactId, data) {
        return updateContact(contactId, data);
    },

    remove(contactId) {
        return removeContact(contactId);
    },

    searchByName(companyId, name) {
        const query = String(name || "").trim().toLowerCase();

        return getContactsByCompany(companyId).filter((contact) =>
            contact.name.toLowerCase().includes(query)
        );
    },

    listFavorites(companyId) {
        return getContactsByCompany(companyId).filter(
            (contact) => contact.favorite === true
        );
    },

    listArchived(companyId) {
        return getContactsByCompany(companyId).filter(
            (contact) => contact.archived === true
        );
    },

    listBlocked(companyId) {
        return getContactsByCompany(companyId).filter(
            (contact) => contact.blocked === true
        );
    }
};