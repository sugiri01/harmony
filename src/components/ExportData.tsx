
import React, { useState } from 'react';
import { toast } from 'sonner';
import { MappedRow } from '../utils/excelUtils';

interface ExportDataProps {
  data: MappedRow[];
  standardFields: string[];
  sources: number;
  setStandardFields: React.Dispatch<React.SetStateAction<string[]>>;
  onExport: () => void;
  saveButtonText?: string;
}

const ExportData: React.FC<ExportDataProps> = ({ 
  data, 
  standardFields, 
  sources, 
  setStandardFields, 
  onExport,
  saveButtonText = "Export to Excel"
}) => {
  const [newField, setNewField] = useState('');
  const [hoveredField, setHoveredField] = useState<string | null>(null);
  
  const handleAddField = () => {
    const fieldName = newField.trim();
    if (!fieldName) {
      toast.error("Field name cannot be empty");
      return;
    }
    
    if (standardFields.includes(fieldName)) {
      toast.error("Field already exists");
      return;
    }
    
    setStandardFields([...standardFields, fieldName]);
    setNewField('');
    toast.success(`Added new field "${fieldName}"`);
  };
  
  const handleRemoveField = (field: string) => {
    setStandardFields(standardFields.filter(f => f !== field));
    toast.success(`Removed field "${field}"`);
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddField();
    }
  };

  // Calculate data stats
  const filledCellsCount = data.reduce((acc, row) => {
    standardFields.forEach(field => {
      if (row[field] !== null && row[field] !== undefined) acc++;
    });
    return acc;
  }, 0);
  
  const totalCellsCount = data.length * standardFields.length;
  const completionRate = totalCellsCount ? Math.round((filledCellsCount / totalCellsCount) * 100) : 0;

  return (
    <div className="animate-slide-up">
      <div className="bg-gradient-to-br from-harmony-50 to-white p-6 rounded-xl shadow-glass-sm border border-harmony-100 mb-8">
        <div className="flex items-center mb-4">
          <div className="h-10 w-10 rounded-full flex items-center justify-center bg-harmony-100 text-harmony-600">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-800 ml-3 text-lg">Processing Complete</h3>
        </div>
        
        <p className="text-gray-600 mb-6">
          Your candidate data has been successfully unified. You can now save it to the database and export it to Excel.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-glass-sm border border-gray-100">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Total Records</div>
            <div className="text-3xl font-semibold text-gray-800">{data.length}</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-glass-sm border border-gray-100">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Source Files</div>
            <div className="text-3xl font-semibold text-gray-800">{sources}</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-glass-sm border border-gray-100">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Fields Mapped</div>
            <div className="text-3xl font-semibold text-gray-800">{standardFields.length}</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-glass-sm border border-gray-100">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Data Completion</div>
            <div className="flex items-end">
              <div className="text-3xl font-semibold text-gray-800">{completionRate}%</div>
              <div className="text-xs text-gray-500 ml-1 mb-1">of cells filled</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-glass-sm border border-gray-200 p-6 mb-8">
        <h3 className="font-semibold text-gray-800 mb-4">Customize Standard Fields</h3>
        <p className="text-gray-600 mb-4">
          Add or remove standard fields to match your data requirements. These changes will be reflected in your saved data.
        </p>
        
        <div className="flex flex-wrap gap-2 mb-6">
          {standardFields.map((field, index) => (
            <div 
              key={index} 
              className={`
                px-3 py-1.5 rounded-full text-sm flex items-center transition-all duration-200
                ${hoveredField === field 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-harmony-100 text-harmony-700'}
              `}
              onMouseEnter={() => setHoveredField(field)}
              onMouseLeave={() => setHoveredField(null)}
            >
              {field}
              <button 
                onClick={() => handleRemoveField(field)}
                className={`
                  ml-2 rounded-full h-4 w-4 flex items-center justify-center transition-colors
                  ${hoveredField === field 
                    ? 'bg-red-200 text-red-700 hover:bg-red-300' 
                    : 'text-harmony-500 hover:text-harmony-700'}
                `}
              >
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
        
        <div className="flex w-full">
          <input 
            type="text" 
            placeholder="Add new field..." 
            className="flex-grow border border-gray-200 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-harmony-500 focus:border-transparent"
            value={newField}
            onChange={(e) => setNewField(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button 
            onClick={handleAddField}
            className="bg-harmony-500 text-white px-4 py-2 rounded-r-lg hover:bg-harmony-600 transition-colors"
            disabled={!newField.trim()}
          >
            Add Field
          </button>
        </div>
      </div>
      
      <button 
        onClick={onExport}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-xl font-medium transition-colors shadow-sm hover:shadow flex items-center justify-center"
      >
        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        {saveButtonText}
      </button>
    </div>
  );
};

export default ExportData;
