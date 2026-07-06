import { logger } from "../logger.js";
import { response } from "../response.js";
import { AppError } from "./AppError.js";

export function errorHandler(error, req, res, next) {
    if (error instanceof AppError) {
        logger.warn(error.message);

        return response.error(
            res,
            error.message,
            error.statusCode
        );
    }

    logger.error("Erro interno do servidor", error);

    return response.error(
        res,
        "Erro interno do servidor.",
        500
    );
}