import React, { useState, useCallback } from 'react';
import Papa from 'papaparse';
import { SensorData, Insight } from './types';
import { processSensorData } from './utils/dataProcessor';
import { generateInsightsFromData } from './services/geminiService';
import FileUploadScreen from './components/FileUploadScreen';
import Dashboard from './components/Dashboard';
import { SAMPLE_CSV_DATA } from './constants';

const App: React.FC = () => {
  const [data, setData] = useState<SensorData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isInsightsLoading, setIsInsightsLoading] = useState<boolean>(false);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [fileName, setFileName] = useState<string>('');

  const handleDataProcessed = useCallback(async (processedData: SensorData[], name: string) => {
    if (processedData.length > 0) {
      setData(processedData);
      setFileName(name);
      setError(null);
      setIsInsightsLoading(true);
      try {
        const generatedInsights = await generateInsightsFromData(processedData);
        setInsights(generatedInsights);
      } catch (e) {
        console.error("Error generating insights:", e);
        setInsights([{
          severity: 'warning',
          title: 'AI Insight Generation Failed',
          description: 'Could not generate AI-powered insights. Please check your API key and network connection.',
          recommendation: 'You can still explore the visualized data manually.'
        }]);
      } finally {
        setIsInsightsLoading(false);
      }
    } else {
      setError("No valid data found in the file(s). Please check the file format and content.");
      setData([]);
    }
    setIsLoading(false);
  }, []);
  
  const parseAndProcessFiles = useCallback((files: File[]) => {
    setIsLoading(true);
    setError(null);
    setData([]);
    setInsights([]);

    const parsePromises = files.map(file => 
      new Promise<Record<string, any>[]>((resolve, reject) => {
        Papa.parse(file, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            resolve(results.data as Record<string, any>[]);
          },
          error: (err) => {
            reject(new Error(`Error parsing ${file.name}: ${err.message}`));
          }
        });
      })
    );

    Promise.all(parsePromises)
      .then(results => {
        const combinedData = results.flat();
        const processedData = processSensorData(combinedData);
        const name = files.length === 1 ? files[0].name : `${files.length} files combined`;
        handleDataProcessed(processedData, name);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });

  }, [handleDataProcessed]);

  const handleFileUpload = useCallback((files: File[]) => {
    parseAndProcessFiles(files);
  }, [parseAndProcessFiles]);

  const handleSampleData = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setData([]);
    setInsights([]);

    Papa.parse(SAMPLE_CSV_DATA, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        const processedData = processSensorData(results.data as Record<string, any>[]);
        handleDataProcessed(processedData, 'Sample Data');
      },
      error: (err) => {
        setError(`CSV Parsing Error: ${err.message}`);
        setIsLoading(false);
      }
    });
  }, [handleDataProcessed]);

  const resetDashboard = () => {
    setData([]);
    setFileName('');
    setError(null);
    setInsights([]);
  };

  if (data.length === 0) {
    return (
      <FileUploadScreen 
        onFileUpload={handleFileUpload} 
        onSampleData={handleSampleData}
        isLoading={isLoading} 
        error={error} 
      />
    );
  }

  return (
    <Dashboard 
      data={data}
      fileName={fileName}
      insights={insights}
      isInsightsLoading={isInsightsLoading}
      onNewUpload={handleFileUpload}
      onReset={resetDashboard}
    />
  );
};

export default App;
