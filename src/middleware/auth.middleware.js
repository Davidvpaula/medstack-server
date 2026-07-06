import { AppError } from "../core/errors/AppError.js";

import { verifyToken } from "../modules/auth/utils/token.util.js";
import { authRepository } from "../modules/auth/repositories/auth.repository.js";
import { userRepository } from "../modules/user/repositories/user.repository.js";

export function requireAuth(req, res, next) {
    try {
        const authorization = req.headers.authorization;

        if (!authorization) {
            throw new AppError("Token não informado.", 401);
        }

        const [type, token] = authorization.split(" ");

        if (type !== "Bearer" || !token) {
            throw new AppError("Token inválido.", 401);
        }

        const decoded = verifyToken(token);

        if (decoded.type !== "access") {
            throw new AppError("Tipo de token inválido.", 401);
        }

        const session = authRepository.findByAccessToken(token);

        if (!session || !session.isActive()) {
            throw new AppError("Sessão inválida.", 401);
        }

        const user = userRepository.findById(decoded.userId);

        if (!user || !user.isActive()) {
            throw new AppError("Usuário inválido.", 401);
        }

        req.auth = {
            userId: decoded.userId,
            companyId: decoded.companyId,
            role: decoded.role,
            sessionId: session.id
        };

        req.user = user;

        next();
    } catch (error) {
        next(error);
    }
}