import {
    response
} from "../core/response.js";

import {
    getSystemDiagnostics
} from "../services/system-diagnostics.service.js";

export async function diagnostics(
    req,
    res,
    next
) {
    try {
        const result =
            await getSystemDiagnostics();

        return response.success(
            res,
            "Diagnóstico geral do sistema carregado.",
            result
        );
    } catch (error) {
        next(error);
    }
}