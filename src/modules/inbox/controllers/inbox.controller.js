import { response } from "../../../core/response.js";

import {
    getInboxStatus,
    getCompanyInbox,
    getOpenInbox,
    getUnreadInbox,
    getClosedInbox,
    getArchivedInbox,
    getAssignedInbox,
    getInboxStats
} from "../services/inbox.service.js";

export function status(req, res) {
    return response.success(
        res,
        "Status do Inbox carregado.",
        getInboxStatus()
    );
}

export function listByCompany(req, res, next) {
    try {
        return response.success(
            res,
            "Inbox da empresa carregado.",
            getCompanyInbox(req.params.companyId)
        );
    } catch (error) {
        next(error);
    }
}

export function open(req, res, next) {
    try {
        return response.success(
            res,
            "Conversas abertas carregadas.",
            getOpenInbox(req.params.companyId)
        );
    } catch (error) {
        next(error);
    }
}

export function unread(req, res, next) {
    try {
        return response.success(
            res,
            "Conversas não lidas carregadas.",
            getUnreadInbox(req.params.companyId)
        );
    } catch (error) {
        next(error);
    }
}

export function closed(req, res, next) {
    try {
        return response.success(
            res,
            "Conversas encerradas carregadas.",
            getClosedInbox(req.params.companyId)
        );
    } catch (error) {
        next(error);
    }
}

export function archived(req, res, next) {
    try {
        return response.success(
            res,
            "Conversas arquivadas carregadas.",
            getArchivedInbox(req.params.companyId)
        );
    } catch (error) {
        next(error);
    }
}

export function assigned(req, res, next) {
    try {
        return response.success(
            res,
            "Conversas atribuídas carregadas.",
            getAssignedInbox(
                req.params.companyId,
                req.params.userId
            )
        );
    } catch (error) {
        next(error);
    }
}

export function stats(req, res, next) {
    try {
        return response.success(
            res,
            "Estatísticas do Inbox carregadas.",
            getInboxStats(req.params.companyId)
        );
    } catch (error) {
        next(error);
    }
}