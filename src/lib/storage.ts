"use client";

import { pantryItems } from "@/data/pantryItems";

const STORAGE_KEY = "cook-advice-state-v1";

export interface SwipeRecord {
  recipeId: string;
  liked: boolean;
  swipedAt: number;
}

export interface AppState {
  tagScores: Record<string, number>;
  likedIds: string[];
  dislikedIds: string[];
  seenIds: string[]; // 直近の周回で既に見せたレシピ(一巡したらリセットされる)
  history: SwipeRecord[];
  pantry: Record<string, boolean>; // 食材ID -> 家にあるか(任意機能。未設定でもアプリは動く)
}

function defaultPantry(): Record<string, boolean> {
  const pantry: Record<string, boolean> = {};
  for (const item of pantryItems) {
    pantry[item.id] = item.defaultOwned;
  }
  return pantry;
}

function initialState(): AppState {
  return {
    tagScores: {},
    likedIds: [],
    dislikedIds: [],
    seenIds: [],
    history: [],
    pantry: defaultPantry(),
  };
}

export function loadState(): AppState {
  if (typeof window === "undefined") return initialState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState();
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return { ...initialState(), ...parsed };
  } catch {
    return initialState();
  }
}

export function saveState(state: AppState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/** 好み(タグ学習・履歴)だけをリセットする。在庫データは変更しない */
export function resetState(currentPantry: Record<string, boolean>): AppState {
  const fresh = { ...initialState(), pantry: currentPantry };
  saveState(fresh);
  return fresh;
}
