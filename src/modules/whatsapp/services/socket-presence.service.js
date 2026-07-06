import {
    handleWhatsappMessageAck
} from "./whatsapp-message-ack.service.js";

export async function bindPresenceEvents(socket) {
    if (!socket) {
        return;
    }

    socket.ev.on("presence.update", (event) => {
        console.log(
            "[Presence]",
            JSON.stringify(event, null, 2)
        );
    });

    socket.ev.on("chats.update", (event) => {
        console.log(
            "[Chats]",
            JSON.stringify(event, null, 2)
        );
    });

    socket.ev.on("messages.update", async (event) => {
        console.log(
            "[Messages Update]",
            JSON.stringify(event, null, 2)
        );

        await handleWhatsappMessageAck(event);
    });

    socket.ev.on("messages.delete", (event) => {
        console.log(
            "[Messages Delete]",
            JSON.stringify(event, null, 2)
        );
    });

    socket.ev.on("contacts.update", (event) => {
        console.log(
            "[Contacts Update]",
            JSON.stringify(event, null, 2)
        );
    });

    console.log("[WhatsApp] Presence Events registrados.");
}