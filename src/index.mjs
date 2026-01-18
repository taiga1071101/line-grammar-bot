import { questions, pickRandomQuestion } from "./questions.mjs";
import { decodeBody, normalize, normalizeEnglish  } from "./util.mjs";
import { replyToLine } from "./line.mjs";
import { getUserState, putUserState } from "./state.mjs";
import { verifyLineSignature } from "./signature.mjs";

const USER_STATE_TABLE = process.env.USER_STATE_TABLE;

function isCorrect(input, q) {
  const n = normalize(input);
  if (n === normalize(q.answer)) return true;
  return (q.aliases || []).some((a) => n === normalize(a));
}

function isCorrectAnswer(input, q) {
  const inN = normalizeEnglish(input);
  const ansN = normalizeEnglish(q.answer);
  const aliasNs = (q.aliases || []).map(normalizeEnglish);

  if (inN === ansN) return true;
  if (aliasNs.includes(inN)) return true;

  // 正解フレーズで始まっていればOK（余計な語が続いても許容）
  if (inN.startsWith(ansN + " ")) return true;
  for (const a of aliasNs) {
    if (inN.startsWith(a + " ")) return true;
  }

  return false;
}

export const handler = async (event) => {
  console.log("A: start");

  const raw = decodeBody(event); // 文字列（JSON）
  const sig = event?.headers?.["x-line-signature"] || event?.headers?.["X-Line-Signature"];

  // 署名検証（DRY_RUNのときはスキップしてもOK）
  if (process.env.DRY_RUN !== "1") {
    const ok = verifyLineSignature(process.env.CHANNEL_SECRET, raw, sig);
    if (!ok) {
      console.log("Invalid signature");
      return { statusCode: 401, body: "invalid signature" };
    }
  }

  console.log("B: signature ok");

  const body = raw ? JSON.parse(raw) : null;

  const lineEvent = body?.events?.[0];
  const userId = lineEvent?.source?.userId;
  const text = lineEvent?.message?.text;
  const replyToken = lineEvent?.replyToken;

  if (!userId) return { statusCode: 200, body: "ok" };

  const state = await getUserState(USER_STATE_TABLE, userId);

  if (state.mode === "idle" && normalize(text) === normalize("出題")) {
    const q = pickRandomQuestion(state.lastQuestionId);

    await putUserState(USER_STATE_TABLE, {
      userId,
      mode: "waitingAnswer",
      currentQuestionId: q.id,
      lastQuestionId: q.id,
      askedAt: Date.now(),
    });

    await replyToLine(replyToken, [
      `① 日本語\n${q.jp}`,
      `② 英語（穴埋め）\n${q.blank}`,
    ]);

    return { statusCode: 200, body: "ok" };
  }

  // ★ここから採点：waitingAnswer のとき
  if (state.mode === "waitingAnswer") {
    const q = questions.find((x) => x.id === state.currentQuestionId);

    if (!q) {
      // 状態が壊れてた時の復旧
      await putUserState(USER_STATE_TABLE, { userId, mode: "idle" });
      await replyToLine(replyToken, ["状態がリセットされました。もう一度「出題」と送ってください。"]);
      return { statusCode: 200, body: "ok" };
    }

    const correct = isCorrectAnswer(text, q);

    await putUserState(USER_STATE_TABLE, { userId, mode: "idle" });

    if (correct) {
      await replyToLine(replyToken, [
        "✅ 正解！",
        `解答：${q.answer}`,
        q.explain ? `解説：${q.explain}` : "",
      ].filter(Boolean));
    } else {
      await replyToLine(replyToken, [
        "❌ 不正解",
        `あなたの回答：${text}`,
        `正解：${q.answer}`,
        q.explain ? `解説：${q.explain}` : "",
      ].filter(Boolean));
    }

    return { statusCode: 200, body: "ok" };
  }

  await replyToLine(replyToken, ["「出題」と送ると問題を出します。"]);
  return { statusCode: 200, body: "ok" };
};
