"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { recipes, Recipe } from "@/data/recipes";
import { AppState, loadState, saveState, resetState } from "@/lib/storage";
import { applySwipeToScores, pickNextRecipe, topTags } from "@/lib/recommend";
import SwipeCard from "@/components/SwipeCard";
import RecipeDetailModal from "@/components/RecipeDetailModal";
import BottomNav from "@/components/BottomNav";

export default function HomePage() {
  const [state, setState] = useState<AppState | null>(null);
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [detailRecipe, setDetailRecipe] = useState<Recipe | null>(null);
  const [lastResult, setLastResult] = useState<"like" | "no" | null>(null);

  useEffect(() => {
    // localStorageはSSR時に存在しないため、マウント後にクライアントで読み込む
    const loaded = loadState();
    const { recipe, seenIds } = pickNextRecipe(recipes, loaded);
    const next = { ...loaded, seenIds };
    saveState(next);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(next);
    setCurrentRecipe(recipe);
  }, []);

  function handleSwipe(liked: boolean) {
    if (!state || !currentRecipe) return;

    const tagScores = applySwipeToScores(state.tagScores, currentRecipe, liked);
    const likedIds = liked ? [...state.likedIds, currentRecipe.id] : state.likedIds;
    const dislikedIds = liked ? state.dislikedIds : [...state.dislikedIds, currentRecipe.id];
    const history = [
      ...state.history,
      { recipeId: currentRecipe.id, liked, swipedAt: Date.now() },
    ];
    const interim: AppState = { ...state, tagScores, likedIds, dislikedIds, history };

    const { recipe: nextRecipe, seenIds } = pickNextRecipe(recipes, interim);
    const finalState: AppState = { ...interim, seenIds };

    saveState(finalState);
    setState(finalState);
    setCurrentRecipe(nextRecipe);
    setLastResult(liked ? "like" : "no");
    window.setTimeout(() => setLastResult(null), 600);
  }

  function handleReset() {
    if (!state) return;
    if (!window.confirm("好みの学習データと履歴をすべてリセットしますか？(在庫データは残ります)")) return;
    const fresh = resetState(state.pantry);
    const { recipe, seenIds } = pickNextRecipe(recipes, fresh);
    const next = { ...fresh, seenIds };
    saveState(next);
    setState(next);
    setCurrentRecipe(recipe);
  }

  const preferredTags = state ? topTags(state.tagScores, 3) : [];

  return (
    <div className="mx-auto flex h-dvh w-full max-w-md flex-col">
      <header className="flex items-center justify-between px-5 pb-2 pt-5">
        <div>
          <h1 className="text-lg font-bold">今日は何作る？</h1>
          {preferredTags.length > 0 && (
            <p className="mt-0.5 text-xs text-neutral-500">
              好み: {preferredTags.map((t) => `#${t.tag}`).join(" ")}
            </p>
          )}
        </div>
        <button
          onClick={handleReset}
          className="text-xs text-neutral-400 underline-offset-2 hover:underline"
        >
          好みをリセット
        </button>
      </header>

      <main className="relative flex-1 px-5 pb-3">
        <div className="relative h-full min-h-[420px]">
          <AnimatePresence mode="popLayout">
            {currentRecipe && (
              <SwipeCard
                key={currentRecipe.id}
                recipe={currentRecipe}
                pantry={state?.pantry ?? {}}
                onSwiped={handleSwipe}
                onOpenDetail={() => setDetailRecipe(currentRecipe)}
              />
            )}
          </AnimatePresence>
        </div>
      </main>

      <div className="flex items-center justify-center gap-8 pb-4">
        <button
          aria-label="興味ない"
          onClick={() => handleSwipe(false)}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-2xl text-rose-500 shadow-lg ring-1 ring-black/5 active:scale-95 dark:bg-neutral-800"
        >
          ✕
        </button>
        <button
          aria-label="作ってみたい"
          onClick={() => handleSwipe(true)}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-2xl text-emerald-500 shadow-lg ring-1 ring-black/5 active:scale-95 dark:bg-neutral-800"
        >
          ♥
        </button>
      </div>

      {lastResult && (
        <div className="pointer-events-none fixed inset-x-0 top-6 z-40 flex justify-center">
          <div className="rounded-full bg-neutral-900/80 px-4 py-1.5 text-sm text-white">
            {lastResult === "like" ? "作ってみたい！に追加 ❤️" : "OK、次を提案するね"}
          </div>
        </div>
      )}

      {detailRecipe && (
        <RecipeDetailModal
          recipe={detailRecipe}
          pantry={state?.pantry ?? {}}
          onClose={() => setDetailRecipe(null)}
        />
      )}

      <BottomNav />
    </div>
  );
}
