import { classifyImageBuffer } from "../services/classifyService.js";

const CATEGORIES = [
  "news", "politics", "meme", "cooking", "sports",
  "gaming", "fashion", "beauty", "tutorial", "relationship",
  "animals", "science", "finance", "education", "music",
  "vlog", "humor", "random"
];

export async function classifyTikTok(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Image is required" });
    }

    const result = await classifyImageBuffer(req.file.buffer, CATEGORIES);

    return res.json(result);

  } catch (err) {
    console.error("Classification Error:", err);
    return res.status(500).json({ error: "Classification failed" });
  }
}
