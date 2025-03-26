
import React, { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';

interface FileUploadProps {
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
  onProcessFiles: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ files, setFiles, onProcessFiles }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files).filter(
        file => file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || 
               file.type === "application/vnd.ms-excel"
      );
      
      if (newFiles.length === 0) {
        toast.error("Please upload Excel files only (.xlsx or .xls)");
        return;
      }
      
      setFiles(prevFiles => [...prevFiles, ...newFiles]);
    }
  }, [setFiles]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles(prevFiles => [...prevFiles, ...newFiles]);
    }
  }, [setFiles]);

  const removeFile = useCallback((index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  }, [setFiles]);

  const formatFileSize = (size: number): string => {
    if (size < 1024) return `${size} B`;
    else if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    else return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="animate-slide-up">
      <div 
        className={`
          border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300
          ${isDragging ? 'border-harmony-400 bg-harmony-50' : 'border-gray-200 hover:border-gray-300'}
          glass-panel
        `}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer block">
          <div className="mb-4 relative">
            <div className={`transition-all duration-300 transform ${isDragging ? 'scale-110' : 'scale-100'}`}>
              <svg 
                className="mx-auto h-16 w-16 text-harmony-400 transition-colors duration-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="1.5" 
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
          </div>
          <p className="text-gray-700 font-medium mb-1">Drag & drop Excel files here or click to browse</p>
          <p className="text-sm text-gray-500">Supports .xlsx and .xls files</p>
        </label>
      </div>
      
      {files.length > 0 && (
        <div className="mt-6 animate-fade-in">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-gray-800">Uploaded Files ({files.length})</h3>
            <button 
              onClick={() => setFiles([])}
              className="text-sm text-harmony-600 hover:text-harmony-700 transition-colors"
            >
              Clear All
            </button>
          </div>
          
          <div className="bg-white rounded-xl shadow-glass-sm border border-gray-100 overflow-hidden">
            <ul className="divide-y divide-gray-100">
              {files.map((file, index) => (
                <li 
                  key={index} 
                  className="py-3 px-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <svg 
                        className="h-6 w-6 text-harmony-400" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth="1.5" 
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-700 truncate max-w-xs">
                      {file.name}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500 mr-4">
                      {formatFileSize(file.size)}
                    </span>
                    <button 
                      onClick={() => removeFile(index)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          
          <button 
            onClick={onProcessFiles}
            className="mt-6 w-full bg-harmony-500 text-white py-3 px-4 rounded-xl font-medium
                     hover:bg-harmony-600 active:bg-harmony-700 transition-colors duration-300
                     shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-harmony-500 focus:ring-opacity-50"
          >
            Process Files
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
