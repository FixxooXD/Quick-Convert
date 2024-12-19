import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";

// Set the worker file location to your local path
pdfjs.GlobalWorkerOptions.workerSrc = `./pdf.worker.min.js`;
// Use CDN for pdf.worker
// pdfjs.GlobalWorkerOptions.workerSrc = "https://unpkg.com/pdfjs-dist@2.10.377/build/pdf.worker.min.js";
const PdfPreview = ({ file }: { file: string | ArrayBuffer | null }) => {
    return (
        <div className="flex flex-row border-2" >
            <Document file={file}>
                <Page pageNumber={1} />
            </Document>
        </div >
    )
}

export default PdfPreview;