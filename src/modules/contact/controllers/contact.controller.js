import { response } from "../../../core/response.js";

import {
    getContactStatus,
    listContacts,
    listContactsByCompany,
    getContactById,
    searchContactsByName,
    findContactByPhone,
    listFavoriteContacts,
    listArchivedContacts,
    listBlockedContacts,
    createContact,
    updateContact,
    deleteContact,
    favoriteContact,
    unfavoriteContact,
    archiveContact,
    unarchiveContact,
    blockContact,
    unblockContact,
    markContactActivity
} from "../services/contact.service.js";

export function status(req, res) {
    return response.success(
        res,
        "Status do Contact carregado.",
        getContactStatus()
    );
}

export function list(req, res) {
    return response.success(
        res,
        "Contatos carregados.",
        listContacts()
    );
}

export function listByCompany(req, res, next) {
    try {
        return response.success(
            res,
            "Contatos da empresa carregados.",
            listContactsByCompany(req.params.companyId)
        );
    } catch (error) {
        next(error);
    }
}

export function favorites(req, res, next) {
    try {
        return response.success(
            res,
            "Contatos favoritos carregados.",
            listFavoriteContacts(req.params.companyId)
        );
    } catch (error) {
        next(error);
    }
}

export function archived(req, res, next) {
    try {
        return response.success(
            res,
            "Contatos arquivados carregados.",
            listArchivedContacts(req.params.companyId)
        );
    } catch (error) {
        next(error);
    }
}

export function blocked(req, res, next) {
    try {
        return response.success(
            res,
            "Contatos bloqueados carregados.",
            listBlockedContacts(req.params.companyId)
        );
    } catch (error) {
        next(error);
    }
}

export function show(req, res, next) {
    try {
        return response.success(
            res,
            "Contato carregado.",
            getContactById(req.params.contactId)
        );
    } catch (error) {
        next(error);
    }
}

export function search(req, res, next) {
    try {
        return response.success(
            res,
            "Busca de contatos realizada.",
            searchContactsByName(
                req.params.companyId,
                req.query.name
            )
        );
    } catch (error) {
        next(error);
    }
}

export function findByPhone(req, res, next) {
    try {
        return response.success(
            res,
            "Contato carregado por telefone.",
            findContactByPhone(
                req.params.companyId,
                req.query.phone
            )
        );
    } catch (error) {
        next(error);
    }
}

export async function create(req, res, next) {
    try {
        const contact = await createContact(req.body);

        return response.success(
            res,
            "Contato criado.",
            contact
        );
    } catch (error) {
        next(error);
    }
}

export async function update(req, res, next) {
    try {
        const contact = await updateContact(
            req.params.contactId,
            req.body
        );

        return response.success(
            res,
            "Contato atualizado.",
            contact
        );
    } catch (error) {
        next(error);
    }
}

export async function destroy(req, res, next) {
    try {
        const result = await deleteContact(req.params.contactId);

        return response.success(
            res,
            "Contato removido.",
            result
        );
    } catch (error) {
        next(error);
    }
}

export async function favorite(req, res, next) {
    try {
        return response.success(
            res,
            "Contato favoritado.",
            await favoriteContact(req.params.contactId)
        );
    } catch (error) {
        next(error);
    }
}

export async function unfavorite(req, res, next) {
    try {
        return response.success(
            res,
            "Contato removido dos favoritos.",
            await unfavoriteContact(req.params.contactId)
        );
    } catch (error) {
        next(error);
    }
}

export async function archive(req, res, next) {
    try {
        return response.success(
            res,
            "Contato arquivado.",
            await archiveContact(req.params.contactId)
        );
    } catch (error) {
        next(error);
    }
}

export async function unarchive(req, res, next) {
    try {
        return response.success(
            res,
            "Contato desarquivado.",
            await unarchiveContact(req.params.contactId)
        );
    } catch (error) {
        next(error);
    }
}

export async function block(req, res, next) {
    try {
        return response.success(
            res,
            "Contato bloqueado.",
            await blockContact(req.params.contactId)
        );
    } catch (error) {
        next(error);
    }
}

export async function unblock(req, res, next) {
    try {
        return response.success(
            res,
            "Contato desbloqueado.",
            await unblockContact(req.params.contactId)
        );
    } catch (error) {
        next(error);
    }
}

export async function activity(req, res, next) {
    try {
        return response.success(
            res,
            "Atividade do contato atualizada.",
            await markContactActivity(req.params.contactId)
        );
    } catch (error) {
        next(error);
    }
}