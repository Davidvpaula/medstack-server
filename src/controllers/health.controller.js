import { response } from "../core/response.js";

import {
    getDatabaseHealth
} from "../database/database-health.service.js";

export async function databaseHealth(req, res, next) {
    try {
        return response.success(
            res,
            "Health do banco carregado.",
            await getDatabaseHealth()
        );
    } catch (error) {
        next(error);
    }
}