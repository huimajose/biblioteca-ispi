import { clerkClient } from "@clerk/nextjs/server";
import { readVerifyPending } from "@/db/crud/verifyPending.crud";

export const getVerifyPendingWithClerk = async () => {
  const verifyPendingList = await readVerifyPending();

  const enriched = await Promise.all(
    verifyPendingList.map(async (item) => {
      try {
        const client = await clerkClient();
        const clerkUser = await client.users.getUser(item.clerkId);

        return {
          ...item,
          fullName: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim(),
          email: clerkUser.emailAddresses[0]?.emailAddress ?? "Sem e-mail",
          imageUrl: clerkUser.imageUrl,
        };
      } catch (err) {
        console.error("Clerk Fetch Error:", err);
        return {
          ...item,
          fullName: "Usuário não encontrado",
          email: "Desconhecido",
          imageUrl: null,
        };
      }
    })
  );

  return enriched;
};


export async function changeRole(userId: string, newRole: string) {
  // ✅ Aqui não precisa de await clerkClient()
  await clerkClient.users.updateUser(userId, {
    publicMetadata: { role: newRole },
  });
}
