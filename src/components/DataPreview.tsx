
import React, { useState } from 'react';
import { MappedRow } from '../utils/excelUtils';

interface DataPreviewProps {
  data: MappedRow[];
  standardFields: string[];
}

const DataPreview: React.FC<DataPreviewProps> = ({ data, standardFields }) => {
  const [highlightedSource, setHighlightedSource] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'sources'>('preview');
  
  // Get unique sources for filtering
  const uniqueSources = [...new Set(data.map(row => row._source))];
  
  const handleSourceHover = (source: string | null) => {
    setHighlightedSource(source);
  };

  return (
    <div className="animate-slide-up">
      <div className="mb-4 border-b border-gray-200">
        <div className="flex space-x-4">
          <button
            className={`py-2 px-1 border-b-2 text-sm font-medium transition-colors ${
              activeTab === 'preview'
                ? 'border-harmony-500 text-harmony-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('preview')}
          >
            Data Preview
          </button>
          <button
            className={`py-2 px-1 border-b-2 text-sm font-medium transition-colors ${
              activeTab === 'sources'
                ? 'border-harmony-500 text-harmony-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('sources')}
          >
            Source Files
          </button>
        </div>
      </div>

      {activeTab === 'preview' ? (
        <>
          <div className="bg-white rounded-xl shadow-glass-sm border border-gray-200 overflow-x-auto mb-4">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left py-3 px-4 border-b border-gray-200 font-medium text-gray-600 sticky left-0 bg-gray-50 z-10">
                    Source
                  </th>
                  {standardFields.map((field, index) => (
                    <th key={index} className="text-left py-3 px-4 border-b border-gray-200 font-medium text-gray-600">
                      {field}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, rowIndex) => (
                  <tr 
                    key={rowIndex} 
                    className={`
                      border-b border-gray-200 hover:bg-gray-50 transition-colors
                      ${highlightedSource === row._source ? 'bg-harmony-50' : ''}
                    `}
                  >
                    <td 
                      className="py-3 px-4 font-medium text-xs text-gray-500 sticky left-0 bg-white z-10 border-r border-gray-100"
                      onMouseEnter={() => handleSourceHover(row._source)}
                      onMouseLeave={() => handleSourceHover(null)}
                    >
                      <div className="flex items-center">
                        <span className="truncate max-w-[150px]" title={`${row._source} (Row ${row._row})`}>
                          {row._source}
                        </span>
                        <span className="text-gray-400 ml-1">#{row._row}</span>
                      </div>
                    </td>
                    {standardFields.map((field, fieldIndex) => (
                      <td key={fieldIndex} className="py-3 px-4 text-gray-700">
                        {row[field] !== null && row[field] !== undefined 
                          ? String(row[field]) 
                          : <span className="text-gray-300">—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="text-sm text-gray-500 italic">
            Showing {data.length} row(s) from preview data
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {uniqueSources.map((source, index) => {
            const sourceRows = data.filter(row => row._source === source);
            return (
              <div 
                key={index} 
                className={`
                  p-4 rounded-xl shadow-glass-sm border border-gray-200 transition-all
                  ${highlightedSource === source ? 'bg-harmony-50 scale-105' : 'bg-white'}
                `}
                onMouseEnter={() => handleSourceHover(source)}
                onMouseLeave={() => handleSourceHover(null)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-harmony-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="font-medium text-gray-800 truncate max-w-[180px]" title={source}>
                      {source}
                    </h3>
                  </div>
                  <span className="text-xs bg-harmony-100 text-harmony-600 px-2 py-1 rounded-full">
                    {sourceRows.length} rows
                  </span>
                </div>
                <div className="text-sm text-gray-500 ml-7">
                  {Object.entries(sourceRows[0] || {})
                    .filter(([key, value]) => !key.startsWith('_') && value !== null)
                    .map(([key], i) => (
                      <div key={i} className="truncate">{key}</div>
                    ))
                  }
                  {Object.entries(sourceRows[0] || {}).filter(([key, value]) => !key.startsWith('_') && value !== null).length >= 3 && (
                    <div className="text-gray-400">...</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DataPreview;
