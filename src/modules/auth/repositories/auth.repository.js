import {
    getSessions,
    getSessionById,
    getSessionByAccessToken,
    getSessionByRefreshToken,
    addSession,
    updateSession,
    removeSession
} from "../stores/auth.store.js";

export const authRepository = {
    list() {
        return getSessions();
    },

    findById(sessionId) {
        return getSessionById(sessionId);
    },

    findByAccessToken(accessToken) {
        return getSessionByAccessToken(accessToken);
    },

    findByRefreshToken(refreshToken) {
        return getSessionByRefreshToken(refreshToken);
    },

    create(session) {
        return addSession(session);
    },

    update(sessionId, data) {
        return updateSession(sessionId, data);
    },

    remove(sessionId) {
        return removeSession(sessionId);
    }
};