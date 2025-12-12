import { useState, useEffect } from 'react';

interface SheetRow {
  [key: string]: string;
}

export function useGoogleSheetData() {
  const [data, setData] = useState<SheetRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSheetData();
  }, []);

  const fetchSheetData = async () => {
    try {
      setLoading(true);
      // Google Sheet published as CSV
      const sheetId = '1p-cTZgb6JAmumMsBIA75kP3JzSSqpa3_vQkk3-AhzkY';
      const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('無法讀取 Google Sheet');
      }
      
      const csvText = await response.text();
      const rows = parseCSV(csvText);
      
      if (rows.length > 0) {
        setHeaders(rows[0]);
        const dataRows = rows.slice(1).map(row => {
          const obj: SheetRow = {};
          rows[0].forEach((header, index) => {
            obj[header] = row[index] || '';
          });
          return obj;
        });
        setData(dataRows);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '讀取資料失敗');
    } finally {
      setLoading(false);
    }
  };

  const parseCSV = (csvText: string): string[][] => {
    const lines: string[][] = [];
    let currentLine: string[] = [];
    let currentField = '';
    let inQuotes = false;
    
    for (let i = 0; i < csvText.length; i++) {
      const char = csvText[i];
      const nextChar = csvText[i + 1];
      
      if (inQuotes) {
        if (char === '"' && nextChar === '"') {
          currentField += '"';
          i++; // Skip next quote
        } else if (char === '"') {
          inQuotes = false;
        } else {
          currentField += char;
        }
      } else {
        if (char === '"') {
          inQuotes = true;
        } else if (char === ',') {
          currentLine.push(currentField);
          currentField = '';
        } else if (char === '\n' || (char === '\r' && nextChar === '\n')) {
          currentLine.push(currentField);
          if (currentLine.some(field => field.trim() !== '')) {
            lines.push(currentLine);
          }
          currentLine = [];
          currentField = '';
          if (char === '\r') i++; // Skip \n after \r
        } else if (char !== '\r') {
          currentField += char;
        }
      }
    }
    
    // Handle last field/line
    if (currentField || currentLine.length > 0) {
      currentLine.push(currentField);
      if (currentLine.some(field => field.trim() !== '')) {
        lines.push(currentLine);
      }
    }
    
    return lines;
  };

  return { data, headers, loading, error, refetch: fetchSheetData };
}
