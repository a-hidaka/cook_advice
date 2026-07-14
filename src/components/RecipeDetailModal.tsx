"use client";

import { Recipe } from "@/data/recipes";

interface RecipeDetailModalProps {
  recipe: Recipe;
  onClose: () => void;
}

export default function RecipeDetailModal({ recipe, onClose }: RecipeDetailModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl dark:bg-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-2">
          <div>
            <div className="text-5xl">{recipe.emoji}</div>
            <h2 className="mt-2 text-2xl font-bold">{recipe.name}</h2>
            <div className="mt-1 flex flex-wrap gap-3 text-sm text-neutral-600 dark:text-neutral-400">
              <span>⏱ {recipe.timeMinutes}分</span>
              <span>💰 約{recipe.costYen}円</span>
              <span>👥 {recipe.servings}人分</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-neutral-100 px-3 py-1 text-sm text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300"
          >
            閉じる
          </button>
        </div>

        <section className="mb-5">
          <h3 className="mb-2 font-semibold">材料</h3>
          <ul className="space-y-1 text-sm">
            {recipe.ingredients.map((ing) => (
              <li key={ing.name} className="flex justify-between border-b border-dashed border-neutral-200 py-1 dark:border-neutral-700">
                <span>{ing.name}</span>
                <span className="text-neutral-500">{ing.amount}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="mb-2 font-semibold">作り方</h3>
          <ol className="space-y-2 text-sm">
            {recipe.steps.map((step, i) => (
              <li key={i} className="flex gap-2">
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>

        {recipe.memo && (
          <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
            💡 {recipe.memo}
          </p>
        )}
      </div>
    </div>
  );
}
