import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { notifications } from "../schema";
import { eq } from "drizzle-orm";

const db = drizzle(process.env.DATABASE_URL!);

export const readNotificationsByUserId = async (userId: string) => {
  try {
    const res = await db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, userId))
        .orderBy(notifications.createdAt, "asc");
    return res;
  } catch (error) {
    console.error("Error reading notifications:", error);
  }

};

export const markNotificationsAsReadByUserId = async (userId: string) => {  
    try {
        const res = await db
            .update(notifications)
            .set({ read: true })
            .where(eq(notifications.userId, userId));
        return res;
    } catch (error) {
        console.error("Error marking notifications as read:", error);
    }
};