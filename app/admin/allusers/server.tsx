"use server";

import { readUsers } from "@/db/crud/users.crud";
import { clerkClient } from "@clerk/nextjs/server";

export async function fetchUsers() {
  const { data: users } = await clerkClient.users.getUserList();

  console.log("Fetched users: ", users)

  const simplifiedUsers = users.map((user) => ({
    id: user.id, // <-- ID real do Clerk
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.emailAddresses?.[0]?.emailAddress || "",
    role: user.publicMetadata?.role || "Estudante",
    imageUrl: user.imageUrl || "",
  }));

  return simplifiedUsers;
}

export async function changeRole(userId: string, newRole: string) {
  // ✅ Aqui não precisa de await clerkClient()
  await clerkClient.users.updateUser(userId, {
    publicMetadata: { role: newRole },
  });
}

export const getUsersWithClerk = async () => {
  const usersList = await readUsers();

  console.log("users do Banco: ", usersList);

  const enriched = await Promise.all(
    (usersList ?? []).map(async (item) => {
      try {
        // ✅ clerkClient é usado diretamente
        const clerkUser = await clerkClient.users.getUser(item.clerkId);

        return {
          id: item.clerkId, // ✅ importante para mudar role
          profile: clerkUser.imageUrl,
          fullName: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim(),
          email: clerkUser.emailAddresses?.[0]?.emailAddress || "Unknown Email",
          role: clerkUser.publicMetadata?.role ?? "Estudante",
        };
      } catch (err) {
        console.error("Clerk Fetch Error:", err);
        return {
          id: item.clerkId || "unknown",
          profile: null,
          fullName: "Desconhecido",
          email: item.primaryEmail || "Desconhecido",
          role: "N/D",
        };
      }
    })
  );

  return enriched;
};
