
import * as XLSX from 'xlsx';
import { supabase } from "@/integrations/supabase/client";

export interface FileMapping {
  headers: string[];
  mapping: Record<string, string | null>;
  preview: any[];
}

export interface MappedRow {
  [key: string]: any;
  _source: string;
  _row: number;
}

/**
 * Extracts headers and preview data from an uploaded Excel file
 */
export const extractFileData = async (file: File): Promise<FileMapping | null> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const firstSheet = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheet];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    if (jsonData.length > 0) {
      const headers = jsonData[0] as string[];
      return {
        headers,
        mapping: {},
        preview: jsonData.slice(1, 5) // Get 4 rows for preview
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Error processing file ${file.name}:`, error);
    return null;
  }
};

/**
 * Auto-suggests mappings for headers based on common patterns
 */
export const suggestMappings = (
  fileName: string, 
  fileMapping: FileMapping,
  standardFields: string[]
): Record<string, string | null> => {
  const updatedMapping: Record<string, string | null> = { ...fileMapping.mapping };
  
  fileMapping.headers.forEach(header => {
    // Skip if mapping already exists
    if (updatedMapping[header]) return;
    
    // Try to find a matching standard field
    const lowerHeader = header.toLowerCase();
    
    // Direct matches
    const directMatch = standardFields.find(field => 
      field.toLowerCase() === lowerHeader ||
      field.toLowerCase().replace(/[^a-z0-9]/gi, '') === lowerHeader.replace(/[^a-z0-9]/gi, '')
    );
    
    if (directMatch) {
      updatedMapping[header] = directMatch;
      return;
    }
    
    // Partial matches for job candidate fields
    if (lowerHeader.includes('id') || lowerHeader.includes('number')) {
      updatedMapping[header] = 'candidateId';
    } else if (lowerHeader.includes('first') || lowerHeader.includes('fname')) {
      updatedMapping[header] = 'firstName';
    } else if (lowerHeader.includes('last') || lowerHeader.includes('lname')) {
      updatedMapping[header] = 'lastName';
    } else if (lowerHeader.includes('email') || lowerHeader.includes('mail')) {
      updatedMapping[header] = 'email';
    } else if (lowerHeader.includes('phone') || lowerHeader.includes('mobile') || lowerHeader.includes('contact')) {
      updatedMapping[header] = 'phone';
    } else if (lowerHeader.includes('skill') || lowerHeader.includes('expertise') || lowerHeader.includes('tech')) {
      updatedMapping[header] = 'skills';
    } else if (lowerHeader.includes('exp') || lowerHeader.includes('years')) {
      updatedMapping[header] = 'experience';
    } else if (lowerHeader.includes('edu') || lowerHeader.includes('degree') || lowerHeader.includes('qualification')) {
      updatedMapping[header] = 'education';
    }
  });
  
  return updatedMapping;
};

/**
 * Generates a preview of the unified data based on current mappings
 */
export const generatePreviewData = (
  mappings: Record<string, FileMapping>,
  standardFields: string[]
): MappedRow[] => {
  const preview: MappedRow[] = [];
  
  Object.keys(mappings).forEach(fileName => {
    const fileMapping = mappings[fileName];
    const headerMapping = fileMapping.mapping;
    
    // Convert first few rows using the mapping
    fileMapping.preview.forEach((row, rowIndex) => {
      const mappedRow: MappedRow = {
        _source: fileName,
        _row: rowIndex + 2 // +2 because we skip header row and indexes start at 0
      };
      
      // Initialize all standard fields to null
      standardFields.forEach(field => {
        mappedRow[field] = null;
      });
      
      // Apply mappings
      fileMapping.headers.forEach((header, colIndex) => {
        const standardField = headerMapping[header];
        if (standardField) {
          mappedRow[standardField] = row[colIndex];
        }
      });
      
      preview.push(mappedRow);
    });
  });
  
  return preview;
};

/**
 * Processes all data from a file using the defined mappings
 */
export const processFileData = async (
  file: File, 
  fileMapping: FileMapping,
  standardFields: string[]
): Promise<MappedRow[]> => {
  const allData: MappedRow[] = [];
  
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const firstSheet = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheet];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    // Skip header row
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      const mappedRow: MappedRow = {
        _source: file.name,
        _row: i + 1 // +1 because we skip header row
      };
      
      // Initialize all standard fields to null
      standardFields.forEach(field => {
        mappedRow[field] = null;
      });
      
      // Apply mappings
      fileMapping.headers.forEach((header, colIndex) => {
        const standardField = fileMapping.mapping[header];
        if (standardField) {
          mappedRow[standardField] = row[colIndex];
        }
      });
      
      allData.push(mappedRow);
    }
  } catch (error) {
    console.error(`Error processing file ${file.name}:`, error);
  }
  
  return allData;
};

/**
 * Saves candidate data to Supabase
 */
export const saveCandidatesToSupabase = async (candidates: MappedRow[]): Promise<{success: number, error: number}> => {
  let successCount = 0;
  let errorCount = 0;
  
  // Get the current authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('No authenticated user found. Cannot save candidates.');
    return { success: 0, error: candidates.length };
  }
  
  for (const candidate of candidates) {
    // Format the candidate data according to our database structure
    const candidateData = {
      first_name: candidate.firstName || null,
      last_name: candidate.lastName || null,
      email: candidate.email || null,
      phone: candidate.phone || null,
      skills: candidate.skills ? [candidate.skills] : [],
      experience: candidate.experience || null,
      education: candidate.education || null,
      source_file: candidate._source || null,
      notes: null,
      created_by: user.id // Add the required created_by field with current user ID
    };
    
    // Insert into Supabase
    const { error } = await supabase
      .from('job_candidates')
      .insert([candidateData]);
    
    if (error) {
      console.error('Error saving candidate:', error);
      errorCount++;
    } else {
      successCount++;
    }
  }
  
  return { success: successCount, error: errorCount };
};

/**
 * Exports data to Excel file
 */
export const exportToExcel = (data: MappedRow[], filename: string = 'unified_candidate_data.xlsx'): void => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Unified Candidate Data");
  XLSX.writeFile(workbook, filename);
};
