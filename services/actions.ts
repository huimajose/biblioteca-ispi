import { db } from "@/db";
import { notifications } from "@/db/schema";


export async function createNotification(
  userId: string,
  title: string,
  message: string
) {
  await db.insert(notifications)
    .values({ userId, title, message })
    .returning(); // retorna o registro criado

  // 🔴 Emite em tempo real
}
