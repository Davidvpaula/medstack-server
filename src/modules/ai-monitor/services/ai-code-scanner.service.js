import fs from "fs";
import path from "path";

const scannedFiles = [];

const SRC_ROOT =
    path.resolve("src");

let scannerRunning = false;

export function scanProjectSource() {
    if (scannerRunning) {
        return {
            scanned: false,
            reason:
                "scanner_already_running",
            summary:
                buildScannerSummary(),
            files:
                cloneScannedFiles()
        };
    }

    scannerRunning = true;

    try {
        clearScanner();

        const files =
            scanDirectory(
                SRC_ROOT
            );

        for (const file of files) {
            registerProjectFile(
                file
            );
        }

        return {
            scanned: true,

            summary:
                buildScannerSummary(),

            files:
                cloneScannedFiles()
        };
    } finally {
        scannerRunning = false;
    }
}

export function ensureScannerLoaded() {
    if (
        scannedFiles.length > 0
        || scannerRunning
    ) {
        return;
    }

    scanProjectSource();
}

export function registerProjectFile(
    file = {}
) {
    const item = {
        id:
            createScannerItemId(),

        path:
            String(
                file.path || ""
            ),

        module:
            String(
                file.module || ""
            ),

        type:
            String(
                file.type || "unknown"
            ),

        lines:
            toNumber(
                file.lines
            ),

        imports:
            toArray(
                file.imports
            ),

        exports:
            toArray(
                file.exports
            ),

        metadata:
            normalizeMetadata(
                file.metadata
            ),

        createdAt:
            new Date().toISOString()
    };

    scannedFiles.push(
        item
    );

    return {
        ...item,

        imports:
            [...item.imports],

        exports:
            [...item.exports],

        metadata: {
            ...item.metadata
        }
    };
}

export function listScannedFiles() {
    ensureScannerLoaded();

    return cloneScannedFiles();
}

export function getScannerSummary() {
    ensureScannerLoaded();

    return buildScannerSummary();
}

export function clearScanner() {
    scannedFiles.length = 0;

    return {
        cleared: true
    };
}

function buildScannerSummary() {
    const modules = [
        ...new Set(
            scannedFiles
                .map(
                    (file) =>
                        file.module
                )
                .filter(Boolean)
        )
    ];

    const totalLines =
        scannedFiles.reduce(
            (
                sum,
                file
            ) =>
                sum
                + toNumber(
                    file.lines
                ),
            0
        );

    return {
        totalFiles:
            scannedFiles.length,

        totalModules:
            modules.length,

        totalLines,

        modules,

        byType:
            countBy("type"),

        byModule:
            countBy("module")
    };
}

function cloneScannedFiles() {
    return scannedFiles.map(
        (file) => ({
            ...file,

            imports:
                [...file.imports],

            exports:
                [...file.exports],

            metadata: {
                ...file.metadata
            }
        })
    );
}

function scanDirectory(
    directory
) {
    const result = [];

    if (
        !fs.existsSync(
            directory
        )
    ) {
        return result;
    }

    const entries =
        fs.readdirSync(
            directory,
            {
                withFileTypes: true
            }
        );

    for (const entry of entries) {
        const fullPath =
            path.join(
                directory,
                entry.name
            );

        if (
            shouldIgnore(
                fullPath
            )
        ) {
            continue;
        }

        if (
            entry.isDirectory()
        ) {
            result.push(
                ...scanDirectory(
                    fullPath
                )
            );

            continue;
        }

        if (
            !entry.name.endsWith(
                ".js"
            )
        ) {
            continue;
        }

        const content =
            fs.readFileSync(
                fullPath,
                "utf-8"
            );

        const relativePath =
            path.relative(
                process.cwd(),
                fullPath
            );

        result.push({
            path:
                relativePath,

            module:
                detectModule(
                    relativePath
                ),

            type:
                detectType(
                    relativePath
                ),

            lines:
                countLines(
                    content
                ),

            imports:
                extractImports(
                    content
                ),

            exports:
                extractExports(
                    content
                ),

            metadata: {
                size:
                    content.length,

                fileName:
                    entry.name,

                absolutePath:
                    fullPath
            }
        });
    }

    return result;
}

