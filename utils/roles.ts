import { Roles } from "@/types/globals";
import { auth } from "@clerk/nextjs/server";
import { drizzle } from "drizzle-orm/neon-http";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

const db = drizzle(process.env.DATABASE_URL!);

export const checkRole = async (role: Roles) => {
  const { sessionClaims } = await auth();
  return sessionClaims?.metadata.role === role;
};

export async function getUserRole(userId: string) {
  const [user] = await db.select().from(users).where(eq(users.clerkId, userId));
  return user?.role || null;
}

// Mantém a função anterior para compatibilidade:
export async function verifyAdmin(userId: string) {
  const role = await getUserRole(userId);
  return role === "admin";
}
