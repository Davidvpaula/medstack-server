const sessions = new Map();

export function getSessions() {
    return Array.from(sessions.values());
}

export function getSessionById(sessionId) {
    return sessions.get(String(sessionId || "").trim()) || null;
}

export function getSessionByAccessToken(accessToken) {
    return getSessions().find(
        (session) => session.accessToken === accessToken
    ) || null;
}

export function getSessionByRefreshToken(refreshToken) {
    return getSessions().find(
        (session) => session.refreshToken === refreshToken
    ) || null;
}

export function addSession(session) {
    sessions.set(session.id, session);

    return session;
}

export function updateSession(sessionId, data) {
    const session = getSessionById(sessionId);

    if (!session) {
        return null;
    }

    Object.assign(session, data);
    session.touch();

    sessions.set(session.id, session);

    return session;
}

export function removeSession(sessionId) {
    return sessions.delete(String(sessionId || "").trim());
}