import express from "express";
import cors from "cors";
import multer from "multer";
import { exec } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: false }));

//Uploading the file which is uploaded by the user
const storage = multer.diskStorage({
  // setting the destination of the uploaded file
  destination: function (req, file, cd) {
    cd(null, "uploads/");
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

  console.log("line 54", uploadedFilePath);

  // Set the path for the converted file (in 'converted' folder)
  const baseOutputDir = process.env.BASE_OUTPUT_DIR || "converted";
  const outputDir = path.resolve(__dirname, baseOutputDir);

  console.log(outputDir);

  // Ensure 'converted' folder exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  if (formatFrom === "word" && formatTo === "pdf") {
    // calling the convertWordToPdf function
    console.log("word to pdf");

    convertWordToPdf(uploadedFilePath, outputDir, res);
  }

  if (formatFrom === "pdf" && formatTo === "word") {
    console.log("pdf to word");
    // calling the convertWordToPdf function
    convertPdfToWord(uploadedFilePath, outputDir, res);
  }

  if (formatFrom === "pdf" && formatTo === "svg") {
    console.log("pdf to svg");
    // calling the convertWordToPdf function
    convertPdfToSvg(uploadedFilePath, outputDir, res);
  }

  if (formatFrom === "pdf" && formatTo === "html") {
    console.log("pdf to html");
    // calling the convertWordToPdf function
    convertPdfToHtml(uploadedFilePath, outputDir, res);
  }

  if (formatFrom === "svg" && formatTo === "png") {
    console.log("svg to png");
    // calling the convertWordToPdf function
    convertSvgToPng(uploadedFilePath, outputDir, res);
  }

  if (formatFrom === "pdf" && formatTo === "jpeg") {
    console.log("pdf to jpeg");
    // calling the convertWordToPdf function
    convertPdfToJpeg(uploadedFilePath, outputDir, res);
  }

  if (formatFrom === "pdf" && formatTo === "png") {
    console.log("pdf to png");
    // calling the convertWordToPdf function
    convertPdfToPng(uploadedFilePath, outputDir, res);
  }

  if (formatFrom === "pdf" && formatTo === "jpeg") {
    convertPdfToExcel(uploadedFilePath, outputDir, res);
  }

  if (formatFrom === "pdf" && formatTo === "png" && formatTo === "jpeg") {
    convertPdfToPngOrJpeg(uploadedFilePath, outputDir, res);
  }
});

const convertPdfToWord = (inputFilePath, outputFilePath, res) => {
  console.log(outputFilePath);

  // Command to convert Word to PDF
  const command = `soffice --headless --infilter=writer_pdf_import --convert-to docx --outdir ${outputFilePath} ${inputFilePath}`;
  //  running the command to convertWordToPdf
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

    //Post Conversion removing the file from the uploads folder
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

const convertPdfToPngOrJpeg = (inputFilePath, outputFilePath, res) => {
  console.log(outputFilePath);

  // Command to convert Word to PDF
  const command = `soffice --headless --convert-to pdf --outdir ${outputFilePath} ${inputFilePath}`;
  //  running the command to convertWordToPdf
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

    //Post Conversion removing the file from the uploads folder
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

const convertPdfToExcel = (inputFilePath, outputFilePath, res) => {
  console.log(outputFilePath);

  // Command to convert Word to PDF
  const command = `soffice --headless --convert-to xlsx --outdir ${outputFilePath} ${inputFilePath}`;
  //  running the command to convertWordToPdf
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

    //Post Conversion removing the file from the uploads folder
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

const convertSvgToPng = (inputFilePath, outputFilePath, res) => {
  console.log(outputFilePath);

  // Command to convert Word to PDF
  const command = `soffice --headless --convert-to png --outdir ${outputFilePath} ${inputFilePath}`;
  //  running the command to convertWordToPdf
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

    //Post Conversion removing the file from the uploads folder
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

const convertPdfToHtml = (inputFilePath, outputFilePath, res) => {
  console.log(outputFilePath);

  // Command to convert Word to PDF
  const command = `soffice --headless --convert-to html --outdir ${outputFilePath} ${inputFilePath}`;
  //  running the command to convertWordToPdf
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

    //Post Conversion removing the file from the uploads folder
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

const convertPdfToSvg = (inputFilePath, outputFilePath, res) => {
  console.log(outputFilePath);

  // Command to convert Word to PDF
  const command = `soffice --headless --convert-to svg --outdir ${outputFilePath} ${inputFilePath}
`;
  //  running the command to convertWordToPdf
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

    //Post Conversion removing the file from the uploads folder
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

const convertPdfToJpeg = (inputFilePath, outputFilePath, res) => {
  console.log(outputFilePath);

  // Command to convert Word to PDF
  const command = `soffice --headless --convert-to jpg --outdir ${outputFilePath} ${inputFilePath}`;
  //  running the command to convertWordToPdf
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

    //Post Conversion removing the file from the uploads folder
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

// Function to convert Word to PDF
const convertWordToPdf = (inputFilePath, outputFilePath, res) => {
  console.log(outputFilePath);

  // Command to convert Word to PDF
  const command = `soffice --headless --convert-to pdf --outdir ${outputFilePath} ${inputFilePath}`;
  //  running the command to convertWordToPdf
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

    //Post Conversion removing the file from the uploads folder
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

const convertPdfToPng = (inputFilePath, outputFilePath, res) => {
  console.log(outputFilePath);

  // Command to convert Word to PDF
  const command = `soffice --headless --convert-to png --outdir ${outputFilePath} ${inputFilePath}`;
  //  running the command to convertWordToPdf
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

    //Post Conversion removing the file from the uploads folder
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
  console.log("server is listening");
});
