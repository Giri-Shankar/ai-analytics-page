import React, { useState, useCallback } from "react";
import URLFileLoader from "./URLFileLoader";
import Dashboard from "./Dashboard";
import { SensorData, Insight } from "../types";
import { parseCSV } from "../utils/csvParser";
import { generateInsights } from "../utils/insightsGenerator";

interface ParsedFileData {
  fileName: string;
  content: string;
}

const App: React.FC = () => {
  const [data, setData] = useState<SensorData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start as loading
  const [error, setError] = useState<string | null>(null);
  const [isInsightsLoading, setIsInsightsLoading] = useState<boolean>(false);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isInsightsLoading, setIsInsightsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processData = useCallback(async (files: ParsedFileData[]) => {
    try {
      // Combine all file data
      let allData: SensorData[] = [];
      const fileNames: string[] = [];

      for (const file of files) {
        const parsed = parseCSV(file.content);
        allData = [...allData, ...parsed];
        fileNames.push(file.fileName);
      }

      // Sort by timestamp if available
      allData.sort((a, b) => {
        if (a.timestamp && b.timestamp) {
          return (
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
        }
        return 0;
      });

      setSensorData(allData);
      setFileName(fileNames.join(", "));
      setAppState("dashboard");

      // Generate AI insights
      setIsInsightsLoading(true);
      const generatedInsights = await generateInsights(allData);
      setInsights(generatedInsights);
      setIsInsightsLoading(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to process data";
      setError(msg);
      setAppState("error");
    }
  }, []);

  // Handle errors from URL loader
  const handleError = useCallback((errorMsg: string) => {
    setError(errorMsg);
    setIsLoading(false);
  }, []);

  const handleNewUpload = useCallback(
    (files: File[]) => {
      // For new uploads, read files and process
      const readFiles = async () => {
        const results: ParsedFileData[] = [];
        for (const file of files) {
          const content = await file.text();
          results.push({ fileName: file.name, content });
        }
        processData(results);
      };
      readFiles();
    },
    [processData]
  );

  const handleReset = useCallback(() => {
    // Clear URL params and reload
    window.history.replaceState({}, "", window.location.pathname);
    window.location.reload();
  }, []);

  // Show URL file loader when loading
  if (isLoading && data.length === 0) {
    return (
      <URLFileLoader onDataLoaded={handleDataLoaded} onError={handleError} />
    );
  }

  // Show error state
  if (error && data.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-lg text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={resetDashboard}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show dashboard
  return (
    <Dashboard
      data={sensorData}
      fileName={fileName}
      insights={insights}
      isInsightsLoading={isInsightsLoading}
      onReset={resetDashboard}
      sourceUrl={sourceUrl}
    />
  );
};

export default App;
