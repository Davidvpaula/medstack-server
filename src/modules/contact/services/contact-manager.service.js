class ContactManager {
    constructor() {
        this.contacts = new Map();
    }

    normalizeId(contactId) {
        return String(contactId || "").trim();
    }

    list() {
        return Array.from(this.contacts.values());
    }

    findById(contactId) {
        return this.contacts.get(this.normalizeId(contactId)) || null;
    }

    listByCompany(companyId) {
        return this.list().filter(
            (contact) => contact.companyId === companyId
        );
    }

    findByPhone(companyId, phoneNormalized) {
        return this.listByCompany(companyId).find(
            (contact) => contact.phoneNormalized === phoneNormalized
        ) || null;
    }

    create(contact) {
        this.contacts.set(this.normalizeId(contact.id), contact);

        return contact;
    }

    update(contactId, data) {
        const contact = this.findById(contactId);

        if (!contact) {
            return null;
        }

        contact.update(data);

        this.contacts.set(this.normalizeId(contact.id), contact);

        return contact;
    }

    remove(contactId) {
        return this.contacts.delete(this.normalizeId(contactId));
    }
}

export const contactManager = new ContactManager();