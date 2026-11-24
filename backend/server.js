const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const pdf = require("pdf-parse");
const mammoth = require("mammoth");
const { analyzeResume } = require("./analysisEngine");

const app = express();
const PORT = Number(process.env.PORT || 5001);
const DATA_DIR = path.join(__dirname, "data");
const UPLOAD_DIR = path.join(__dirname, "uploads");
const DB_FILE = path.join(DATA_DIR, "analyses.json");
fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(UPLOAD_DIR, { recursive: true });
if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, "[]");

app.use(cors({ origin: process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(",") : true }));
app.use(express.json({ limit: "1mb" }));

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => cb(null, Date.now() + "-" + Math.random().toString(36).slice(2) + path.extname(file.originalname).toLowerCase())
});
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if ([".pdf", ".docx", ".txt"].includes(ext)) return cb(null, true);
    cb(new Error("Unsupported file type. Upload a PDF, DOCX, or TXT resume."));
  }
});

function readAnalyses() {
  try { return JSON.parse(fs.readFileSync(DB_FILE, "utf8")); } catch { return []; }
}
function saveAnalyses(items) {
  const temp = DB_FILE + ".tmp";
  fs.writeFileSync(temp, JSON.stringify(items, null, 2));
  fs.renameSync(temp, DB_FILE);
}
async function extractText(file) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === ".pdf") {
    const result = await pdf(fs.readFileSync(file.path));
    return result.text || "";
  }
  if (ext === ".docx") {
    const result = await mammoth.extractRawText({ path: file.path });
    return result.value || "";
  }
  return fs.readFileSync(file.path, "utf8");
}
app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "CBE API", timestamp: new Date().toISOString() }));
app.get("/api/analyses", (_req, res) => res.json(readAnalyses().map(({ resumeSkills, ...item }) => item)));
app.get("/api/analyses/:id", (req, res) => {
  const item = readAnalyses().find(entry => entry.id === req.params.id);
  if (!item) return res.status(404).json({ message: "Analysis not found." });
  res.json(item);
});
app.post("/api/analyze", upload.single("resume"), async (req, res, next) => {
  let uploadedPath;
  try {
    if (!req.file) return res.status(400).json({ message: "Please attach a resume file." });
    uploadedPath = req.file.path;
    const jobDescription = String(req.body.jobDescription || "").trim();
    const resumeText = await extractText(req.file);
    const result = analyzeResume({ resumeText, jobDescription, fileName: req.file.originalname });
    const items = readAnalyses();
    items.unshift(result);
    saveAnalyses(items.slice(0, 100));
    res.status(201).json(result);
  } catch (error) {
    next(error);
  } finally {
    if (uploadedPath) fs.promises.unlink(uploadedPath).catch(() => {});
  }
});
app.use((err, _req, res, _next) => {
  const status = err instanceof multer.MulterError ? (err.code === "LIMIT_FILE_SIZE" ? 413 : 400) : 400;
  res.status(status).json({ message: err.message || "Something went wrong while processing the resume." });
});
if (require.main === module) {
  app.listen(PORT, () => console.log("CBE API listening on http://localhost:" + PORT));
}
module.exports = app;