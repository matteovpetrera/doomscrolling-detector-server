import fs from "fs";
import path from "path";

export function buildPrompt(promptFileName, variables = {}) {
  const filePath = path.join(process.cwd(), "prompts", promptFileName);
  let template = fs.readFileSync(filePath, "utf8");

  // Sostituisce {{VARIABLE}} con il valore passato
  for (const key in variables) {
    const placeholder = `{{${key}}}`;
    template = template.replace(placeholder, variables[key]);
  }

  return template;
}
