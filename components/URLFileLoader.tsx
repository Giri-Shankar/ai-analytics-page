import React, { useEffect, useState, useCallback } from 'react';
import { Loader2, AlertCircle, FileText } from 'lucide-react';

interface URLFileLoaderProps {
  onDataLoaded: (data: ParsedFileData[]) => void;
  onError: (error: string) => void;
}

interface ParsedFileData {
  fileName: string;
  content: string;
}

const URLFileLoader: React.FC<URLFileLoaderProps> = ({ onDataLoaded, onError }) => {
  const [status, setStatus] = useState<'loading' | 'error' | 'no-params'>('loading');
  const [loadingFiles, setLoadingFiles] = useState<string[]>([]);
  const [loadedCount, setLoadedCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const parseURLParams = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    
    // Get files parameter - can be comma-separated or multiple params
    const filesParam = params.get('files');
    const namesParam = params.get('names');
    const autostart = params.get('autostart') === 'true';

    if (!filesParam) {
      return { files: [], names: [], autostart: false };
    }

    // Split by comma if multiple files
    const files = filesParam.split(',').map(f => decodeURIComponent(f.trim()));
    const names = namesParam 
      ? namesParam.split(',').map(n => decodeURIComponent(n.trim()))
      : files.map((_, i) => `file_${i + 1}`);

    return { files, names, autostart };
  }, []);

  const fetchFile = async (url: string): Promise<string> => {
    // Add .csv extension if not present (for Cloudinary raw uploads)
    const fetchUrl = url.endsWith('.csv') ? url : `${url}.csv`;
    
    const response = await fetch(fetchUrl, {
      method: 'GET',
      headers: { 'Accept': 'text/csv,text/plain,*/*' }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
    }

    return await response.text();
  };

  const loadFiles = useCallback(async () => {
    const { files, names, autostart } = parseURLParams();

    if (files.length === 0) {
      setStatus('no-params');
      return;
    }

    setLoadingFiles(names);
    setStatus('loading');

    try {
      const results: ParsedFileData[] = [];

      for (let i = 0; i < files.length; i++) {
        const content = await fetchFile(files[i]);
        results.push({
          fileName: names[i] || `file_${i + 1}`,
          content
        });
        setLoadedCount(i + 1);
      }

      // Pass loaded data to parent
      onDataLoaded(results);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load files';
      setErrorMessage(msg);
      setStatus('error');
      onError(msg);
    }
  }, [parseURLParams, onDataLoaded, onError]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  if (status === 'no-params') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-lg text-center">
          <AlertCircle className="mx-auto text-amber-500 mb-4" size={48} />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Files Specified</h2>
          <p className="text-gray-600 mb-6">
            Please provide file URLs in the query parameters.
          </p>
          <div className="bg-gray-100 rounded-lg p-4 text-left">
            <p className="text-sm font-semibold text-gray-700 mb-2">Expected URL format:</p>
            <code className="text-xs text-blue-600 break-all">
              ?files=URL1,URL2&names=name1,name2&autostart=true
            </code>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-lg text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error Loading Files</h2>
          <p className="text-red-600 bg-red-50 p-4 rounded-lg mb-6">{errorMessage}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-lg text-center">
        <Loader2 className="mx-auto animate-spin text-blue-500 mb-4" size={48} />
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Loading Sensor Data</h2>
        <p className="text-gray-600 mb-6">
          Fetching {loadingFiles.length} file{loadingFiles.length > 1 ? 's' : ''} from cloud storage...
        </p>
        
        {/* Progress */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(loadedCount / loadingFiles.length) * 100}%` }}
          />
        </div>
        
        {/* File list */}
        <div className="space-y-2">
          {loadingFiles.map((name, i) => (
            <div 
              key={name} 
              className={`flex items-center gap-2 p-2 rounded-lg ${
                i < loadedCount ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'
              }`}
            >
              <FileText size={16} />
              <span className="text-sm">{name}</span>
              {i < loadedCount && <span className="ml-auto text-green-500">✓</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default URLFileLoader;
