import { Nav } from './component/Nav'
import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
// import { ArrowRightIcon, UploadIcon, DownloadIcon } from '@heroicons/react/solid';
// import { ArrowUpOnSquareIcon} from '@heroicons/react/24/solid'

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
    console.log(acceptedFiles[0]);
    setFile(acceptedFiles[0]);
    const acceptedFile = acceptedFiles[0];
    const fileUrl = URL.createObjectURL(acceptedFile);
    setPreviewUrl(fileUrl);
  }, [])

  const formatMimeTypes: { [key in FormatType]: string } = {
    pdf: 'application/pdf',
    word: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword',
    ppt: 'application/vnd.ms-powerpoint',
    html: 'text/html',
    xls: 'application/vnd.ms-excel',
    png: 'image/png',
    jpg: 'image/jpeg',
  };

  const acceptedFormat = formatMimeTypes[formatFrom].split(',');

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFormat.reduce((acc, format) => {
      acc[format] = [];
      return acc;
    }, {} as { [key: string]: [] }),
  })

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
      formData.append("file", file);
      formData.append("formatFrom", formatFrom);
      formData.append("formatTo", formatTo);
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
        const blob = await response.blob();
        console.log(blob);
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = downloadUrl.split("/").pop() || "downloaded-file";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
        setDownloadUrl('');
      }
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  }

  const handleFormatChangeFrom = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newFormatFrom = event.target.value as FormatType;
    setFormatFrom(newFormatFrom);

    if (formatTo === newFormatFrom) {
      const newFormatTo = newFormatFrom === 'pdf' ? 'word' : 'pdf';
      setFormatTo(newFormatTo);
    };
  }

  useEffect(() => {
    if (formatFrom === formatTo) {
      setFormatSelectionDuplicateError('Please select different formats for conversion');
    } else {
      setFormatSelectionDuplicateError('');
    }
  }, [formatTo, formatFrom])

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
    <div className="min-h-screen bg-white text-gray-800">
      <Nav />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center text-orange-600 mb-8">File Converter</h1>
        <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <select
                onChange={handleFormatChangeFrom}
                value={formatFrom}
                className="bg-white border border-orange-300 text-gray-700 py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="pdf">PDF</option>
                <option value="word">WORD</option>
                <option value="ppt">PPT, PPTX</option>
                <option value="html">HTML</option>
                <option value="xls">XLS, XLSX</option>
                <option value="png">PNG</option>
                <option value="jpg">JPG</option>
              </select>
              {/* <ArrowRightIcon className="w-6 h-6 text-orange-500" /> */}
              <select
                onChange={handleFormatChangeTo}
                value={formatTo}
                className="bg-white border border-orange-300 text-gray-700 py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {formatOptions[formatFrom]?.map((format) => (
                  <option key={format}>{format.toUpperCase()}</option>
                ))}
              </select>
            </div>
            {formatSelectionDuplicateError && (
              <p className="text-red-500 text-sm text-center mb-4">{formatSelectionDuplicateError}</p>
            )}
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <div
                {...getRootProps()}
                className="border-2 border-dashed border-orange-300 rounded-lg p-8 text-center cursor-pointer transition-colors duration-300 ease-in-out hover:bg-orange-50"
              >
                <input {...getInputProps()} />
                {previewUrl ? (
                  <div className="w-full h-64 flex items-center justify-center">
                    {formatFrom === "pdf" ? (
                      <Worker workerUrl="https://unpkg.com/pdfjs-dist@2.16.105/build/pdf.worker.min.js">
                        <div style={{ width: '100%', height: '100%', overflow: 'auto' }}>
                          <Viewer fileUrl={previewUrl} />
                        </div>
                      </Worker>
                    ) : formatFrom === "jpg" || formatFrom === "png" ? (
                      <img src={previewUrl} alt="Uploaded preview" className="max-w-full max-h-full object-contain" />
                    ) : (
                      <div className="text-center">
                        <p className="text-xl mb-2 text-orange-600">File uploaded successfully!</p>
                        <p className="text-sm text-gray-600">Preview not available for this file type.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-500">
                    {/* <UploadIcon className="w-12 h-12 mx-auto mb-4 text-orange-500" /> */}
                    <p className="text-lg mb-2">
                      {isDragActive ? "Drop the file here" : "Drag 'n' drop a file here, or click to select"}
                    </p>
                    <p className="text-sm">Supported formats: PDF, WORD, PPT, HTML, XLS, PNG, JPG</p>
                  </div>
                )}
              </div>
              {file && (
                <div className="mt-4 text-sm text-gray-600">
                  <p>Selected File: <span className="font-semibold">{file.name}</span></p>
                  <p>File Type: <span className="font-semibold">{file.type || 'Unknown'}</span></p>
                  <p>File Size: <span className="font-semibold">{(file.size / 1024 / 1024).toFixed(2)} MB</span></p>
                </div>
              )}
              <div className="mt-6 flex justify-center">
                <button
                  type="submit"
                  disabled={loading || !file}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-full transition duration-300 ease-in-out flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      {/* <UploadIcon className="w-5 h-5 mr-2" /> */}
                      Convert File
                    </>
                  )}
                </button>
              </div>
            </form>
            {downlaodUrl && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => handleDownload(downlaodUrl)}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-full transition duration-300 ease-in-out flex items-center"
                >
                  {/* <DownloadIcon className="w-5 h-5 mr-2" /> */}
                  Download Converted File
                </button>
              </div>
            )}
            {message && (
              <p className="mt-4 text-sm text-center text-gray-600">{message}</p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App