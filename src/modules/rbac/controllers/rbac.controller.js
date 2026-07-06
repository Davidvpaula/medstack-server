import { response } from "../../../core/response.js";

import {
    getPermissions
} from "../services/rbac.service.js";

export function status(req, res) {
    return response.success(
        res,
        "Status do RBAC carregado.",
        {
            module: "rbac",
            status: "active"
        }
    );
}

export function permissions(req, res) {
    return response.success(
        res,
        "Permissões do usuário carregadas.",
        {
            role: req.auth.role,
            permissions: getPermissions(req.auth.role)
        }
    );
}