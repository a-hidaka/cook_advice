import { Recipe } from "@/data/recipes";

interface GenerateRecipeParams {
  preferredTags: string[];
  ownedPantryNames: string[];
  excludeNames: string[];
}

type GeneratedRecipeFields = Omit<Recipe, "id">;

export async function requestAiRecipe(params: GenerateRecipeParams): Promise<Recipe> {
  const res = await fetch("/api/generate-recipe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  const data = await res.json();
  if (!res.ok || !data.recipe) {
    throw new Error(data.error ?? "レシピ生成に失敗しました。");
  }

  const generated = data.recipe as GeneratedRecipeFields;
  return {
    ...generated,
    id: `ai-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  };
}
