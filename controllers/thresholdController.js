import { computeInitialThresholds, updateThresholds } from "../services/thresholdService.js";

export async function computeThresholds(req, res) {
  try {
    const dataset = req.body;
    const result = await computeInitialThresholds(dataset);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateThresholdsController(req, res) {
  try {
    const sessions = req.body;
    const result = await updateThresholds(sessions);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
