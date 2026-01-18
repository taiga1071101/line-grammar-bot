const DRY_RUN = process.env.DRY_RUN === "1";

export async function replyToLine(replyToken, texts) {
  if (DRY_RUN) {
    console.log("[DRY_RUN] replyToken:", replyToken);
    console.log("[DRY_RUN] messages:", texts);
    return;
  }

  const token = process.env.CHANNEL_ACCESS_TOKEN;
  if (!token) throw new Error("CHANNEL_ACCESS_TOKEN is missing");

  const res = await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      replyToken,
      messages: texts.map((t) => ({ type: "text", text: t })),
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.log("LINE reply failed:", res.status, errText);
  }
}
