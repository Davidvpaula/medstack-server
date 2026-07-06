export function validateCreateContact(data = {}) {
    const errors = [];

    if (!data.companyId) {
        errors.push("Informe companyId.");
    }

    if (!data.name) {
        errors.push("Informe o nome do contato.");
    }

    if (!data.phone) {
        errors.push("Informe o telefone do contato.");
    }

    if (data.email && !isValidEmail(data.email)) {
        errors.push("Informe um email válido.");
    }

    if (data.tags && !Array.isArray(data.tags)) {
        errors.push("Tags devem ser uma lista.");
    }

    if (data.notes && !Array.isArray(data.notes)) {
        errors.push("Notes devem ser uma lista.");
    }

    if (data.customFields && typeof data.customFields !== "object") {
        errors.push("customFields deve ser um objeto.");
    }

    if (data.metadata && typeof data.metadata !== "object") {
        errors.push("metadata deve ser um objeto.");
    }

    return errors;
}

export function validateUpdateContact(data = {}) {
    const errors = [];

    if (data.email && !isValidEmail(data.email)) {
        errors.push("Informe um email válido.");
    }

    if (data.tags && !Array.isArray(data.tags)) {
        errors.push("Tags devem ser uma lista.");
    }

    if (data.notes && !Array.isArray(data.notes)) {
        errors.push("Notes devem ser uma lista.");
    }

    if (data.customFields && typeof data.customFields !== "object") {
        errors.push("customFields deve ser um objeto.");
    }

    if (data.metadata && typeof data.metadata !== "object") {
        errors.push("metadata deve ser um objeto.");
    }

    return errors;
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email));
}