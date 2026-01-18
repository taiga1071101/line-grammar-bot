export function normalize(text) {
    return (text || "")
      .trim()
      .toLowerCase()
      .replace(/[.。!！?？,，]/g, "")
      .replace(/\s+/g, " ");
}

export function decodeBody(event) {
    if (!event?.body) return null;
    return event.isBase64Encoded
        ? Buffer.from(event.body, "base64").toString("utf8")
        : event.body;
}

export function normalizeEnglish(text) {
    let t = (text || "")
        .trim()
        .toLowerCase()
        .replace(/[.。!！?？,，]/g, "")
        .replace(/\s+/g, " ");

    // よくある短縮形の吸収（必要に応じて増やす）
    t = t
        .replace(/\bwon't\b/g, "will not")
        .replace(/\bcan't\b/g, "cannot")
        .replace(/\bit's\b/g, "it is")
        .replace(/\bi'm\b/g, "i am")
        .replace(/\bdon't\b/g, "do not")
        .replace(/\bdoesn't\b/g, "does not")
        .replace(/\bdidn't\b/g, "did not");

    return t;
}