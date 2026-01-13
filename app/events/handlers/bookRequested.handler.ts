import { eventBus } from "../eventBus";
import { EventType } from "../eventTypes";
import { createNotification } from "@/services/notification.service";
import { getAllAdmins } from "@/db/crud/users.crud";
import { readTransactionById } from "@/db/crud/transactions.crud";

eventBus.on(EventType.BOOK_REQUESTED, async (event) => {
    const { transactionId, userId, bookId } = event.payload;


    // Aqui podes buscar todos admins
    const admins = await getAllAdmins();
    for (const admin of admins) {
        await createNotification(
            admin.clerkId,
            "Novo pedido de livro",
            `O utilizador ${userId} pediu o livro ${bookId}.`
        );
    }
});

eventBus.on(EventType.BOOK_ACCEPTED, async (event) => {
    const { transactionId, userId } = event.payload;   

    const tx = await readTransactionById(transactionId);

    await createNotification(
        userId,
        "Pedido de livro aceite",
        `O teu pedido para o livro ${tx.physicalBookId} foi aceite! Podes passar para o levantar.`
    );
}
);

eventBus.on(EventType.BOOK_REJECTED, async (event) => {
    const { transactionId, userId } = event.payload;    
    const tx = await readTransactionById(transactionId);

    await createNotification(
        userId,
        "Pedido de livro rejeitado",
        `O teu pedido para o livro ${tx.physicalBookId} foi rejeitado.`
    );
}   
);

eventBus.on(EventType.BOOK_RETURNED, async (event) => {
    const { transactionId, userId } = event.payload;    
    const tx = await readTransactionById(transactionId);
    await createNotification(
        userId,
        "Livro devolvido com sucesso",
        `Devolveste o livro ${tx.physicalBookId} com sucesso. Obrigado!`
    );
}   
);

