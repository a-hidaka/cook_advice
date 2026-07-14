export type PantryCategory = "seasoning" | "staple" | "vegetable" | "protein";

export interface PantryItem {
  id: string;
  name: string;
  category: PantryCategory;
  /** 多くの家庭に常備されている前提でtrue(調味料・主食など) */
  defaultOwned: boolean;
}

export const PANTRY_CATEGORY_LABELS: Record<PantryCategory, string> = {
  seasoning: "調味料",
  staple: "主食・乾物",
  vegetable: "野菜",
  protein: "肉・魚・卵・豆腐など",
};

export const pantryItems: PantryItem[] = [
  // 調味料(デフォルトで「ある」扱い)
  { id: "soy-sauce", name: "醤油", category: "seasoning", defaultOwned: true },
  { id: "salt", name: "塩", category: "seasoning", defaultOwned: true },
  { id: "pepper", name: "こしょう", category: "seasoning", defaultOwned: true },
  { id: "sugar", name: "砂糖", category: "seasoning", defaultOwned: true },
  { id: "vinegar", name: "酢", category: "seasoning", defaultOwned: true },
  { id: "sesame-oil", name: "ごま油", category: "seasoning", defaultOwned: true },
  { id: "cooking-oil", name: "サラダ油・オリーブオイル", category: "seasoning", defaultOwned: true },
  { id: "mirin", name: "みりん", category: "seasoning", defaultOwned: true },
  { id: "miso", name: "味噌", category: "seasoning", defaultOwned: true },
  { id: "mentsuyu", name: "めんつゆ", category: "seasoning", defaultOwned: true },
  { id: "ketchup", name: "ケチャップ", category: "seasoning", defaultOwned: true },
  { id: "mayo", name: "マヨネーズ", category: "seasoning", defaultOwned: true },
  { id: "sauce", name: "ソース(中濃・お好み焼き用など)", category: "seasoning", defaultOwned: true },
  { id: "oyster-sauce", name: "オイスターソース", category: "seasoning", defaultOwned: true },
  { id: "doubanjiang", name: "豆板醤・コチュジャン", category: "seasoning", defaultOwned: false },
  { id: "curry-roux", name: "カレールー", category: "seasoning", defaultOwned: false },
  { id: "chicken-stock", name: "鶏がらスープの素", category: "seasoning", defaultOwned: true },
  { id: "flour-starch", name: "小麦粉・片栗粉", category: "seasoning", defaultOwned: true },
  { id: "dashi", name: "だしの素", category: "seasoning", defaultOwned: true },
  { id: "ponzu", name: "ポン酢", category: "seasoning", defaultOwned: true },
  { id: "nanpla", name: "ナンプラー", category: "seasoning", defaultOwned: false },

  // 主食・乾物(デフォルトで「ある」扱い)
  { id: "rice", name: "米・ごはん", category: "staple", defaultOwned: true },
  { id: "pasta", name: "パスタ", category: "staple", defaultOwned: false },
  { id: "udon", name: "うどん(茹で・乾麺)", category: "staple", defaultOwned: false },
  { id: "instant-ramen", name: "インスタントラーメン", category: "staple", defaultOwned: false },
  { id: "nori", name: "海苔", category: "staple", defaultOwned: true },
  { id: "panko", name: "パン粉", category: "staple", defaultOwned: false },

  // 野菜(デフォルトで「ない」扱い)
  { id: "cabbage", name: "キャベツ", category: "vegetable", defaultOwned: false },
  { id: "moyashi", name: "もやし", category: "vegetable", defaultOwned: false },
  { id: "carrot", name: "にんじん", category: "vegetable", defaultOwned: false },
  { id: "onion", name: "玉ねぎ", category: "vegetable", defaultOwned: false },
  { id: "potato", name: "じゃがいも", category: "vegetable", defaultOwned: false },
  { id: "green-onion", name: "長ねぎ・ニラ", category: "vegetable", defaultOwned: false },
  { id: "bell-pepper", name: "ピーマン・パプリカ", category: "vegetable", defaultOwned: false },
  { id: "cucumber", name: "きゅうり", category: "vegetable", defaultOwned: false },
  { id: "tomato", name: "トマト(缶含む)", category: "vegetable", defaultOwned: false },
  { id: "daikon", name: "大根", category: "vegetable", defaultOwned: false },
  { id: "napa-cabbage", name: "白菜", category: "vegetable", defaultOwned: false },
  { id: "broccoli", name: "ブロッコリー", category: "vegetable", defaultOwned: false },
  { id: "avocado", name: "アボカド", category: "vegetable", defaultOwned: false },
  { id: "garlic", name: "にんにく", category: "vegetable", defaultOwned: false },
  { id: "burdock", name: "ごぼう", category: "vegetable", defaultOwned: false },
  { id: "bok-choy", name: "チンゲン菜", category: "vegetable", defaultOwned: false },

  // 肉・魚・卵・豆腐など(デフォルトで「ない」扱い)
  { id: "chicken", name: "鶏肉", category: "protein", defaultOwned: false },
  { id: "pork", name: "豚肉", category: "protein", defaultOwned: false },
  { id: "beef-mix", name: "牛肉・合いびき肉", category: "protein", defaultOwned: false },
  { id: "egg", name: "卵", category: "protein", defaultOwned: true },
  { id: "tofu", name: "豆腐", category: "protein", defaultOwned: false },
  { id: "natto", name: "納豆", category: "protein", defaultOwned: false },
  { id: "tuna-can", name: "ツナ缶", category: "protein", defaultOwned: false },
  { id: "saba-can", name: "サバ缶", category: "protein", defaultOwned: false },
  { id: "salmon-flake", name: "鮭フレーク", category: "protein", defaultOwned: false },
  { id: "bacon-sausage-ham", name: "ベーコン・ウインナー・ハム", category: "protein", defaultOwned: false },
  { id: "spam", name: "スパム", category: "protein", defaultOwned: false },
  { id: "kimchi", name: "キムチ", category: "protein", defaultOwned: false },
  { id: "soy-milk", name: "豆乳", category: "protein", defaultOwned: false },
  { id: "cheese", name: "粉チーズ", category: "protein", defaultOwned: false },
];

export const PANTRY_CATEGORY_ORDER: PantryCategory[] = [
  "vegetable",
  "protein",
  "staple",
  "seasoning",
];
