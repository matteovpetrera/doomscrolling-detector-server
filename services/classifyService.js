import OpenAI from "openai";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function classifyImageBuffer(imageBuffer, categories) {
  const base64Image = imageBuffer.toString("base64");

  const prompt = fs.readFileSync("./prompts/classifyPrompt.txt", "utf8")
    .replace("{CATEGORIES}", JSON.stringify(categories));

  const response = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`
            }
          }
        ]
      }
    ]
  });

  return JSON.parse(response.choices[0].message.content);
}
