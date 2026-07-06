import os from "os";

export function getNodeHealth() {
    return {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpuLoad: os.loadavg(),
        platform: process.platform,
        nodeVersion: process.version,
        pid: process.pid
    };
}