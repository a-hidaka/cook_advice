"use client";

import { useEffect, useState } from "react";
import {
  pantryItems,
  PANTRY_CATEGORY_LABELS,
  PANTRY_CATEGORY_ORDER,
} from "@/data/pantryItems";
import { AppState, loadState, saveState } from "@/lib/storage";
import BottomNav from "@/components/BottomNav";

export default function PantryPage() {
  const [state, setState] = useState<AppState | null>(null);

  useEffect(() => {
    // localStorageはSSR時に存在しないため、マウント後にクライアントで読み込む
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(loadState());
  }, []);

  function toggleItem(id: string) {
    if (!state) return;
    const next: AppState = {
      ...state,
      pantry: { ...state.pantry, [id]: !state.pantry[id] },
    };
    saveState(next);
    setState(next);
  }

  const ownedCount = state
    ? Object.values(state.pantry).filter(Boolean).length
    : 0;

  return (
    <div className="mx-auto flex h-dvh w-full max-w-md flex-col">
      <header className="px-5 pb-2 pt-5">
        <h1 className="text-lg font-bold">おうちの在庫</h1>
        <p className="mt-0.5 text-xs text-neutral-500">
          チェックした食材は「作れるレシピ」の判定・提案に使われます(任意機能・未設定でもOK)。
          今 {ownedCount}品あり
        </p>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pb-4">
        {!state ? null : (
          <div className="flex flex-col gap-6">
            {PANTRY_CATEGORY_ORDER.map((category) => (
              <section key={category}>
                <h2 className="mb-2 text-sm font-semibold text-neutral-500">
                  {PANTRY_CATEGORY_LABELS[category]}
                </h2>
                <div className="grid grid-cols-2 gap-2">
                  {pantryItems
                    .filter((item) => item.category === category)
                    .map((item) => {
                      const owned = Boolean(state.pantry[item.id]);
                      return (
                        <button
                          key={item.id}
                          onClick={() => toggleItem(item.id)}
                          className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm transition-colors ${
                            owned
                              ? "border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                              : "border-neutral-200 bg-white text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
                          }`}
                        >
                          <span>{owned ? "✅" : "⬜️"}</span>
                          <span>{item.name}</span>
                        </button>
                      );
                    })}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
