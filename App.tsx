import React, { useState, useCallback } from "react";
import Papa from "papaparse";
import { SensorData, Insight } from "./types";
import { processSensorData } from "./utils/dataProcessor";
import { generateInsightsFromData } from "./services/geminiService";
import URLFileLoader from "./components/URLFileLoader";
import Dashboard from "./components/Dashboard";

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
  const [fileName, setFileName] = useState<string>("");
  const [sourceUrl, setSourceUrl] = useState<string>("");

  // Process data and generate insights
  const handleDataProcessed = useCallback(
    async (processedData: SensorData[], name: string) => {
      if (processedData.length > 0) {
        setData(processedData);
        setFileName(name);
        setError(null);
        setIsLoading(false);

        // Generate AI insights
        setIsInsightsLoading(true);
        try {
          const generatedInsights = await generateInsightsFromData(
            processedData
          );
          setInsights(generatedInsights);
        } catch (e) {
          console.error("Error generating insights:", e);
          setInsights([
            {
              severity: "warning",
              title: "AI Insight Generation Failed",
              description:
                "Could not generate AI-powered insights. Please check your API key and network connection.",
              recommendation:
                "You can still explore the visualized data manually.",
            },
          ]);
        } finally {
          setIsInsightsLoading(false);
        }
      } else {
        setError(
          "No valid data found in the file(s). Please check the file format and content."
        );
        setData([]);
        setIsLoading(false);
      }
    },
    []
  );

  // Parse CSV content using Papa Parse
  const parseCSVContent = useCallback(
    (content: string): Promise<Record<string, any>[]> => {
      return new Promise((resolve, reject) => {
        Papa.parse(content, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            resolve(results.data as Record<string, any>[]);
          },
          error: (err) => {
            reject(new Error(`CSV Parsing Error: ${err.message}`));
          },
        });
      });
    },
    []
  );

  // Handle data loaded from URL
  const handleDataLoaded = useCallback(
    async (files: ParsedFileData[]) => {
      try {
        // Parse all CSV files
        const parsePromises = files.map((file) =>
          parseCSVContent(file.content)
        );
        const results = await Promise.all(parsePromises);

        // Combine and process all data
        const combinedData = results.flat();
        const processedData = processSensorData(combinedData);

        // Create file name string
        const name =
          files.length === 1
            ? files[0].fileName
            : `${files.length} files combined`;

        // Store source URL for reference
        const params = new URLSearchParams(window.location.search);
        const filesParam = params.get("files");
        if (filesParam) {
          setSourceUrl(decodeURIComponent(filesParam.split(",")[0]));
        }

        handleDataProcessed(processedData, name);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to process data";
        setError(msg);
        setIsLoading(false);
      }
    },
    [parseCSVContent, handleDataProcessed]
  );

  // Handle errors from URL loader
  const handleError = useCallback((errorMsg: string) => {
    setError(errorMsg);
    setIsLoading(false);
  }, []);

  // Reset and go back (clears URL params)
  const resetDashboard = useCallback(() => {
    // Option 1: Reload page without params
    window.history.replaceState({}, "", window.location.pathname);
    window.location.reload();

    // Option 2: Or redirect to a specific page
    // window.location.href = 'https://your-main-app.com';
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
      data={data}
      fileName={fileName}
      insights={insights}
      isInsightsLoading={isInsightsLoading}
      onReset={resetDashboard}
      sourceUrl={sourceUrl}
    />
  );
};

export default App;
