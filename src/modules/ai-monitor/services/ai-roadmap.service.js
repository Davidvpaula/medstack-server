export function getRoadmapAnalysis() {

    const roadmap = buildRoadmap();

    const completed = roadmap.filter(step => step.status === "done").length;

    const pending = roadmap.filter(step => step.status !== "done").length;

    const progress = Math.round(
        completed / roadmap.length * 100
    );

    return {

        type: "roadmap",

        generatedAt: new Date().toISOString(),

        progress,

        completed,

        pending,

        nextStep: roadmap.find(step => step.status !== "done"),

        roadmap

    };

}

function buildRoadmap() {

    return [

        {
            id: 1,
            module: "Backend Base",
            status: "done",
            priority: 1
        },

        {
            id: 2,
            module: "WhatsApp Runtime",
            status: "done",
            priority: 1
        },

        {
            id: 3,
            module: "Queue Worker",
            status: "done",
            priority: 1
        },

        {
            id: 4,
            module: "Runtime Dashboard",
            status: "done",
            priority: 1
        },

        {
            id: 5,
            module: "AI Monitor",
            status: "done",
            priority: 1
        },

        {
            id: 6,
            module: "API Map",
            status: "done",
            priority: 2
        },

        {
            id: 7,
            module: "Lovable Frontend",
            status: "pending",
            priority: 2
        },

        {
            id: 8,
            module: "Authentication JWT",
            status: "pending",
            priority: 2
        },

        {
            id: 9,
            module: "RBAC",
            status: "pending",
            priority: 2
        },

        {
            id: 10,
            module: "PostgreSQL",
            status: "pending",
            priority: 3
        },

        {
            id: 11,
            module: "Redis",
            status: "pending",
            priority: 3
        },

        {
            id: 12,
            module: "BullMQ",
            status: "pending",
            priority: 3
        },

        {
            id: 13,
            module: "Docker",
            status: "pending",
            priority: 3
        },

        {
            id: 14,
            module: "Production VPS",
            status: "pending",
            priority: 4
        },

        {
            id: 15,
            module: "100 Companies",
            status: "pending",
            priority: 5
        }

    ];

}