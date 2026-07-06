import { response } from "../../../core/response.js";

import {
    getUserStatus,
    listUsers,
    listUsersByCompany,
    getUserById,
    createUser,
    updateUser,
    deleteUser
} from "../services/user.service.js";

export function status(req, res) {
    return response.success(
        res,
        "Status do User carregado.",
        getUserStatus()
    );
}

export function list(req, res) {
    return response.success(
        res,
        "Usuários carregados.",
        listUsers()
    );
}

export function listByCompany(req, res, next) {
    try {
        return response.success(
            res,
            "Usuários da empresa carregados.",
            listUsersByCompany(req.params.companyId)
        );
    } catch (error) {
        next(error);
    }
}

export function show(req, res, next) {
    try {
        return response.success(
            res,
            "Usuário carregado.",
            getUserById(req.params.userId)
        );
    } catch (error) {
        next(error);
    }
}

export async function create(req, res, next) {
    try {
        const user = await createUser(req.body);

        return response.success(
            res,
            "Usuário criado.",
            user
        );
    } catch (error) {
        next(error);
    }
}

export async function update(req, res, next) {
    try {
        const user = await updateUser(
            req.params.userId,
            req.body
        );

        return response.success(
            res,
            "Usuário atualizado.",
            user
        );
    } catch (error) {
        next(error);
    }
}

export async function destroy(req, res, next) {
    try {
        const result = await deleteUser(req.params.userId);

        return response.success(
            res,
            "Usuário removido.",
            result
        );
    } catch (error) {
        next(error);
    }
}