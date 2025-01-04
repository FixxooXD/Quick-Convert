import express from "express";
import cors from "cors";
import multer from "multer";
import { exec } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const app = express();

const PORT = process.env.PORT || 3000;

const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? "https://quick-converter-ver-1.onrender.com"
      : "http://localhost:5173",
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: false }));

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

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(convertedDir)) {
  fs.mkdirSync(convertedDir, { recursive: true });
}

// const isProduction = process.env.NODE_ENV === "production";

// if (isProduction) {
app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});
// }
//Uploading the file which is uploaded by the user
const storage = multer.diskStorage({
  // setting the destination of the uploaded file
  destination: function (req, file, cd) {
    cd(null, uploadsDir);
  },
  //Manupulating the filename like remoaving spaces and adding date stamp
  filename: function (req, file, cd) {
    // Remove spaces globally from the filename
    const sanitizedFilename = file.originalname.split(" ").join("");
    // Prepend timestamp to ensure unique filenames
    cd(null, `${Date.now()}-${sanitizedFilename}`);
  },
});

//using multer to upload the file in the server which is defined by storage
const upload = multer({ storage: storage });

//Upload route
app.post("/upload", upload.single("file"), (req, res) => {
  const { formatFrom, formatTo } = req.body;

  // Check if the formatFrom and formatTo are the same
  if (formatFrom === formatTo) {
    return res
      .status(400)
      .json({ message: "Please select different formats for conversion" });
  }

  // Check if the file path is relative or absolute
  const uploadedFilePath = path.isAbsolute(req.file.path)
    ? req.file.path // If already absolute, use as it is
    : path.resolve(__dirname, req.file.path); // If relative, resolve it

  // Set the path for the converted file (in 'converted' folder)
  const baseOutputDir = process.env.BASE_OUTPUT_DIR || "converted";
  const outputDir = path.resolve(__dirname, baseOutputDir);

  console.log("fileuploaded", uploadedFilePath);

  convertFile(formatFrom, formatTo, uploadedFilePath, outputDir, res);

  // Ensure 'converted' folder exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });

    // Validate formats
    const supportedFormats = [
      "word",
      "pdf",
      "svg",
      "html",
      "png",
      "jpeg",
      "excel",
    ];
    if (
      !supportedFormats.includes(formatFrom) ||
      !supportedFormats.includes(formatTo)
    ) {
      return res.status(400).json({ error: "Unsupported format" });
    }
  }
});

const getConversionCommand = (
  formatFrom,
  formatTo,
  inputFilePath,
  outputFilePath
) => {
  const baseCommand = `soffice --headless`;
  console.log("inside getconversioncommand", formatFrom, formatTo);

  // Special case for PDF to Word conversion
  if (formatFrom === "pdf" && formatTo === "word") {
    return `${baseCommand} --infilter=writer_pdf_import --convert-to docx --outdir ${outputFilePath} ${inputFilePath}`;
  }

  // Map format extensions
  const formatExtensions = {
    word: "docx",
    pdf: "pdf",
    svg: "svg",
    html: "html",
    png: "png",
    jpeg: "jpg",
    excel: "xlsx",
  };

  const targetFormat = formatExtensions[formatTo] || formatTo;
  return `${baseCommand} --convert-to ${targetFormat} --outdir ${outputFilePath} ${inputFilePath}`;
};

const convertFile = (
  formatFrom,
  formatTo,
  inputFilePath,
  outputFilePath,
  res
) => {
  console.log(`Converting from ${formatFrom} to ${formatTo}`);
  console.log(`Output path: ${outputFilePath}`);

  if (!fs.existsSync(inputFilePath)) {
    console.error(`Input file does not exist: ${inputFilePath}`);
    return res.status(400).json({ error: "Input file not found" });
  }
  const command = getConversionCommand(
    formatFrom,
    formatTo,
    inputFilePath,
    outputFilePath
  );

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      res.status(500).send("Conversion failed");
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      res.status(500).send("Conversion failed");
      return;
    }
    console.log(`Conversion successful: ${stdout}`);

    // Post Conversion removing the file from the uploads folder
    fs.unlinkSync(inputFilePath);

    // Extract the converted file name from the stdout
    const match = stdout.match(/-> (.*?) using filter/);
    let convertedFileName = "";
    if (match && match[1]) {
      const convertedFilePath = match[1];
      convertedFileName = path.basename(convertedFilePath); // Get only the file name
      console.log(`Converted file name: ${convertedFileName}`);
    }

    // Respond with success and download URL
    if (!res.headersSent) {
      return res.json({
        message: "Conversion successful",
        downloadUrl: `/download/${convertedFileName}`,
      });
    }
  });
};

// Serve converted files for download
app.get("/download/:filename", (req, res) => {
  console.log("line 54", req.params.filename);
  const filePath = path.resolve(__dirname, "converted", req.params.filename);
  if (!fs.existsSync(filePath)) {
    res.status(404).send("File not found");
    return;
  }
  try {
    res.download(filePath, (err) => {
      if (err) {
        console.error("Error during download:", err);
      } else {
        // Remove the file after it has been successfully downloaded
        fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr) {
            console.error("Error removing file:", unlinkErr);
          } else {
            console.log(`File ${filePath} has been deleted successfully.`);
          }
        });
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("An error occurred while downloading the file.");
  }
});

app.listen(PORT, () => {
  console.log("server is listening", PORT);
});
