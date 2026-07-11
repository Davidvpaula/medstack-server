import path from "path";

import {
    listScannedFiles
} from "./ai-code-scanner.service.js";

const SRC_PATH =
    path.resolve("src");

const INVENTORY_TYPES = [
    "controller",
    "service",
    "route",
    "repository",
    "worker",
    "queue",
    "provider"
];

export function getCodeInventory() {
    const scannedFiles =
        listScannedFiles();

    const files =
        scannedFiles.map(
            normalizeInventoryFile
        );

    const inventory = {
        generatedAt:
            new Date().toISOString(),

        root:
            SRC_PATH,

        summary: {
            totalFiles:
                files.length,

            controllers:
                0,

            services:
                0,

            routes:
                0,

            repositories:
                0,

            workers:
                0,

            queues:
                0,

            providers:
                0,

            modules:
                0
        },

        modules: {},

        files
    };

    for (const file of files) {
        const moduleName =
            getModuleName(
                file.relativePath
            );

        if (moduleName) {
            ensureInventoryModule(
                inventory,
                moduleName
            );

            inventory
                .modules[moduleName]
                .files
                .push(file);
        }

        classifyFile(
            file,
            inventory,
            moduleName
        );
    }

    inventory.summary.modules =
        Object.keys(
            inventory.modules
        ).length;

    return inventory;
}

function normalizeInventoryFile(
    file = {}
) {
    const relativePath =
        String(
            file.path || ""
        );

    const metadata =
        safeObject(
            file.metadata
        );

    const absolutePath =
        metadata.absolutePath
        || path.resolve(
            relativePath
        );

    return {
        name:
            metadata.fileName
            || path.basename(
                relativePath
            ),

        path:
            absolutePath,

        relativePath,

        size:
            toNumber(
                metadata.size
            ),

        lines:
            toNumber(
                file.lines
            ),

        exports:
            toArray(
                file.exports
            ),

        imports:
            toArray(
                file.imports
            ),

        module:
            String(
                file.module
                || ""
            ),

        type:
            String(
                file.type
                || "unknown"
            ),

        createdAt:
            file.createdAt
            || null,

        updatedAt:
            null
    };
}

function ensureInventoryModule(
    inventory,
    moduleName
) {
    if (
        inventory
            .modules[moduleName]
    ) {
        return;
    }

    inventory.modules[moduleName] = {
        name:
            moduleName,

        files: [],

        controllers:
            0,

        services:
            0,

        routes:
            0,

        repositories:
            0,

        workers:
            0,

        queues:
            0,

        providers:
            0
    };
}

function getModuleName(
    relativePath
) {
    const normalized =
        String(
            relativePath || ""
        ).replaceAll(
            "\\",
            "/"
        );

    const parts =
        normalized.split("/");

    const modulesIndex =
        parts.indexOf(
            "modules"
        );

    if (
        modulesIndex === -1
    ) {
        return null;
    }

    return (
        parts[
            modulesIndex + 1
        ]
        || null
    );
}

function classifyFile(
    file,
    inventory,
    moduleName
) {
    const type =
        String(
            file.type || ""
        );

    if (
        !INVENTORY_TYPES.includes(
            type
        )
    ) {
        return;
    }

    const plural =
        getPluralKey(
            type
        );

    inventory
        .summary[plural] += 1;

    if (
        moduleName
        && inventory
            .modules[moduleName]
    ) {
        inventory
            .modules[moduleName][plural]
            += 1;
    }
}

function getPluralKey(
    type
) {
    if (
        type === "repository"
    ) {
        return "repositories";
    }

    return `${type}s`;
}

function safeObject(
    value
) {
    return (
        value
        && typeof value
            === "object"
        && !Array.isArray(
            value
        )
    )
        ? value
        : {};
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