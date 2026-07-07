import fs from "fs";
import path from "path";

const SRC_PATH = path.resolve("src");

const FILE_TYPES = {
    controller: "controllers",
    service: "services",
    route: "routes",
    repository: "repositories",
    worker: "workers",
    queue: "queues",
    provider: "providers"
};

export function getCodeInventory() {
    const files = scanDirectory(SRC_PATH);

    const inventory = {
        generatedAt: new Date().toISOString(),
        root: SRC_PATH,
        summary: {
            totalFiles: files.length,
            controllers: 0,
            services: 0,
            routes: 0,
            repositories: 0,
            workers: 0,
            queues: 0,
            providers: 0,
            modules: 0
        },
        modules: {},
        files
    };

    for (const file of files) {
        const moduleName = getModuleName(file.relativePath);

        if (moduleName) {
            if (!inventory.modules[moduleName]) {
                inventory.modules[moduleName] = {
                    name: moduleName,
                    files: [],
                    controllers: 0,
                    services: 0,
                    routes: 0,
                    repositories: 0,
                    workers: 0,
                    queues: 0,
                    providers: 0
                };
            }

            inventory.modules[moduleName].files.push(file);
        }

        classifyFile(file, inventory, moduleName);
    }

    inventory.summary.modules = Object.keys(inventory.modules).length;

    return inventory;
}

function scanDirectory(directory) {
    const result = [];

    if (!fs.existsSync(directory)) {
        return result;
    }

    const entries = fs.readdirSync(directory, {
        withFileTypes: true
    });

    for (const entry of entries) {
        const fullPath = path.join(directory, entry.name);

        if (shouldIgnore(fullPath)) {
            continue;
        }

        if (entry.isDirectory()) {
            result.push(...scanDirectory(fullPath));
            continue;
        }

        if (!entry.name.endsWith(".js")) {
            continue;
        }

        const content = fs.readFileSync(fullPath, "utf-8");

        result.push({
            name: entry.name,
            path: fullPath,
            relativePath: path.relative(process.cwd(), fullPath),
            size: content.length,
            lines: content.split("\n").length,
            exports: extractExports(content),
            imports: extractImports(content),
            createdAt: null,
            updatedAt: null
        });
    }

    return result;
}

function shouldIgnore(filePath) {
    return (
        filePath.includes("node_modules")
        || filePath.includes("sessions")
        || filePath.includes("logs")
        || filePath.includes("backups")
        || filePath.includes("uploads")
    );
}

function getModuleName(relativePath) {
    const parts = relativePath.split(path.sep);

    const modulesIndex = parts.indexOf("modules");

    if (modulesIndex === -1) {
        return null;
    }

    return parts[modulesIndex + 1] || null;
}

function classifyFile(file, inventory, moduleName) {
    const normalized = file.relativePath.replaceAll("\\", "/");

    for (const [key, folder] of Object.entries(FILE_TYPES)) {
        if (normalized.includes(`/${folder}/`)) {
            const plural = `${key}s`;

            inventory.summary[plural] += 1;

            if (moduleName && inventory.modules[moduleName]) {
                inventory.modules[moduleName][plural] += 1;
            }
        }
    }
}

function extractImports(content) {
    const imports = [];

    const regex = /import\s+[\s\S]*?\s+from\s+["'](.+?)["']/g;

    let match;

    while ((match = regex.exec(content)) !== null) {
        imports.push(match[1]);
    }

    return imports;
}

function extractExports(content) {
    const exports = [];

    const regex = /export\s+(?:async\s+)?function\s+([a-zA-Z0-9_]+)/g;

    let match;

    while ((match = regex.exec(content)) !== null) {
        exports.push(match[1]);
    }

    return exports;
}