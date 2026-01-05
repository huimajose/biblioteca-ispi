const categoryMap: Record<number, string> = {
  1: "Livros",
  2: "Monografias",
  3: "Projetos",
  4: "Artigos Ciêntíficos",
};


export function getCategoryName(id: string | number | null): string {
  if (!id) return "#";
  const numericId = Number(id);
  return categoryMap[numericId] || `Categoria ${numericId}`;
}
