import React, { useState, useRef } from 'react';
import { Upload as UploadIcon, File, CheckCircle, AlertCircle, X, FileText } from 'lucide-react';
import Navbar1 from '../components/layout/Navbar1';

const Badge = ({ className, variant, ...props }) => {
    let baseClasses = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
    let variantClasses = '';

    switch (variant) {
        case 'default':
            variantClasses = "border-transparent bg-primary text-primary-foreground hover:bg-primary/80";
            break;
        case 'secondary':
            variantClasses = "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80";
            break;
        case 'destructive':
            variantClasses = "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80";
            break;
        case 'outline':
            variantClasses = "text-foreground";
            break;
        default:
            variantClasses = "border-transparent bg-primary text-primary-foreground hover:bg-primary/80";
    }

    const combinedClasses = baseClasses + ' ' + variantClasses + ' ' + className;

    return (
        <div className={combinedClasses} {...props} />
    );
};

const Upload = () => {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({});
    const [uploadStatus, setUploadStatus] = useState({});
    const fileInputRef = useRef(null);
    const dropZoneRef = useRef(null); // Ref for the drop zone

    const handleFileChange = (e) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            handleNewFiles(newFiles);
        }
    };

    const handleNewFiles = (newFiles) => {
        const newProgress = { ...uploadProgress };
        const newStatus = { ...uploadStatus };

        newFiles.forEach(file => {
            newProgress[file.name] = 0;
            newStatus[file.name] = 'pending';
        });

        setUploadProgress(newProgress);
        setUploadStatus(newStatus);
        setFiles([...files, ...newFiles]);
    };

    const removeFile = (fileName) => {
        setFiles(files.filter(file => file.name !== fileName));

        const newProgress = { ...uploadProgress };
        const newStatus = { ...uploadStatus };
        delete newProgress[fileName];
        delete newStatus[fileName];

        setUploadProgress(newProgress);
        setUploadStatus(newStatus);
    };

    const uploadFiles = () => {
        if (files.length === 0) {
            alert("Please select at least one file to upload.");
            return;
        }

        setUploading(true);

        files.forEach(file => {
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.floor(Math.random() * 10) + 5;

                if (progress >= 100) {
                    progress = 100;
                    clearInterval(interval);

                    setUploadStatus(prev => ({
                        ...prev,
                        [file.name]: Math.random() > 0.1 ? 'success' : 'error'
                    }));
                    setTimeout(() => {
                        setUploadStatus(currentStatus => {
                            const allDone = Object.values(currentStatus).every(
                                status => status === 'success' || status === 'error'
                            );
                            if (allDone && Object.keys(currentStatus).length === files.length) {
                                setUploading(false);
                            }
                            return currentStatus;
                        });
                    }, 500);
                }

                setUploadProgress(prev => ({
                    ...prev,
                    [file.name]: progress > 100 ? 100 : progress
                }));
            }, 300);
        });
    };

    const getFileIcon = (fileName) => {
        const extension = fileName.split('.').pop()?.toLowerCase();

        if (extension === 'pdf') return <FileText className="h-5 w-5 text-red-400" />;
        if (['doc', 'docx'].includes(extension || '')) return <FileText className="h-5 w-5 text-blue-400" />;
        if (['xls', 'xlsx', 'csv'].includes(extension || '')) return <FileText className="h-5 w-5 text-green-400" />;
        return <File className="h-5 w-5 text-gray-400" />;
    };

    const getStatusIcon = (status) => {
        if (status === 'success') return <CheckCircle className="h-5 w-5 text-green-500" />;
        if (status === 'error') return <AlertCircle className="h-5 w-5 text-red-500" />;
        return null;
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        if (e.dataTransfer.files) {
            handleNewFiles(Array.from(e.dataTransfer.files));
        }
    };

    return (

        <div className="page-container py-16">
            <Navbar1 />
            <div className="max-w-4xl mx-auto mt-8">
                <div className="glass-card rounded-lg p-8">
                    <div
                        ref={dropZoneRef}
                        className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-[#0FCE7C] transition-colors cursor-pointer mb-8"
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    >
                        <UploadIcon className="h-12 w-12 text-[#0FCE7C] mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-white mb-2">Drag and drop your files here</h3>
                        <p className="text-gray-400 mb-4">or click to browse</p>
                        <p className="text-sm text-gray-500">Supported formats: PDF, CSV, XLS, XLSX, DOC, DOCX</p>
                        <p className="text-sm text-gray-500 mt-1">Maximum file size: 10MB</p>

                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileChange}
                            multiple
                            accept=".pdf,.csv,.xls,.xlsx,.doc,.docx"
                        />
                    </div>

                    {files.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-lg font-medium text-white mb-4">Selected Files ({files.length})</h3>
                            <div className="space-y-3">
                                {files.map((file, index) => (
                                    <div key={index} className="glass-card p-4 rounded-md">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                {getFileIcon(file.name)}
                                                <div className="ml-3">
                                                    <p className="text-white font-medium">{file.name}</p>
                                                    <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-3">
                                                {getStatusIcon(uploadStatus[file.name] || 'pending')}

                                                {uploadStatus[file.name] === 'success' && (
                                                    <Badge className="bg-green-500/20 text-green-500">Uploaded</Badge>
                                                )}

                                                {uploadStatus[file.name] === 'error' && (
                                                    <Badge className="bg-red-500/20 text-red-500">Failed</Badge>
                                                )}

                                                <button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeFile(file.name)}
                                                    disabled={uploading}
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {(uploadProgress[file.name] > 0 && uploadStatus[file.name] === 'pending') && (
                                            <div className="mt-2 h-1 w-full bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-[#0FCE7C] rounded-full transition-width duration-300 ease-linear"
                                                    style={{ width: `${uploadProgress[file.name]}%` }}
                                                ></div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between items-center">
                        <button
                            variant="outline"
                            className="bg-white text-black hover:scale-105 rounded-lg p-2 hover:bg-[#0FCE7C]"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                        >
                            Add More Files
                        </button>

                        <button
                            className="bg-[#0FCE7C] hover:bg-[#0FCE96] text-black p-2 rounded-lg hover:scale-105"
                            onClick={uploadFiles}
                            disabled={files.length === 0 || uploading}
                        >
                            {uploading ? "Uploading..." : `Uploaded ${files.length} File${files.length !== 1 ? 's' : ''}`}
                        </button>
                    </div>
                </div>

                <div className="glass-card rounded-lg p-6 mt-8">
                    <h3 className="text-2xl text-left font-medium text-white mb-4">Upload Guidelines</h3>
                    <ul className="space-y-2 text-gray-400">
                        <li className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-[#0FCE7C] mr-2 mt-0.5 flex-shrink-0" />
                            <p className='text-white'>Upload financial statements, invoices, receipts, or any other financial documents you want to analyze.</p>
                        </li>
                        <li className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-[#0FCE7C] mr-2 mt-0.5 flex-shrink-0" />
                            <span className='text-white'>All files are encrypted and securely stored. Only you can access your uploaded documents.</span>
                        </li>
                        <li className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-[#0FCE7C] mr-2 mt-0.5 flex-shrink-0" />
                            <span className='text-white'>For optimal results, upload organized financial documents with clear data formatting.</span>
                        </li>
                        <li className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-[#0FCE7C] mr-2 mt-0.5 flex-shrink-0" />
                            <span className='text-white'>After uploading, you can process your files for analysis or generate reports.</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

    );
};

export default Upload;