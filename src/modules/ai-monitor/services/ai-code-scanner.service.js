import fs from "fs";
import path from "path";

const scannedFiles = [];

const SRC_ROOT = path.resolve("src");

export function scanProjectSource() {
    clearScanner();

    const files = scanDirectory(SRC_ROOT);

    for (const file of files) {
        registerProjectFile(file);
    }

    return {
        scanned: true,
        summary: getScannerSummary(),
        files: listScannedFiles()
    };
}

export function registerProjectFile(file = {}) {
    const item = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        path: file.path || "",
        module: file.module || "",
        type: file.type || "unknown",
        lines: Number(file.lines || 0),
        imports: Array.isArray(file.imports) ? file.imports : [],
        exports: Array.isArray(file.exports) ? file.exports : [],
        metadata: file.metadata || {},
        createdAt: new Date().toISOString()
    };

    scannedFiles.push(item);

    return item;
}

export function listScannedFiles() {
    return scannedFiles;
}

export function getScannerSummary() {
    const modules = [
        ...new Set(
            scannedFiles
                .map((file) => file.module)
                .filter(Boolean)
        )
    ];

    const totalLines = scannedFiles.reduce(
        (sum, file) => sum + file.lines,
        0
    );

    return {
        totalFiles: scannedFiles.length,
        totalModules: modules.length,
        totalLines,
        modules,
        byType: countBy("type"),
        byModule: countBy("module")
    };
}

export function clearScanner() {
    scannedFiles.length = 0;

    return {
        cleared: true
    };
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
        const relativePath = path.relative(process.cwd(), fullPath);

        result.push({
            path: relativePath,
            module: detectModule(relativePath),
            type: detectType(relativePath),
            lines: countLines(content),
            imports: extractImports(content),
            exports: extractExports(content),
            metadata: {
                size: content.length,
                fileName: entry.name
            }
        });
    }

    return result;
}

function shouldIgnore(filePath) {
    return (
        filePath.includes("node_modules") ||
        filePath.includes("sessions") ||
        filePath.includes("logs") ||
        filePath.includes("backups") ||
        filePath.includes("uploads") ||
        filePath.includes(".git")
    );
}

function detectModule(filePath) {
    const normalized = filePath.replaceAll("\\", "/");
    const parts = normalized.split("/");
    const index = parts.indexOf("modules");

    if (index === -1) {
        return "core";
    }

    return parts[index + 1] || "unknown";
}

function detectType(filePath) {
    const normalized = filePath.replaceAll("\\", "/");

    if (normalized.includes("/controllers/")) return "controller";
    if (normalized.includes("/services/")) return "service";
    if (normalized.includes("/routes/")) return "route";
    if (normalized.includes("/repositories/")) return "repository";
    if (normalized.includes("/workers/")) return "worker";
    if (normalized.includes("/queues/")) return "queue";
    if (normalized.includes("/providers/")) return "provider";
    if (normalized.includes("/middlewares/")) return "middleware";
    if (normalized.includes("/constants/")) return "constant";
    if (normalized.includes("/entities/")) return "entity";
    if (normalized.includes("/config/")) return "config";

    return "other";
}

function countLines(content) {
    return content.split("\n").length;
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

    const functionRegex = /export\s+(?:async\s+)?function\s+([a-zA-Z0-9_]+)/g;
    const constRegex = /export\s+const\s+([a-zA-Z0-9_]+)/g;
    const defaultRegex = /export\s+default\s+([a-zA-Z0-9_]+)/g;

    collectMatches(functionRegex, content, exports);
    collectMatches(constRegex, content, exports);
    collectMatches(defaultRegex, content, exports);

    return exports;
}

function collectMatches(regex, content, target) {
    let match;

    while ((match = regex.exec(content)) !== null) {
        target.push(match[1]);
    }
}

function countBy(field) {
    return scannedFiles.reduce((acc, file) => {
        const key = file[field] || "unknown";

        acc[key] = (acc[key] || 0) + 1;

        return acc;
    }, {});
}