"use client";

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
}

function initialState(): AppState {
  return {
    tagScores: {},
    likedIds: [],
    dislikedIds: [],
    seenIds: [],
    history: [],
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

export function resetState(): AppState {
  const fresh = initialState();
  saveState(fresh);
  return fresh;
}
