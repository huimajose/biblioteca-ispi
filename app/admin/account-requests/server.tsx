"use server";

import { clerkClient } from "@clerk/nextjs/server";
import {
  readVerifyPending,
  deleteVerifyPending,
  findVerifyPending,
  createVerifyPending
} from "@/db/crud/verifyPending.crud";
import { insertUser, readUsers } from "@/db/crud/users.crud";



// 🔹 1. Buscar pendentes + enriquecer com dados do Clerk
export const getVerifyPendingWithClerk = async () => {
  const verifyPendingList = await readVerifyPending();

  const enriched = await Promise.all(
    verifyPendingList.map(async (item: any) => {
      try {
        const clerk = await clerkClient();
        const clerkUser = await clerk.users.getUser(item.clerkId);

        return {
          ...item,
          fullName: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim(),
          email: clerkUser.emailAddresses?.[0]?.emailAddress ?? item.email,
          imageUrl: clerkUser.imageUrl,
        };
      } catch (err) {
        console.error("Erro ao buscar usuário no Clerk:", err);
        return {
          ...item,
          fullName: "Usuário não encontrado",
          imageUrl: null,
        };
      }
    })
  );

  return enriched;
};

// 🔹 2. Aceitar usuário (mover para tabela users e remover dos pendentes)
export const acceptUser = async (clerkId: string, email: string) => {
  try {
    // Verifica se está realmente pendente
    const existing = await findVerifyPending(clerkId);
    if (!existing.length) {
      throw new Error("Usuário não encontrado na lista de pendentes");
    }

    const client = await clerkClient();
    const clerkUser = await client.users.getUser(clerkId);

    // Insere na tabela users
    await insertUser({
      clerkId,
      email,
      role: "student",
    });

    // Remove da tabela verify_pending
    await deleteVerifyPending(clerkId);

    console.log(`✅ Usuário ${email} aprovado e movido para users.`);
    return { success: true };
  } catch (error) {
    console.error("❌ Erro ao aceitar usuário:", error);
    return { success: false, error: "Erro ao aceitar usuário" };
  }
};

// 🔹 3. Rejeitar usuário (somente remove da tabela)
export const rejectUser = async (clerkId: string) => {
  try {
    await deleteVerifyPending(clerkId);
    console.log(`🚫 Usuário ${clerkId} rejeitado e removido da lista.`);
    return { success: true };
  } catch (error) {
    console.error("❌ Erro ao rejeitar usuário:", error);
    return { success: false, error: "Erro ao rejeitar usuário" };
  }
};


export const syncClerkToVerifyPending = async () => {
  try {
    const clerk = await clerkClient();
    const { data: allClerkUsers } = await clerk.users.getUserList({ limit: 100 });

    // Ler usuários existentes no banco
    const [pendingUsers, approvedUsers] = await Promise.all([
      readVerifyPending(),
      readUsers(),
    ]);

    const existingClerkIds = new Set([
      ...pendingUsers.map((u: any) => u.clerkId),
      ...approvedUsers.map((u: any) => u.clerkId),
    ]);

    // Filtrar só os que ainda não estão no banco
    const newUsers = allClerkUsers.filter((user) => !existingClerkIds.has(user.id));

    if (newUsers.length === 0) {
      console.log("✅ Nenhum novo usuário para sincronizar.");
      return { success: true, added: 0 };
    }

    // Inserir novos pendentes
    for (const user of newUsers) {
      const email = user.emailAddresses?.[0]?.emailAddress ?? "sem-email@dominio.com";
      await createVerifyPending(user.id, email);
    }

    console.log(`✅ ${newUsers.length} usuários adicionados à lista de pendentes.`);
    return { success: true, added: newUsers.length };
  } catch (error) {
    console.error("❌ Erro ao sincronizar usuários:", error);
    return { success: false, error: "Erro ao sincronizar Clerk → verify_pending" };
  }
};