function shouldIgnore(
    filePath
) {
    const normalized =
        String(filePath)
            .replaceAll(
                "\\",
                "/"
            )
            .toLowerCase();

    return (
        normalized.includes(
            "/node_modules/"
        )
        || normalized.includes(
            "/sessions/"
        )
        || normalized.includes(
            "/logs/"
        )
        || normalized.includes(
            "/backups/"
        )
        || normalized.includes(
            "/uploads/"
        )
        || normalized.includes(
            "/.git/"
        )
    );
}

function detectModule(
    filePath
) {
    const normalized =
        String(filePath)
            .replaceAll(
                "\\",
                "/"
            );

    const parts =
        normalized.split("/");

    const index =
        parts.indexOf(
            "modules"
        );

    if (index === -1) {
        return "core";
    }

    return (
        parts[index + 1]
        || "unknown"
    );
}

function detectType(
    filePath
) {
    const normalized =
        String(filePath)
            .replaceAll(
                "\\",
                "/"
            );

    if (
        normalized.includes(
            "/controllers/"
        )
    ) {
        return "controller";
    }

    if (
        normalized.includes(
            "/services/"
        )
    ) {
        return "service";
    }

    if (
        normalized.includes(
            "/routes/"
        )
    ) {
        return "route";
    }

    if (
        normalized.includes(
            "/repositories/"
        )
    ) {
        return "repository";
    }

    if (
        normalized.includes(
            "/workers/"
        )
    ) {
        return "worker";
    }

    if (
        normalized.includes(
            "/queues/"
        )
    ) {
        return "queue";
    }

    if (
        normalized.includes(
            "/providers/"
        )
    ) {
        return "provider";
    }

    if (
        normalized.includes(
            "/middleware/"
        )
        || normalized.includes(
            "/middlewares/"
        )
    ) {
        return "middleware";
    }

    if (
        normalized.includes(
            "/constants/"
        )
    ) {
        return "constant";
    }

    if (
        normalized.includes(
            "/entities/"
        )
    ) {
        return "entity";
    }

    if (
        normalized.includes(
            "/config/"
        )
    ) {
        return "config";
    }

    return "other";
}

function countLines(
    content
) {
    return String(
        content || ""
    ).split("\n").length;
}

function extractImports(
    content
) {
    const imports = [];

    const regex =
        /import\s+[\s\S]*?\s+from\s+["'](.+?)["']/g;

    let match;

    while (
        (
            match =
                regex.exec(
                    content
                )
        ) !== null
    ) {
        imports.push(
            match[1]
        );
    }

    return imports;
}

function extractExports(
    content
) {
    const exports = [];

    const functionRegex =
        /export\s+(?:async\s+)?function\s+([a-zA-Z0-9_]+)/g;

    const constRegex =
        /export\s+const\s+([a-zA-Z0-9_]+)/g;

    const defaultRegex =
        /export\s+default\s+([a-zA-Z0-9_]+)/g;

    collectMatches(
        functionRegex,
        content,
        exports
    );

    collectMatches(
        constRegex,
        content,
        exports
    );

    collectMatches(
        defaultRegex,
        content,
        exports
    );

    return [
        ...new Set(
            exports
        )
    ];
}

function collectMatches(
    regex,
    content,
    target
) {
    let match;

    while (
        (
            match =
                regex.exec(
                    content
                )
        ) !== null
    ) {
        target.push(
            match[1]
        );
    }
}

function countBy(
    field
) {
    return scannedFiles.reduce(
        (
            accumulator,
            file
        ) => {
            const key =
                file[field]
                || "unknown";

            accumulator[key] =
                (
                    accumulator[key]
                    || 0
                ) + 1;

            return accumulator;
        },
        {}
    );
}

function createScannerItemId() {
    return (
        `${Date.now()}-`
        + Math.random()
            .toString(36)
            .slice(2)
    );
}

function normalizeMetadata(
    metadata
) {
    if (
        !metadata
        || typeof metadata
            !== "object"
        || Array.isArray(
            metadata
        )
    ) {
        return {};
    }

    return {
        ...metadata
    };
}

function toArray(
    value
) {
    return Array.isArray(
        value
    )
        ? [...value]
        : [];
}

function toNumber(
    value
) {
    const number =
        Number(value);

    return Number.isFinite(
        number
    )
        ? number
        : 0;
}