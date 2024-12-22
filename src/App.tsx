// import './App.css'
import { Nav } from './component/Nav'
import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';


function App() {

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [downlaodUrl, setDownloadUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  type FormatType = 'pdf' | 'word' | 'ppt' | 'html' | 'xls' | 'png' | 'jpg';
  const [formatFrom, setFormatFrom] = useState<FormatType>('word');
  const [formatTo, setFormatTo] = useState<FormatType>('pdf');
  const [formatSelectionDuplicateError, setFormatSelectionDuplicateError] = useState<string>('');

  const formatOptions = {
    pdf: ["WORD", "SVG", "HTML", "XLS, XLSX", "PNG", "JPG"],
    word: ["PDF", "HTML", "PNG", "JPG"],
    ppt: ["PDF", "PNG", "JPG"],
    html: ["PDF", "WORD"],
    xls: ["PDF", "WORD"],
    png: ["PDF", "JPG"],
    jpg: ["PDF", "PNG"],
  };


  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Do something with the files  
    console.log(acceptedFiles[0]);
    setFile(acceptedFiles[0]);
    const acceptedFile = acceptedFiles[0];
    // Create a blob URL for the file and set it for preview
    const fileUrl = URL.createObjectURL(acceptedFile);
    setPreviewUrl(fileUrl);
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  const formData = new FormData();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    if (!file) {
      setMessage("Please upload a file before submitting.");
      setLoading(false);
      return;
    }

    try {
      // Appending the file and the selected formats to FormData
      formData.append("file", file);
      formData.append("formatFrom", formatFrom); // Add format from
      formData.append("formatTo", formatTo); // Add format to
      const response = await fetch("http://localhost:3000/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log(result);
        setDownloadUrl(result.downloadUrl);
        setMessage(result.message || "File uploaded successfully!");
      } else {
        setMessage("Failed to upload file.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setMessage("Error uploading file.");
    } finally {
      setLoading(false);
    }
  };


  const handleDownload = async (downloadUrl: string) => {
    try {
      const response = await fetch(`http://localhost:3000${downloadUrl}`, {
        method: "get",
      });

      if (response.ok) {

        if (!response.ok) {
          throw new Error("Failed to fetch the file.");
        }

        // Converted the response to a blob
        const blob = await response.blob();
        console.log(blob);

        // Created a URL for the Blob
        const blobUrl = URL.createObjectURL(blob);

        // Create a temporary link to trigger the download
        const link = document.createElement("a");
        link.href = blobUrl;

        // Set the file name for the download (optional, extracted from server response or preset)
        link.download = downloadUrl.split("/").pop() || "downloaded-file";

        // Append the link to the document, trigger a click, and remove it
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Revoke the Blob URL to free memory
        URL.revokeObjectURL(blobUrl);
        setDownloadUrl('');
      }


    } catch (error) {
      console.error("Error downloading file:", error);
      // setMessage("Error downloading file.");
    } finally {
      // setLoading(false);
    }
  }

  // Handle change for 'From' select
  const handleFormatChangeFrom = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newFormatFrom = event.target.value as FormatType;
    setFormatFrom(newFormatFrom);

    if (formatTo === newFormatFrom) {
      setFormatTo('word');
    };
  }

  useEffect(() => {
    console.log("FormatFrom", formatFrom);
    console.log("FormatTo", formatTo);
    if (formatFrom === formatTo) {
      setFormatSelectionDuplicateError('Please select different formats for conversion');
    } else {
      setFormatSelectionDuplicateError('');
    }
  }, [formatTo, formatFrom])

  // Handle change for 'To' select
  const handleFormatChangeTo = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newFormatTo = event.target.value as FormatType;
    setFormatTo(newFormatTo);
    console.log(formatTo)
    if (formatFrom === newFormatTo) {
      setFormatSelectionDuplicateError('Please select different formats for conversion');
    } else {
      setFormatSelectionDuplicateError('');
    }
  };

  return (
    <>
      <Nav />
      <div className='flex flex-col justify-center items-center h-[90vh] border-2'>
        <div className='font-bold text-2xl' >
          Convert
          <select onChange={handleFormatChangeFrom} value={formatFrom} className='border-2 border-black' name="cars" id="cars">
            <option value="pdf">PDF</option>
            <option value="word">WORD</option>
            <option value="ppt">PPT, PPTX</option>
            <option value="html">HTML</option>
            <option value="xls">XLS, XLSX</option>
            <option value="png">PNG</option>
            <option value="jpg">JPG</option>
          </select>
          to
          <select onChange={handleFormatChangeTo} value={formatTo} className='border-2 border-black' name="cars" id="cars">
            {formatOptions[formatFrom]?.map((format) => (
              <option key={format} >{format.toUpperCase()}</option>
            ))}
          </select>
          {formatSelectionDuplicateError && <p className='text-red-500'>{formatSelectionDuplicateError}</p>}
        </div>
        <form className='border-2 w-[60%] h-[18rem]' onSubmit={handleSubmit} encType="multipart/form-data">
          {/* <input type="file" name="file" required /> */}
          <div className='border-2 w-[100%] h-[80%] flex justify-center items-center p-4 bg-white text-black hover:cursor-pointer' {...getRootProps()}>
            <input accept=".pdf,.docx,.txt,.pptx" // Add more formats as needed
              {...getInputProps()} />
            {
              isDragActive ?
                <p className='text-2xl'>Drop the files here ...</p> :
                <p className='text-2xl'>Drag 'n' drop the files here, or click to select file</p>
            }
            {previewUrl && (
              <Worker workerUrl="https://unpkg.com/pdfjs-dist@2.16.105/build/pdf.worker.min.js">
                <Viewer fileUrl={typeof previewUrl === 'string' ? previewUrl : new Uint8Array(previewUrl)} />
              </Worker>
            )}
          </div>
          {file && (
            <div>
              <p>Selected File: {file.name}</p>
              {/* <p>Size: {(file.size / 1024).toFixed(2)} KB</p> */}
            </div>
          )}
          <button className='border-2 h-[2rem] w-[10rem]' disabled={loading} type="submit">{loading ? "Uploading..." : "Upload"}</button>
        </form>
        {downlaodUrl && <button className='border-2' onClick={() => handleDownload(downlaodUrl)}>Download</button>}
        {message && <p>{message}</p>}
      </div>
    </>
  )
}

export default App
