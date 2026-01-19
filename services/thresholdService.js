import fs from "fs";
import path from "path";
import { askLLM } from "./openaiService.js";
import { buildPrompt } from "./promptBuilder.js";

const THRESHOLDS_PATH = path.join(process.cwd(), "models", "thresholds.json");

function extractFirstJsonObject(text) {
  if (!text) throw new Error("LLM output empty");

  // 1) Se è in ```json ... ```
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) return fenced[1].trim();

  // 2) Estrazione del primo oggetto JSON bilanciando le graffe
  const start = text.indexOf("{");
  if (start === -1) throw new Error("No '{' found in LLM output");

  let depth = 0;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return text.slice(start, i + 1).trim();
    }
  }
  throw new Error("Unbalanced JSON braces in LLM output");
}

function safeJsonParseFromLLM(text) {
  try {
    return JSON.parse(text);
  } catch (e1) {
    const extracted = extractFirstJsonObject(text);
    return JSON.parse(extracted);
  }
}

// ------------------------------------------------------------
// 1) CALCOLO INIZIALE DELLE THRESHOLDS
// ------------------------------------------------------------
export async function computeInitialThresholds(datasetJson) {
  if (!datasetJson || !datasetJson.sessions) {
    throw new Error("❌ computeInitialThresholds: datasetJson.sessions is undefined");
  }

  const prompt = buildPrompt("thresholdDefinerPrompt.txt", {
    DATASET: JSON.stringify(datasetJson.sessions, null, 2),
  });

  console.log("PROMPT INVIATO ALL'LLM:\n");
  console.log(prompt);

  const llmOutput = await askLLM(prompt);
  const parsed = safeJsonParseFromLLM(llmOutput);

  console.log("RISPOSTA DELL'LLM not parsed:\n", llmOutput);
  console.log("RISPOSTA DELL'LLM parsed:\n", parsed);

  fs.writeFileSync(THRESHOLDS_PATH, JSON.stringify(parsed.thresholds, null, 2));

  return parsed;
}

// ------------------------------------------------------------
// 2) AGGIORNAMENTO GIORNALIERO
// ------------------------------------------------------------
export async function updateThresholds(newSessionsJson) {
  if (!newSessionsJson || !newSessionsJson.sessions) {
    throw new Error("❌ updateThresholds: newSessionsJson.sessions is undefined");
  }

  const currentThresholds = JSON.parse(fs.readFileSync(THRESHOLDS_PATH, "utf8"));

  const prompt = buildPrompt("thresholdUpdaterPrompt.txt", {
    CURRENT_THRESHOLDS: JSON.stringify(currentThresholds, null, 2),
    NEW_SESSIONS: JSON.stringify(newSessionsJson.sessions, null, 2),
  });

  console.log("PROMPT UPDATE INVIATO ALL'LLM:\n", prompt);

  const llmOutput = await askLLM(prompt);
  const parsed = safeJsonParseFromLLM(llmOutput);

  fs.writeFileSync(THRESHOLDS_PATH, JSON.stringify(parsed.updated_thresholds, null, 2));

  console.log("RISPOSTA DELL'LLM not parsed:\n", llmOutput);
  console.log("RISPOSTA DELL'LLM parsed:\n", parsed);

  return parsed;
}
