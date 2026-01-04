import express from "express";
import cors from "cors";
import multer from "multer";

import { classifyTikTok } from "./controllers/classifyController.js";
import { computeThresholds, updateThresholdsController } from "./controllers/thresholdController.js";

const upload = multer();  // memory storage

const app = express();
app.use(cors());
app.use(express.json({ limit: "20mb" }));

// CLASSIFICAZIONE TIPOLOGIA VIDEO TIKTOK
app.post("/classify", upload.single("file"), (req, res, next) => {
  console.log("BODY:", req.body);
  console.log("FILE:", req.file);
  next();
}, classifyTikTok);

// CALCOLO INIZIALE DELLE SOGLIE
app.post("/thresholds/compute", computeThresholds);

// AGGIORNAMENTO GIORNALIERO
app.post("/thresholds/update", updateThresholdsController);

//CONTROLLO SERVER ONLINE
app.get("/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server listening on port", PORT);
});
