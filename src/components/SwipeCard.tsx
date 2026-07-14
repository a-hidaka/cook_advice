"use client";

import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Recipe } from "@/data/recipes";
import { getPantryMatch } from "@/lib/pantryMatch";

const SWIPE_THRESHOLD = 100;

interface SwipeCardProps {
  recipe: Recipe;
  pantry: Record<string, boolean>;
  onSwiped: (liked: boolean) => void;
  onOpenDetail: () => void;
}

export default function SwipeCard({ recipe, pantry, onSwiped, onOpenDetail }: SwipeCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const likeOpacity = useTransform(x, [20, 120], [0, 1]);
  const nopeOpacity = useTransform(x, [-120, -20], [1, 0]);
  const pantryMatch = getPantryMatch(recipe, pantry);

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x > SWIPE_THRESHOLD) {
      onSwiped(true);
    } else if (info.offset.x < -SWIPE_THRESHOLD) {
      onSwiped(false);
    }
  }

  return (
    <motion.div
      className="absolute inset-0 touch-none select-none"
      style={{ x, rotate }}
      drag="x"
      dragSnapToOrigin
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="relative flex h-full w-full flex-col overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-black/5 dark:bg-neutral-900">
        <motion.div
          style={{ opacity: likeOpacity }}
          className="pointer-events-none absolute left-4 top-4 z-10 rotate-[-12deg] rounded-lg border-4 border-emerald-500 px-3 py-1 text-2xl font-bold text-emerald-500"
        >
          LIKE
        </motion.div>
        <motion.div
          style={{ opacity: nopeOpacity }}
          className="pointer-events-none absolute right-4 top-4 z-10 rotate-[12deg] rounded-lg border-4 border-rose-500 px-3 py-1 text-2xl font-bold text-rose-500"
        >
          NO
        </motion.div>

        <div className="flex flex-1 flex-col items-center justify-center bg-gradient-to-br from-orange-100 to-amber-50 text-8xl dark:from-neutral-800 dark:to-neutral-900">
          {recipe.emoji}
        </div>

        <div className="flex flex-col gap-2 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">{recipe.name}</h2>
            <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
              {recipe.genre}
            </span>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-neutral-600 dark:text-neutral-400">
            <span>⏱ {recipe.timeMinutes}分</span>
            <span>💰 約{recipe.costYen}円</span>
            <span>{"★".repeat(recipe.difficulty)}{"☆".repeat(3 - recipe.difficulty)}</span>
          </div>
          {pantryMatch.missing.length === 0 ? (
            <span className="self-start rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
              ✅ 今の在庫で作れる
            </span>
          ) : pantryMatch.missing.length <= 2 ? (
            <span className="self-start rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
              🛒 あと{pantryMatch.missing.map((i) => i.name).join("・")}で作れる
            </span>
          ) : null}
          <div className="flex flex-wrap gap-1.5">
            {recipe.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
              >
                #{tag}
              </span>
            ))}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetail();
            }}
            className="mt-1 self-start text-sm font-medium text-orange-600 underline-offset-2 hover:underline dark:text-orange-400"
          >
            レシピを見る →
          </button>
        </div>
      </div>
    </motion.div>
  );
}
