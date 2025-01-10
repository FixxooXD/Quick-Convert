import { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, Clock, HardDrive, MousePointer, Smartphone, Zap, FileType, UserX } from 'lucide-react';

const UserGuide = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    console.log(openIndex);


    const guides = [
        {
            title: "Best for PDF Conversions",
            icon: <FileText className="w-5 h-5" />,
            content: "Upload your files in formats like Word, Excel, or Images and convert them to PDF effortlessly."
        },
        {
            title: "Temporary File Storage",
            icon: <Clock className="w-5 h-5" />,
            content: "Your files are stored for processing and automatically removed after 2 minutes to ensure privacy."
        },
        {
            title: "File Size Limit",
            icon: <HardDrive className="w-5 h-5" />,
            content: "Files up to 10MB are supported for quick and efficient conversions."
        },
        {
            title: "Simple Drag-and-Drop Interface",
            icon: <MousePointer className="w-5 h-5" />,
            content: "Drag your files to the upload area or click to select them manually."
        },
        {
            title: "Works on All Devices",
            icon: <Smartphone className="w-5 h-5" />,
            content: "Whether you're using a laptop, tablet, or smartphone, our service works seamlessly."
        },
        {
            title: "Conversion Speed",
            icon: <Zap className="w-5 h-5" />,
            content: "Most files are converted within seconds, depending on size and format."
        },
        {
            title: "Support for Popular Formats",
            icon: <FileType className="w-5 h-5" />,
            content: "Convert between popular formats like PDF, Word, Excel, PNG, and more."
        },
        {
            title: "No Signup Required",
            icon: <UserX className="w-5 h-5" />,
            content: "Use the service instantly without creating an account."
        }
    ];

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold text-center text-orange-600 mb-6">What You Need to Know</h2>
            <div className="space-y-2">
                {guides.map((guide, index) => (
                    <div
                        key={index}
                        className="border border-orange-200 rounded-lg overflow-hidden bg-white"
                    >
                        <button
                            onClick={() => setOpenIndex(openIndex === index ? null : index)}
                            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-orange-50 transition-colors duration-200"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="text-orange-500">
                                    {guide.icon}
                                </div>
                                <span className="font-medium text-gray-700">{guide.title}</span>
                            </div>
                            {openIndex === index ?
                                <ChevronUp className="w-5 h-5 text-orange-500" /> :
                                <ChevronDown className="w-5 h-5 text-orange-500" />
                            }
                        </button>
                        {openIndex === index && (
                            <div className="px-4 py-3 bg-orange-50 border-t border-orange-200">
                                <p className="text-gray-600">{guide.content}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UserGuide;