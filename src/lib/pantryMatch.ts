import { Recipe } from "@/data/recipes";
import { pantryItems, PantryItem } from "@/data/pantryItems";

const itemById = new Map(pantryItems.map((item) => [item.id, item]));

export interface PantryMatch {
  /** 0〜1。保有タグの割合(pantryIdsが無いレシピは1として扱う=常に「作れる」判定) */
  ratio: number;
  missing: PantryItem[];
}

export function getPantryMatch(
  recipe: Recipe,
  pantry: Record<string, boolean>
): PantryMatch {
  if (recipe.pantryIds.length === 0) {
    return { ratio: 1, missing: [] };
  }

  const missing = recipe.pantryIds
    .filter((id) => !pantry[id])
    .map((id) => itemById.get(id))
    .filter((item): item is PantryItem => Boolean(item));

  const ownedCount = recipe.pantryIds.length - missing.length;
  const ratio = ownedCount / recipe.pantryIds.length;

  return { ratio, missing };
}
