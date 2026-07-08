import {
    getDatabaseHealth
} from "./database-health.service.js";

export async function getDatabaseDashboard() {

    const health =
        await getDatabaseHealth();

    return {

        title:
            "MedStack Database Dashboard",

        postgres:
            health.connected,

        latency:
            health.latencyMs,

        migrations:
            health.migrations,

        repositories:
            health.repositories,

        generatedAt:
            new Date().toISOString()

    };

}