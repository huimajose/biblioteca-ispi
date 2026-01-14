// utils/scoreHelper.ts
import { getUserRole } from "@/db/crud/users.crud";
export interface UserScore {
  points: number;
}

export const canSeeBookSuggestions = (score: UserScore): boolean => {
  // Exemplo de regra:
  // Pontuação abaixo de 50 → não pode ver sugestões
  // Pontuação 50-79 → sugestões limitadas
  // Pontuação >= 80 → sugestões completas
  if (score.points >= 50) return true;
  return false;
};

export const getSuggestionLevel = (score: UserScore): "Bloqueado" | "Limitado" | "Completo" => {
  if (score.points >= 80) return "Completo";
  if (score.points >= 50) return "Limitado";
  return "Bloqueado";
};


export const isStudent = async (userId: string): Promise<boolean> => {
  const role = await getUserRole(userId);
  return role === "student";
}