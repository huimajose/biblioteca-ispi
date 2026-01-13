import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { users } from "../schema";
import { eq } from "drizzle-orm";
import { clerkClient } from "@clerk/nextjs/server";

const db = drizzle(process.env.DATABASE_URL!);


export const createUsers = async (clerkId: string, primaryEmail: string, role: string) => {
  const user: typeof users.$inferInsert = {
    clerkId,
    primaryEmail,
    role
  };

  try {
    const res = await db.insert(users).values(user);
  } catch (error) {
    console.error("Error creating user:", error);
  }
};

export const readUsers = async () => {
  try {
    const res = await db.select().from(users);
    return res;
  } catch (error) {
    console.error("Error reading users:", error);
  }
};

export const updateUsers = async (clerkId: string, newUniversityId: string) => {
  try {
    // const res = await db.update(users).set({ universityId: newUniversityId }).where(eq(users.clerkId, clerkId));
  } catch (error) {
    console.error("Error updating user:", error);
  }
};

export const deleteUsers = async (clerkId: string) => {
  try {
    const res = await db.delete(users).where(eq(users.clerkId, clerkId));
  } catch (error) {
    console.error("Error deleting user:", error);
  }
};

export const getUserCount = async () => {
  const result = await db.select().from(users);
  return result.length;
};

export const getCountAllUsers = async () => {
  const response = await (await clerkClient()).users.getCount();
  return response;
}

export const insertUser = async (userData: any) => {
  try {
    const res = await db
      .insert(users)
      .values({
        clerkId: userData.clerkId,
        primaryEmail: userData.email, // 👈 aqui muda
        role: userData.role ?? "student",
      })
      .returning(); // importante no Neon

    console.log("✅ Usuário inserido:", res);
    return res;
  } catch (error: any) {
    console.error("❌ Erro ao inserir usuário:", error.message || error);
    throw new Error("Falha ao inserir usuário no banco");
  }
};


// 🆕 NOVA FUNÇÃO: Atualizar a role do usuário
export const updateUserRole = async (clerkId: string, newRole: string) => {
  try {
    const res = await db
      .update(users)
      .set({ role: newRole })
      .where(eq(users.clerkId, clerkId))
      .returning();

    console.log(`✅ Role atualizada para ${newRole} no usuário ${clerkId}`);
    return res;
  } catch (error: any) {
    console.error("❌ Erro ao atualizar role do usuário:", error.message || error);
    throw new Error("Falha ao atualizar role do usuário");
  }
};

export async function verifyAdmin(userId: string) {
  const [user] = await db.select().from(users).where(eq(users.clerkId, userId));
  return user?.role === "admin";
}



// 🆕 Buscar todos os admins do sistema
export async function getAllAdmins() {
  try {
    const admins = await db
      .select({
        clerkId: users.clerkId,
        primaryEmail: users.primaryEmail,
        role: users.role,
      })
      .from(users)
      .where(eq(users.role, "admin"));

    return admins;
  } catch (error) {
    console.error("❌ Erro ao buscar admins:", error);
    return [];
  }
}
