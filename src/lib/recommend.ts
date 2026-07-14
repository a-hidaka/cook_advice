import { Recipe } from "@/data/recipes";
import { AppState } from "./storage";
import { getPantryMatch } from "./pantryMatch";

const TAG_SCORE_MIN = -5;
const TAG_SCORE_MAX = 5;
const EXPLORATION_RATE = 0.25; // ワンパターン化を防ぐための完全ランダム抽選の確率
const PANTRY_BOOST_WEIGHT = 0.3; // 在庫マッチによる重みの上乗せ幅(あくまで軽いブースト)

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** like/noの結果をタグの好みスコアに反映する */
export function applySwipeToScores(
  tagScores: Record<string, number>,
  recipe: Recipe,
  liked: boolean
): Record<string, number> {
  const next = { ...tagScores };
  const delta = liked ? 1 : -1;
  for (const tag of recipe.tags) {
    next[tag] = clamp((next[tag] ?? 0) + delta, TAG_SCORE_MIN, TAG_SCORE_MAX);
  }
  return next;
}

/** レシピのスコア = 保有タグの好みスコア合計をタグ数で正規化したもの */
export function scoreRecipe(
  recipe: Recipe,
  tagScores: Record<string, number>
): number {
  if (recipe.tags.length === 0) return 0;
  const total = recipe.tags.reduce((sum, tag) => sum + (tagScores[tag] ?? 0), 0);
  return total / recipe.tags.length;
}

function weightedPick(
  candidates: Recipe[],
  tagScores: Record<string, number>,
  pantry: Record<string, boolean>
): Recipe {
  const weights = candidates.map((r) => {
    const score = scoreRecipe(r, tagScores);
    // スコアが低い/マイナスのレシピにも最低限のチャンスを残す
    const base = Math.max(0.08, 1 + score * 0.5);
    // 在庫でそのまま作れるレシピを軽く優先する(絶対条件にはしない)
    const pantryRatio = getPantryMatch(r, pantry).ratio;
    return base * (1 + pantryRatio * PANTRY_BOOST_WEIGHT);
  });
  const total = weights.reduce((a, b) => a + b, 0);
  let threshold = Math.random() * total;
  for (let i = 0; i < candidates.length; i++) {
    threshold -= weights[i];
    if (threshold <= 0) return candidates[i];
  }
  return candidates[candidates.length - 1];
}

/**
 * 次に見せるレシピを1件選ぶ。
 * - 直近で見せた分(seenIds)は除外し、一巡したらリセットして再度出現できるようにする
 * - EXPLORATION_RATE の確率で完全ランダムに選び、好みタグへの偏り(ワンパターン化)を防ぐ
 */
export function pickNextRecipe(
  allRecipes: Recipe[],
  state: AppState
): { recipe: Recipe; seenIds: string[] } {
  let unseen = allRecipes.filter((r) => !state.seenIds.includes(r.id));
  let seenIds = state.seenIds;

  if (unseen.length === 0) {
    // 一巡したので履歴をリセットして再度候補に含める
    seenIds = [];
    unseen = allRecipes;
  }

  const useExploration = Math.random() < EXPLORATION_RATE;
  const recipe = useExploration
    ? unseen[Math.floor(Math.random() * unseen.length)]
    : weightedPick(unseen, state.tagScores, state.pantry);

  return { recipe, seenIds: [...seenIds, recipe.id] };
}

/** タグごとの好みスコアを上位順に返す(お気に入り傾向の可視化用) */
export function topTags(
  tagScores: Record<string, number>,
  count = 5
): { tag: string; score: number }[] {
  return Object.entries(tagScores)
    .filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([tag, score]) => ({ tag, score }));
}
