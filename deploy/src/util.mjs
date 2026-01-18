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
  