import { createHmac, timingSafeEqual } from "node:crypto";

export function verifyLineSignature(channelSecret, rawBody, signatureHeader) {
  if (!channelSecret) throw new Error("CHANNEL_SECRET is missing");
  if (!rawBody) return false;
  if (!signatureHeader) return false;

  const digest = createHmac("sha256", channelSecret)
    .update(rawBody, "utf8")
    .digest("base64");

  // timing-safe compare
  const a = Buffer.from(digest);
  const b = Buffer.from(signatureHeader);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
