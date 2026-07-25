import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { pantryItems } from "@/data/pantryItems";
import { ALL_TAGS } from "@/data/recipes";

const PANTRY_IDS = pantryItems.map((item) => item.id);

const RECIPE_SCHEMA = {
  type: "object",
  properties: {
    name: { type: "string" },
    emoji: { type: "string" },
    genre: {
      type: "string",
      enum: ["和食", "洋食", "中華", "韓国", "エスニック"],
    },
    costYen: { type: "integer" },
    timeMinutes: { type: "integer" },
    difficulty: { type: "integer", enum: [1, 2, 3] },
    servings: { type: "integer" },
    tags: { type: "array", items: { type: "string" } },
    pantryIds: {
      type: "array",
      items: { type: "string", enum: PANTRY_IDS },
    },
    ingredients: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          amount: { type: "string" },
        },
        required: ["name", "amount"],
        additionalProperties: false,
      },
    },
    steps: { type: "array", items: { type: "string" } },
  },
  required: [
    "name",
    "emoji",
    "genre",
    "costYen",
    "timeMinutes",
    "difficulty",
    "servings",
    "tags",
    "pantryIds",
    "ingredients",
    "steps",
  ],
  additionalProperties: false,
} as const;

interface GenerateRecipeRequestBody {
  preferredTags?: string[];
  ownedPantryNames?: string[];
  excludeNames?: string[];
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "サーバーにANTHROPIC_API_KEYが設定されていません。Vercelの環境変数を確認してください。",
      },
      { status: 500 }
    );
  }

  const body = (await request.json().catch(() => ({}))) as GenerateRecipeRequestBody;
  const preferredTags = body.preferredTags ?? [];
  const ownedPantryNames = body.ownedPantryNames ?? [];
  const excludeNames = body.excludeNames ?? [];

  const prompt = `学生の自炊向けに、安くて時短な新しいレシピを1つ考えてください。

条件:
- 1人分、日本のスーパーで手に入る食材のみを使う
- 費用目安200〜500円、調理時間30分以内
- tags(タグ)はできるだけ次の語彙から選ぶ(適切な新しい語があれば追加してもよい): ${ALL_TAGS.join("、")}
- pantryIdsは次のIDの中から、このレシピで実際に使う食材のIDだけを選ぶ(該当なしなら空配列): ${PANTRY_IDS.join("、")}
- ユーザーが好む傾向のタグ: ${preferredTags.length > 0 ? preferredTags.join("、") : "特になし"}
- ユーザーの家にある食材: ${ownedPantryNames.length > 0 ? ownedPantryNames.join("、") : "不明"}
- 次に挙げる既存の料理とは異なる新しい料理にする: ${excludeNames.length > 0 ? excludeNames.join("、") : "なし"}
`;

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: "claude-opus-5",
      max_tokens: 2048,
      output_config: {
        effort: "low",
        format: { type: "json_schema", schema: RECIPE_SCHEMA },
      },
      messages: [{ role: "user", content: prompt }],
    });

    if (response.stop_reason === "refusal") {
      return NextResponse.json(
        { error: "AIがこの内容の生成を拒否しました。もう一度お試しください。" },
        { status: 422 }
      );
    }

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json(
        { error: "AIからの応答が空でした。" },
        { status: 502 }
      );
    }

    const recipe = JSON.parse(textBlock.text);
    return NextResponse.json({ recipe });
  } catch (err) {
    console.error("generate-recipe error", err);
    return NextResponse.json(
      { error: "レシピ生成に失敗しました。しばらくしてから再試行してください。" },
      { status: 500 }
    );
  }
}
