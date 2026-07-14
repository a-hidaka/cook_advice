"use client";

import { useEffect, useState } from "react";
import { recipes, Recipe } from "@/data/recipes";
import { AppState, loadState, saveState } from "@/lib/storage";
import RecipeDetailModal from "@/components/RecipeDetailModal";
import BottomNav from "@/components/BottomNav";

export default function LikedPage() {
  const [state, setState] = useState<AppState | null>(null);
  const [detailRecipe, setDetailRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    // localStorageはSSR時に存在しないため、マウント後にクライアントで読み込む
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(loadState());
  }, []);

  const likedRecipes = state
    ? Array.from(new Set(state.likedIds))
        .reverse()
        .map((id) => recipes.find((r) => r.id === id))
        .filter((r): r is Recipe => Boolean(r))
    : [];

  function removeLiked(id: string) {
    if (!state) return;
    const next: AppState = { ...state, likedIds: state.likedIds.filter((r) => r !== id) };
    saveState(next);
    setState(next);
  }

  return (
    <div className="mx-auto flex h-dvh w-full max-w-md flex-col">
      <header className="px-5 pb-2 pt-5">
        <h1 className="text-lg font-bold">作ってみたい！一覧</h1>
        <p className="mt-0.5 text-xs text-neutral-500">
          {likedRecipes.length}件のレシピがお気に入り登録されています
        </p>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pb-4">
        {likedRecipes.length === 0 ? (
          <div className="mt-16 flex flex-col items-center gap-2 text-center text-neutral-400">
            <span className="text-4xl">🍽️</span>
            <p className="text-sm">
              まだお気に入りがありません。
              <br />
              「提案」タブでレシピをlikeしてみましょう。
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {likedRecipes.map((recipe) => (
              <li
                key={recipe.id}
                className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow ring-1 ring-black/5 dark:bg-neutral-900"
              >
                <button
                  onClick={() => setDetailRecipe(recipe)}
                  className="flex flex-1 items-center gap-3 text-left"
                >
                  <span className="text-3xl">{recipe.emoji}</span>
                  <span className="flex flex-col">
                    <span className="font-semibold">{recipe.name}</span>
                    <span className="text-xs text-neutral-500">
                      {recipe.genre} ・ ⏱{recipe.timeMinutes}分 ・ 💰約{recipe.costYen}円
                    </span>
                  </span>
                </button>
                <button
                  onClick={() => removeLiked(recipe.id)}
                  aria-label="お気に入りから削除"
                  className="rounded-full px-2 py-1 text-neutral-400 hover:bg-neutral-100 hover:text-rose-500 dark:hover:bg-neutral-800"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>

      {detailRecipe && (
        <RecipeDetailModal recipe={detailRecipe} onClose={() => setDetailRecipe(null)} />
      )}

      <BottomNav />
    </div>
  );
}
