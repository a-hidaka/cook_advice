"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { recipes, Recipe } from "@/data/recipes";
import { pantryItems } from "@/data/pantryItems";
import { AppState, loadState, saveState, resetState } from "@/lib/storage";
import { applySwipeToScores, pickNextRecipe, topTags } from "@/lib/recommend";
import { requestAiRecipe } from "@/lib/aiRecipe";
import SwipeCard from "@/components/SwipeCard";
import RecipeDetailModal from "@/components/RecipeDetailModal";
import BottomNav from "@/components/BottomNav";

const AI_DAILY_LIMIT = 10;

function aiCallCountKey(): string {
  const today = new Date().toISOString().slice(0, 10);
  return `cook-advice-ai-calls-${today}`;
}

export default function HomePage() {
  const [state, setState] = useState<AppState | null>(null);
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [detailRecipe, setDetailRecipe] = useState<Recipe | null>(null);
  const [lastResult, setLastResult] = useState<"like" | "no" | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    // localStorageはSSR時に存在しないため、マウント後にクライアントで読み込む
    const loaded = loadState();
    const allRecipes = [...recipes, ...loaded.customRecipes];
    const { recipe, seenIds } = pickNextRecipe(allRecipes, loaded);
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

    const allRecipes = [...recipes, ...interim.customRecipes];
    const { recipe: nextRecipe, seenIds } = pickNextRecipe(allRecipes, interim);
    const finalState: AppState = { ...interim, seenIds };

    saveState(finalState);
    setState(finalState);
    setCurrentRecipe(nextRecipe);
    setLastResult(liked ? "like" : "no");
    window.setTimeout(() => setLastResult(null), 600);
  }

  function handleReset() {
    if (!state) return;
    if (!window.confirm("好みの学習データと履歴をすべてリセットしますか？(在庫・AI生成レシピは残ります)")) return;
    const fresh = resetState(state.pantry, state.customRecipes);
    const allRecipes = [...recipes, ...fresh.customRecipes];
    const { recipe, seenIds } = pickNextRecipe(allRecipes, fresh);
    const next = { ...fresh, seenIds };
    saveState(next);
    setState(next);
    setCurrentRecipe(recipe);
  }

  async function handleGenerateAi() {
    if (!state) return;
    const countKey = aiCallCountKey();
    const used = Number(window.localStorage.getItem(countKey) ?? "0");
    if (used >= AI_DAILY_LIMIT) {
      setAiError(`今日のAIレシピ生成回数の上限(${AI_DAILY_LIMIT}回)に達しました。また明日お試しください。`);
      return;
    }

    setAiLoading(true);
    setAiError(null);
    try {
      const preferredTags = topTags(state.tagScores, 5).map((t) => t.tag);
      const ownedPantryNames = pantryItems
        .filter((item) => state.pantry[item.id])
        .map((item) => item.name);
      const excludeNames = [...recipes, ...state.customRecipes]
        .slice(-15)
        .map((r) => r.name);

      const newRecipe = await requestAiRecipe({
        preferredTags,
        ownedPantryNames,
        excludeNames,
      });

      const customRecipes = [...state.customRecipes, newRecipe];
      const nextState: AppState = {
        ...state,
        customRecipes,
        seenIds: [...state.seenIds, newRecipe.id],
      };
      saveState(nextState);
      window.localStorage.setItem(countKey, String(used + 1));
      setState(nextState);
      setCurrentRecipe(newRecipe);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "レシピ生成に失敗しました。");
    } finally {
      setAiLoading(false);
    }
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

      <div className="flex items-center justify-center gap-8 pb-3">
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

      <div className="flex flex-col items-center gap-1 pb-4">
        <button
          onClick={handleGenerateAi}
          disabled={aiLoading}
          className="rounded-full bg-orange-500 px-4 py-2 text-sm font-medium text-white shadow disabled:opacity-60"
        >
          {aiLoading ? "AIが考え中…" : "🤖 AIにレシピを考えてもらう"}
        </button>
        {aiError && <p className="max-w-xs text-center text-xs text-rose-500">{aiError}</p>}
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
