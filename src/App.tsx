// import './App.css'
import { Nav } from './component/Nav'
import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

function App() {

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [downlaodUrl, setDownloadUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Do something with the files  
    console.log(acceptedFiles[0]);
    setFile(acceptedFiles[0]);
  }, [])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent the default form submission
    setLoading(true);
    setMessage("");

    if (!file) {
      setMessage("Please upload a file before submitting.");
      setLoading(false);
      return;
    }

    const formData = new FormData();

    try {
      formData.append("file", file);
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

  return (
    <>
      <Nav />
      <div className='flex justify-center items-center h-[90vh]'>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          {/* <input type="file" name="file" required /> */}
          <div className='border-2 p-4 bg-white text-black' {...getRootProps()}>
            <input {...getInputProps()} />
            {
              isDragActive ?
                <p>Drop the files here ...</p> :
                <p>Drag 'n' drop some files here, or click to select files</p>
            }
          </div>
          {file && (
            <div>
              <p>Selected File: {file.name}</p>
              {/* <p>Size: {(file.size / 1024).toFixed(2)} KB</p> */}
            </div>
          )}
          <button className='border-2' disabled={loading} type="submit">{loading ? "Uploading..." : "Upload"}</button>
        </form>
        {downlaodUrl && <button className='border-2' onClick={() => handleDownload(downlaodUrl)}>Download</button>}
        {message && <p>{message}</p>}
      </div>
    </>
  )
}

export default App
