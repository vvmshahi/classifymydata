
import React, { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { DatasetInfo } from '@/pages/Index';

interface FileUploadProps {
  onDatasetUploaded: (dataset: DatasetInfo) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onDatasetUploaded }) => {
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [targetColumn, setTargetColumn] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    setFile(file);
    setError('');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          setError('CSV must have at least a header and one data row');
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/['"]/g, ''));
        const data = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/['"]/g, ''));
          const row: any = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          return row;
        });

        setColumns(headers);
        setCsvData(data);
      } catch (err) {
        setError('Error parsing CSV file');
      }
    };
    reader.readAsText(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (!targetColumn || !file) return;

    const features = columns.filter(col => col !== targetColumn);
    const classes = [...new Set(csvData.map(row => row[targetColumn]).filter(Boolean))];

    const datasetInfo: DatasetInfo = {
      filename: file.name.replace('.csv', ''),
      rowCount: csvData.length,
      columns,
      targetColumn,
      features,
      data: csvData,
      classes: classes.map(String)
    };

    onDatasetUploaded(datasetInfo);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Upload Your Dataset
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Upload a CSV with at least one target column to get started
          </p>
        </CardHeader>
        <CardContent>
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-teal-400 bg-teal-50' 
                : 'border-gray-300 hover:border-teal-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".csv"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                <Upload className="h-6 w-6 text-teal-600" />
              </div>
              
              <div>
                <p className="text-lg font-medium text-gray-900">
                  Drop your CSV file here, or click to browse
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Supports CSV files up to 10MB
                </p>
              </div>
              
              {file && (
                <div className="flex items-center justify-center space-x-2 text-sm text-teal-600 bg-teal-50 rounded px-3 py-2">
                  <FileText className="h-4 w-4" />
                  <span>{file.name}</span>
                </div>
              )}
            </div>
          </div>

          {error && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {columns.length > 0 && (
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Target Column
                </label>
                <Select value={targetColumn} onValueChange={setTargetColumn}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose the column to predict" />
                  </SelectTrigger>
                  <SelectContent>
                    {columns.map(column => (
                      <SelectItem key={column} value={column}>
                        {column}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-center">
                <Button 
                  onClick={handleSubmit}
                  disabled={!targetColumn}
                  className="bg-teal-500 hover:bg-teal-600 px-8"
                >
                  Start Analysis
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="text-center text-sm text-gray-500">
        <p>Sample datasets work great: iris, titanic, or any labeled classification data</p>
      </div>
    </div>
  );
};

export default FileUpload;
