
import React from 'react';
import { Insight } from '../types';
import { Lightbulb, AlertTriangle, CheckCircle, Info, Loader2 } from 'lucide-react';

interface InsightsPanelProps {
  insights: Insight[];
  isLoading: boolean;
}

const InsightCard: React.FC<{ insight: Insight }> = ({ insight }) => {
  const config = {
    critical: { icon: AlertTriangle, color: 'red-500', bg: 'red-50' },
    warning: { icon: AlertTriangle, color: 'yellow-500', bg: 'yellow-50' },
    info: { icon: Info, color: 'blue-500', bg: 'blue-50' },
    success: { icon: CheckCircle, color: 'green-500', bg: 'green-50' }
  };
  const { icon: Icon, color, bg } = config[insight.severity] || config.info;

  return (
    <div className={`bg-white rounded-lg p-4 border-l-4 border-${color}`}>
      <div className="flex items-start gap-4">
        <div className={`p-2 rounded-full bg-${bg}`}>
            <Icon className={`text-${color}`} size={20} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800 text-md">{insight.title}</h3>
          <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
          <p className="text-sm text-gray-800 bg-gray-100 p-3 rounded-md mt-3 italic">
            <span className="font-semibold not-italic">Recommendation:</span> {insight.recommendation}
          </p>
        </div>
      </div>
    </div>
  );
};

const InsightsPanel: React.FC<InsightsPanelProps> = ({ insights, isLoading }) => {
  const safeInsights = Array.isArray(insights) ? insights : [];

  return (
    <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-100 rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <Lightbulb className="text-purple-600" size={28} />
        <h2 className="text-2xl font-bold text-gray-800">AI-Powered Insights</h2>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="animate-spin text-purple-600 mr-3" size={32} />
          <span className="text-lg text-gray-700">Generating intelligent insights...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {safeInsights.length > 0 ? (
            safeInsights.map((insight, idx) => <InsightCard key={idx} insight={insight} />)
          ) : (
            <div className="col-span-2 text-center text-gray-500 py-8">
              No insights were generated for this dataset.
            </div>
          )}
        </div>
      )}
    </div>
  );
};


export default InsightsPanel;
