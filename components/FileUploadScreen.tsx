import React from 'react';
import { Upload, FileText, Loader2 } from 'lucide-react';

interface FileUploadScreenProps {
  onFileUpload: (files: File[]) => void;
  onSampleData: () => void;
  isLoading: boolean;
  error: string | null;
}

const FileUploadScreen: React.FC<FileUploadScreenProps> = ({ onFileUpload, onSampleData, isLoading, error }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      onFileUpload(Array.from(files));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">AI-Powered Sensor Dashboard</h1>
        <p className="text-gray-600 mb-8 text-lg">Upload sensor data to instantly visualize trends and generate intelligent insights.</p>
        
        <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 border-2 border-dashed border-gray-300 hover:border-blue-500 hover:shadow-2xl transition-all duration-300">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-48">
              <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
              <span className="text-lg font-semibold text-gray-700">Analyzing data...</span>
            </div>
          ) : (
            <>
              <label htmlFor="file-upload" className="flex flex-col items-center cursor-pointer">
                <Upload className="text-blue-500 mb-4" size={56} />
                <span className="text-xl font-semibold text-gray-700 mb-2">Drag & Drop Files or Click to Upload</span>
                <span className="text-sm text-gray-500 mb-4">.CSV files supported</span>
                <input id="file-upload" type="file" accept=".csv" onChange={handleFileChange} className="hidden" multiple />
              </label>
               <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                 <label htmlFor="file-upload-btn" className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors cursor-pointer text-center">
                    Choose Files
                    <input id="file-upload-btn" type="file" accept=".csv" onChange={handleFileChange} className="hidden" multiple />
                 </label>
                 <button onClick={onSampleData} className="w-full sm:w-auto bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors flex items-center justify-center gap-2">
                    <FileText size={18} />
                    Try Sample Data
                 </button>
               </div>
            </>
          )}
        </div>

        {error && <p className="mt-6 text-red-600 bg-red-100 p-3 rounded-lg font-medium">{error}</p>}

        <div className="mt-10 bg-white/60 backdrop-blur-sm rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">Expected CSV Format</h3>
          <div className="bg-gray-800 text-white p-4 rounded-lg font-mono text-sm overflow-x-auto text-left">
            <div className="text-gray-300">> header: date,time,temperature,humidity,light,airQuality</div>
            <div className="text-green-400">> row 1: 2024-01-01,10:00,22.5,65,450,85</div>
            <div className="text-green-400">> row 2: 2024-01-01,11:00,23.1,63,520,82</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUploadScreen;
