
import React, { useState } from 'react';
import { FileMapping } from '../utils/excelUtils';

interface HeaderMappingProps {
  fileName: string;
  fileMapping: FileMapping;
  standardFields: string[];
  updateMapping: (fileName: string, originalHeader: string, standardField: string | null) => void;
}

const HeaderMapping: React.FC<HeaderMappingProps> = ({
  fileName,
  fileMapping,
  standardFields,
  updateMapping,
}) => {
  const [selectedHeaders, setSelectedHeaders] = useState<Record<string, boolean>>({});

  const toggleHeader = (header: string) => {
    setSelectedHeaders({
      ...selectedHeaders,
      [header]: !selectedHeaders[header],
    });
  };

  const getPercentageMapped = (): number => {
    const mappedCount = fileMapping.headers.filter(
      header => !!fileMapping.mapping[header]
    ).length;
    return Math.round((mappedCount / fileMapping.headers.length) * 100);
  };

  return (
    <div className="border border-gray-200 rounded-xl shadow-glass-sm bg-white p-5 mb-6 animate-slide-up">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-medium text-gray-800 flex items-center">
            <svg 
              className="h-5 w-5 text-harmony-500 mr-2" 
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
            {fileName}
          </h3>
          <p className="text-sm text-gray-500 ml-7">{fileMapping.headers.length} columns detected</p>
        </div>
        <div className="text-right">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-harmony-50 text-harmony-600">
            <span className="mr-1 text-sm font-medium">{getPercentageMapped()}%</span>
            <span className="text-xs">mapped</span>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="w-full border-collapse bg-white text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left p-3 border-b border-gray-200 font-medium text-gray-600">Original Header</th>
              <th className="text-left p-3 border-b border-gray-200 font-medium text-gray-600">Map To Standard Field</th>
              <th className="text-left p-3 border-b border-gray-200 font-medium text-gray-600">Sample Values</th>
            </tr>
          </thead>
          <tbody>
            {fileMapping.headers.map((header, headerIndex) => (
              <tr 
                key={headerIndex} 
                className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                  selectedHeaders[header] ? 'bg-harmony-50' : ''
                }`}
                onClick={() => toggleHeader(header)}
              >
                <td className="p-3 font-medium text-gray-700">{header}</td>
                <td 
                  className="p-3" 
                  onClick={(e) => e.stopPropagation()}
                >
                  <select 
                    value={fileMapping.mapping[header] || ''}
                    onChange={(e) => updateMapping(
                      fileName, 
                      header, 
                      e.target.value || null
                    )}
                    className="w-full border border-gray-200 rounded-md shadow-sm p-2 text-gray-700 focus:ring-harmony-500 focus:border-harmony-500 focus:outline-none"
                  >
                    <option value="">-- Select Field --</option>
                    {standardFields.map((field, i) => (
                      <option key={i} value={field}>{field}</option>
                    ))}
                  </select>
                </td>
                <td className="p-3 text-sm text-gray-600">
                  <div className="max-h-16 overflow-y-auto custom-scrollbar">
                    {fileMapping.preview.map((row, rowIndex) => (
                      <div 
                        key={rowIndex} 
                        className="mb-1 truncate"
                        title={row[headerIndex]}
                      >
                        {row[headerIndex] !== undefined ? String(row[headerIndex]) : ''}
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HeaderMapping;
