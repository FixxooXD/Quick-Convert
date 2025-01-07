import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { existsSync } from "fs";
import { fileURLToPath } from "url";
import { promisify } from "util";
import { exec as execCallback } from "child_process";

const exec = promisify(execCallback);
const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development" || undefined;

console.log(NODE_ENV);

// CORS Configuration
const corsOptions = {
  origin:
    NODE_ENV === "production"
      ? "https://quick-converter-ver-1.onrender.com/"
      : "http://localhost:8080",
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: false }));

// Directory Setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir =
  process.env.NODE_ENV === "production"
    ? "/tmp/uploads"
    : path.join(__dirname, "uploads");

const convertedDir =
  process.env.NODE_ENV === "production"
    ? "/tmp/converted"
    : path.join(__dirname, "converted");

// Initialize directories
async function initializeDirectories() {
  try {
    await fs.mkdir(uploadsDir, { recursive: true });
    await fs.mkdir(convertedDir, { recursive: true });
  } catch (error) {
    console.error("Error creating directories:", error);
    process.exit(1);
  }
}

await initializeDirectories();

// Serve static files
app.use(express.static(path.join(__dirname, "dist")));

// File Upload Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const sanitizedFilename = file.originalname.replace(/\s+/g, "");
    cb(null, `${Date.now()}-${sanitizedFilename}`);
  },
});

const fileSizeLimit = 10 * 1024 * 1024; // 10MB
const upload = multer({
  storage,
  limits: { fileSize: fileSizeLimit },
});

// File tracking
const fileTracking = new Map();

// File cleanup function
async function cleanOldFiles() {
  const now = Date.now();
  const threshold = 2 * 60 * 1000; // 2 minutes

  for (const [filePath, details] of fileTracking.entries()) {
    if (now - details.timestamp > threshold) {
      try {
        await fs.unlink(filePath);
        console.log(`Deleted file: ${filePath}`);
        fileTracking.delete(filePath);
      } catch (error) {
        console.error(`Error deleting file ${filePath}:`, error);
      }
    }
  }
}

// Supported formats
const supportedFormats = new Set([
  "word",
  "pdf",
  "svg",
  "html",
  "png",
  "jpeg",
  "excel",
]);

// Conversion command generator
function getConversionCommand(formatFrom, formatTo, inputPath, outputDir) {
  const baseCommand = "soffice --headless";

  const formatExtensions = {
    word: "docx",
    pdf: "pdf",
    svg: "svg",
    html: "html",
    png: "png",
    jpeg: "jpg",
    excel: "xlsx",
  };

  if (formatFrom === "pdf" && formatTo === "word") {
    return `${baseCommand} --infilter=writer_pdf_import --convert-to docx --outdir "${outputDir}" "${inputPath}"`;
  }

  const targetFormat = formatExtensions[formatTo] || formatTo;
  return `${baseCommand} --convert-to ${targetFormat} --outdir "${outputDir}" "${inputPath}"`;
}

// File conversion function
async function convertFile(formatFrom, formatTo, inputPath, outputDir) {
  if (!existsSync(inputPath)) {
    throw new Error("Input file not found");
  }

  const command = getConversionCommand(
    formatFrom,
    formatTo,
    inputPath,
    outputDir
  );

  try {
    const { stdout, stderr } = await exec(command);
    if (stderr) {
      console.warn("Conversion warning:", stderr);
    }

    // Clean up input file
    await fs.unlink(inputPath);

    // Extract converted filename
    const match = stdout.match(/-> (.*?) using filter/);
    if (!match || !match[1]) {
      throw new Error("Could not determine converted file name");
    }

    const convertedPath = match[1];
    const convertedFileName = path.basename(convertedPath);

    // Track the converted file
    fileTracking.set(path.join(outputDir, convertedFileName), {
      timestamp: Date.now(),
      type: "converted",
    });

    return convertedFileName;
  } catch (error) {
    throw new Error(`Conversion failed: ${error.message}`);
  }
}

// Routes
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const { formatFrom, formatTo } = req.body;

    if (formatFrom === formatTo) {
      return res.status(400).json({
        error: "Please select different formats for conversion",
      });
    }

    if (!supportedFormats.has(formatFrom) || !supportedFormats.has(formatTo)) {
      return res.status(400).json({ error: "Unsupported format" });
    }

    const convertedFileName = await convertFile(
      formatFrom,
      formatTo,
      req.file.path,
      convertedDir
    );

    res.json({
      message: "Conversion successful",
      downloadUrl: `/download/${convertedFileName}`,
    });
  } catch (error) {
    console.error("Conversion error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/download/:filename", async (req, res) => {
  const filePath = path.join(convertedDir, req.params.filename);

  try {
    await fs.access(filePath);
    res.download(filePath, req.params.filename, async (err) => {
      if (err) {
        console.error("Download error:", err);
        if (!res.headersSent) {
          res.status(500).send("Download failed");
        }
      } else {
        try {
          await fs.unlink(filePath);
          fileTracking.delete(filePath);
        } catch (unlinkError) {
          console.error("Error removing file after download:", unlinkError);
        }
      }
    });
  } catch (error) {
    res.status(404).send("File not found");
  }
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy" });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Start cleanup interval
setInterval(cleanOldFiles, 60 * 1000);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
