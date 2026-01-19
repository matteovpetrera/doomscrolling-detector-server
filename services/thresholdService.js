import fs from "fs";
import path from "path";
import { askLLM } from "./openaiService.js";
import { buildPrompt } from "./promptBuilder.js";

const THRESHOLDS_PATH = path.join(process.cwd(), "models", "thresholds.json");

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
  const parsed = JSON.parse(llmOutput);

  console.log("RISPOSTA DELL'LLM:\n", JSON.stringify(parsed, null, 2));

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
  const parsed = JSON.parse(llmOutput);

  fs.writeFileSync(THRESHOLDS_PATH, JSON.stringify(parsed.updated_thresholds, null, 2));

  console.log("RISPOSTA DELL'LLM:\n", JSON.stringify(parsed, null, 2));

  return parsed;
}
