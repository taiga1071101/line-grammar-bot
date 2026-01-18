export const questions = [
    {
      id: "q001",
      jp: "あなたの夢が叶うのもそんなに先のことではないでしょう",
      blank: "( ) your dream comes true.",
      answer: "It will not be long before",
      aliases: ["It won't be long before"],
      explain: "It will not be long before + S + V で「…するのもそう遠くない」",
    },
    {
        id: "q002",
        jp: "彼は服が清潔でなければどんな恰好でも気にしない",
        blank: "He dosen't care how he dress ( ) his clothes are clean",
        answer: "as long as",
        aliases: ["as long as"],
        explain: "as long as で「…であれば」",
      },
  ];

  export function pickRandomQuestion(excludeId) {
    const pool = excludeId ? questions.filter(q => q.id !== excludeId) : questions;
  
    // 全部除外されちゃう（問題1件）ケース
    const candidates = pool.length > 0 ? pool : questions;
  
    const idx = Math.floor(Math.random() * candidates.length);
    return candidates[idx];
  }