import {
    testPostgresConnection
} from "./postgres.client.js";

import {
    getMigrationStatus
} from "./migration-runner.js";

import {
    listRepositories
} from "./repository-factory.js";

let lastHealth = {
    connected: false,
    latencyMs: null,
    serverTime: null,
    migrations: null,
    repositories: [],
    lastCheckAt: null,
    lastError: null
};

export async function getDatabaseHealth() {
    try {
        const result = await testPostgresConnection();
        const migrations = await getMigrationStatus();

        lastHealth = {
            connected: true,
            latencyMs: result.latencyMs,
            serverTime: result.serverTime,
            migrations,
            repositories: listRepositories(),
            lastCheckAt: new Date().toISOString(),
            lastError: null
        };

        return lastHealth;
    } catch (error) {
        lastHealth = {
            connected: false,
            latencyMs: null,
            serverTime: null,
            migrations: null,
            repositories: listRepositories(),
            lastCheckAt: new Date().toISOString(),
            lastError: error.message
        };

        return lastHealth;
    }
}

export function getLastDatabaseHealth() {
    return lastHealth;
}