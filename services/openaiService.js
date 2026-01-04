import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function askLLM(prompt) {
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4.1",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.0
    });

    const content = response.choices[0].message.content;
    return content;
  } catch (err) {
    console.error("❌ OpenAI error:", err);
    throw err;
  }
}
