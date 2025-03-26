
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import ProgressIndicator from '../components/ProgressIndicator';
import FileUpload from '../components/FileUpload';
import HeaderMapping from '../components/HeaderMapping';
import DataPreview from '../components/DataPreview';
import ExportData from '../components/ExportData';
import { 
  extractFileData, 
  suggestMappings, 
  generatePreviewData, 
  processFileData, 
  exportToExcel, 
  saveCandidatesToSupabase,
  FileMapping, 
  MappedRow 
} from '../utils/excelUtils';
import { useSession } from '../utils/authUtils';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const { user, isAdmin, isLoading: authLoading } = useSession();
  const [files, setFiles] = useState<File[]>([]);
  const [mappings, setMappings] = useState<Record<string, FileMapping>>({});
  const [standardFields, setStandardFields] = useState<string[]>([
    'candidateId', 'firstName', 'lastName', 'email', 'phone', 'skills', 'experience', 'education'
  ]);
  const [previewData, setPreviewData] = useState<MappedRow[]>([]);
  const [unifiedData, setUnifiedData] = useState<MappedRow[]>([]);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [savedCandidates, setSavedCandidates] = useState<any[]>([]);
  const [loadingSavedData, setLoadingSavedData] = useState(false);

  // Steps for the progress indicator
  const steps = [
    'Upload Files',
    'Map Headers',
    'Preview Data',
    'Process & Export'
  ];

  // Load saved candidates
  useEffect(() => {
    const fetchSavedCandidates = async () => {
      if (user) {
        setLoadingSavedData(true);
        try {
          const { data, error } = await supabase
            .from('job_candidates')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (error) throw error;
          setSavedCandidates(data || []);
        } catch (error: any) {
          console.error('Error loading candidates:', error);
          toast.error('Error loading saved candidates');
        } finally {
          setLoadingSavedData(false);
        }
      }
    };

    if (!authLoading && user) {
      fetchSavedCandidates();
    }
  }, [user, authLoading]);

  // Process files to extract headers and sample data
  const processFiles = async () => {
    if (!isAdmin) {
      toast.error('Only administrators can upload and process files');
      return;
    }

    if (files.length === 0) {
      toast.error('Please upload at least one Excel file');
      return;
    }

    setIsLoading(true);
    const newMappings: Record<string, FileMapping> = { ...mappings };
    let processedCount = 0;
    
    try {
      for (const file of files) {
        if (!Object.keys(newMappings).includes(file.name)) {
          const fileData = await extractFileData(file);
          if (fileData) {
            newMappings[file.name] = fileData;
            processedCount++;
          }
        }
      }
      
      setMappings(newMappings);
      
      if (processedCount > 0) {
        setStep(2);
        toast.success(`Processed ${processedCount} new file(s)`);
      } else {
        toast.info('No new files to process');
      }
    } catch (error) {
      console.error('Error processing files:', error);
      toast.error('Error processing files. Please check the console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  // Update mapping for a specific file header
  const updateMapping = (fileName: string, originalHeader: string, standardField: string | null) => {
    if (!isAdmin) {
      toast.error('Only administrators can modify mappings');
      return;
    }

    setMappings(prevMappings => {
      const updatedMappings = { ...prevMappings };
      if (!updatedMappings[fileName]) return prevMappings;
      
      updatedMappings[fileName] = {
        ...updatedMappings[fileName],
        mapping: {
          ...updatedMappings[fileName].mapping,
          [originalHeader]: standardField
        }
      };
      
      return updatedMappings;
    });
  };

  // Auto-suggest mappings based on header names
  const handleSuggestMappings = () => {
    if (!isAdmin) {
      toast.error('Only administrators can modify mappings');
      return;
    }

    setIsLoading(true);
    const updatedMappings = { ...mappings };
    
    Object.keys(updatedMappings).forEach(fileName => {
      const updatedMapping = suggestMappings(
        fileName, 
        updatedMappings[fileName], 
        standardFields
      );
      
      updatedMappings[fileName] = {
        ...updatedMappings[fileName],
        mapping: updatedMapping
      };
    });
    
    setMappings(updatedMappings);
    setIsLoading(false);
    toast.success('Mappings auto-suggested based on header names');
  };

  // Generate preview data
  const handleGeneratePreview = () => {
    if (!isAdmin) {
      toast.error('Only administrators can preview data');
      return;
    }

    const preview = generatePreviewData(mappings, standardFields);
    setPreviewData(preview);
    setStep(3);
  };

  // Process all data
  const handleProcessAllData = async () => {
    if (!isAdmin) {
      toast.error('Only administrators can process data');
      return;
    }

    setIsLoading(true);
    const allData: MappedRow[] = [];
    
    try {
      for (const file of files) {
        const fileMapping = mappings[file.name];
        if (!fileMapping) continue;
        
        const processedData = await processFileData(file, fileMapping, standardFields);
        allData.push(...processedData);
      }
      
      setUnifiedData(allData);
      setStep(4);
      toast.success(`Successfully processed ${allData.length} records`);
    } catch (error) {
      console.error('Error processing data:', error);
      toast.error('Error processing data. Please check the console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  // Save to database and export data to Excel
  const handleSaveAndExport = async () => {
    if (!isAdmin) {
      toast.error('Only administrators can save data');
      return;
    }

    if (unifiedData.length === 0) {
      toast.error('No data to save or export');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Save to Supabase
      const result = await saveCandidatesToSupabase(unifiedData);
      
      if (result.success > 0) {
        toast.success(`Saved ${result.success} candidates to database`);
        
        // Refresh the saved candidates list
        const { data } = await supabase
          .from('job_candidates')
          .select('*')
          .order('created_at', { ascending: false });
        
        setSavedCandidates(data || []);
      }
      
      if (result.error > 0) {
        toast.warning(`Failed to save ${result.error} candidates`);
      }
      
      // Export to Excel
      exportToExcel(unifiedData);
      toast.success('Data exported to Excel');
    } catch (error) {
      console.error('Error saving/exporting data:', error);
      toast.error('Error saving or exporting data. Please check the console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  // Close welcome message after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {showWelcome && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-8 mx-4 max-w-lg text-center shadow-2xl animate-scale-in">
            <h1 className="text-3xl font-bold text-gray-800 mb-3">Candidate Data Harmony</h1>
            <p className="text-gray-600 mb-6">Unify and standardize your candidate data with elegance and precision</p>
            <button 
              onClick={() => setShowWelcome(false)}
              className="px-6 py-3 bg-harmony-500 text-white rounded-lg font-medium hover:bg-harmony-600 transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <header className="text-center py-8 mb-8">
          <div className="inline-block px-3 py-1 rounded-full bg-harmony-100 text-harmony-600 font-medium text-sm mb-4">
            Excel Data Unification
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3">Candidate Data Harmony</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Transform inconsistent Excel data into a unified format. Import, map, and standardize your job candidate data with ease.
          </p>
        </header>

        {authLoading ? (
          <div className="flex justify-center my-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-harmony-500"></div>
          </div>
        ) : !user ? (
          <div className="bg-white backdrop-blur-sm shadow-glass rounded-2xl border border-gray-100 p-8 mb-8 text-center">
            <svg 
              className="mx-auto h-16 w-16 text-harmony-400 mb-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="1.5" 
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-6">Please sign in to access candidate data and management tools.</p>
            <a 
              href="/auth" 
              className="px-6 py-3 bg-harmony-500 text-white rounded-lg font-medium hover:bg-harmony-600 transition-colors inline-block"
            >
              Sign In
            </a>
          </div>
        ) : (
          <>
            {/* Admin workflow: Process and import files */}
            {isAdmin && (
              <div className="bg-white backdrop-blur-sm shadow-glass rounded-2xl border border-gray-100 p-6 mb-8">
                <ProgressIndicator 
                  currentStep={step} 
                  totalSteps={steps.length} 
                  steps={steps} 
                />
                
                {/* Step 1: File Upload */}
                {step === 1 && (
                  <FileUpload 
                    files={files}
                    setFiles={setFiles}
                    onProcessFiles={processFiles}
                  />
                )}
                
                {/* Step 2: Header Mapping */}
                {step === 2 && (
                  <div className="animate-slide-up">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold text-gray-800">Map File Headers to Standard Fields</h2>
                      <button 
                        onClick={handleSuggestMappings}
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                        disabled={isLoading}
                      >
                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Auto-suggest Mappings
                      </button>
                    </div>
                    
                    <div className="bg-harmony-50 border border-harmony-100 rounded-xl p-4 mb-6">
                      <h3 className="font-medium text-gray-700 mb-2">Standard Fields</h3>
                      <div className="flex flex-wrap gap-2">
                        {standardFields.map((field, index) => (
                          <span key={index} className="bg-white text-harmony-700 px-3 py-1 rounded-full text-sm shadow-sm">
                            {field}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {Object.keys(mappings).map((fileName, fileIndex) => (
                      <HeaderMapping
                        key={fileIndex}
                        fileName={fileName}
                        fileMapping={mappings[fileName]}
                        standardFields={standardFields}
                        updateMapping={updateMapping}
                      />
                    ))}
                    
                    <div className="flex justify-between mt-8">
                      <button 
                        onClick={() => setStep(1)}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Upload
                      </button>
                      <button 
                        onClick={handleGeneratePreview}
                        className="flex items-center px-4 py-2 bg-harmony-500 text-white rounded-lg hover:bg-harmony-600 transition-colors"
                        disabled={isLoading}
                      >
                        Preview Unified Data
                        <svg className="h-5 w-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Step 3: Data Preview */}
                {step === 3 && (
                  <div className="animate-slide-up">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6">Preview Unified Data</h2>
                    
                    <DataPreview 
                      data={previewData}
                      standardFields={standardFields}
                    />
                    
                    <div className="flex justify-between mt-8">
                      <button 
                        onClick={() => setStep(2)}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Mapping
                      </button>
                      <button 
                        onClick={handleProcessAllData}
                        className="flex items-center px-4 py-2 bg-harmony-500 text-white rounded-lg hover:bg-harmony-600 transition-colors"
                        disabled={isLoading}
                      >
                        Process All Data
                        <svg className="h-5 w-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Step 4: Final Processing */}
                {step === 4 && (
                  <ExportData 
                    data={unifiedData}
                    standardFields={standardFields}
                    sources={Object.keys(mappings).length}
                    setStandardFields={setStandardFields}
                    onExport={handleSaveAndExport}
                    saveButtonText="Save to Database & Export"
                  />
                )}
              </div>
            )}
            
            {/* Saved Candidates (for both admin and regular users) */}
            <div className="bg-white backdrop-blur-sm shadow-glass rounded-2xl border border-gray-100 p-6 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Saved Candidates</h2>
                {isAdmin && (
                  <span className="text-sm text-gray-500">
                    {savedCandidates.length} candidate records
                  </span>
                )}
              </div>
              
              {loadingSavedData ? (
                <div className="flex justify-center my-8">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-harmony-500"></div>
                </div>
              ) : savedCandidates.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <svg className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <p>No candidate data available yet</p>
                  {isAdmin && (
                    <p className="mt-2 text-sm">
                      Upload Excel files and process them to add candidates
                    </p>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-left">
                        <th className="px-4 py-3 text-sm font-medium text-gray-600">Name</th>
                        <th className="px-4 py-3 text-sm font-medium text-gray-600">Contact</th>
                        <th className="px-4 py-3 text-sm font-medium text-gray-600">Skills</th>
                        <th className="px-4 py-3 text-sm font-medium text-gray-600">Experience</th>
                        <th className="px-4 py-3 text-sm font-medium text-gray-600">Source</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {savedCandidates.map((candidate) => (
                        <tr key={candidate.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <div>
                              <p className="font-medium text-gray-800">
                                {candidate.first_name} {candidate.last_name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {candidate.education || 'No education data'}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div>
                              <p className="text-gray-700">{candidate.email || 'No email'}</p>
                              <p className="text-sm text-gray-500">{candidate.phone || 'No phone'}</p>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            {candidate.skills && candidate.skills.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {candidate.skills.map((skill: string, i: number) => (
                                  <span key={i} className="inline-flex text-xs bg-harmony-100 text-harmony-700 px-2 py-1 rounded-full">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400">No skills data</span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-gray-700">
                            {candidate.experience || 'Not specified'}
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm text-gray-500">
                              {candidate.source_file ? (
                                <span className="flex items-center">
                                  <svg className="h-4 w-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  {candidate.source_file}
                                </span>
                              ) : (
                                'Manual entry'
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
        
        <footer className="text-center text-gray-500 text-sm py-6">
          <p>Designed for simplicity and elegance. Process your candidate data with confidence.</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
