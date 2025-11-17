
import { GoogleGenAI, Type } from "@google/genai";
import { SensorData, Insight, StatsCollection } from '../types';
import { SENSOR_THRESHOLDS } from '../constants';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    console.warn("API_KEY environment variable not set. Gemini features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const getStatsSummary = (data: SensorData[]): StatsCollection => {
    const calculate = (key: keyof SensorData, anomalyKey: keyof SensorData) => {
        const values = data.map(d => d[key] as number).filter(v => !isNaN(v));
        if (values.length === 0) {
            return { current: 0, min: 0, max: 0, avg: 0, change: 0, anomalies: 0 };
        }
        const anomalies = data.filter(d => d[anomalyKey]).length;
        return {
            current: values[values.length - 1] || 0,
            min: Math.min(...values),
            max: Math.max(...values),
            avg: values.reduce((a, b) => a + b, 0) / values.length,
            change: values.length > 1 ? values[values.length - 1] - values[values.length - 2] : 0,
            anomalies: anomalies
        };
    };
    return {
        temperature: calculate('temperature', 'tempAnomaly'),
        humidity: calculate('humidity', 'humAnomaly'),
        light: calculate('light', 'lightAnomaly'),
        airQuality: calculate('airQuality', 'airAnomaly')
    };
};

export const generateInsightsFromData = async (data: SensorData[]): Promise<Insight[]> => {
    if (!API_KEY) {
         return [{
          severity: 'warning',
          title: 'Gemini API Key Not Found',
          description: 'The API key is missing. AI-powered insights are unavailable.',
          recommendation: 'Please configure your environment with a valid API_KEY to enable this feature.'
        }];
    }
    if (data.length === 0) return [];

    const stats = getStatsSummary(data);
    const firstTimestamp = data[0].timestamp;
    const lastTimestamp = data[data.length - 1].timestamp;

    const prompt = `
      Analyze the following summary of environmental sensor data.
      Data points: ${data.length}
      Time range: ${firstTimestamp} to ${lastTimestamp}
      
      Statistical Summary:
      - Temperature: Current: ${stats.temperature.current.toFixed(1)}°C, Avg: ${stats.temperature.avg.toFixed(1)}°C, Range: ${stats.temperature.min.toFixed(1)}-${stats.temperature.max.toFixed(1)}°C. Anomalies detected in ${stats.temperature.anomalies} readings. Safe range: ${SENSOR_THRESHOLDS.temperature.min}-${SENSOR_THRESHOLDS.temperature.max}°C.
      - Humidity: Current: ${stats.humidity.current.toFixed(1)}%, Avg: ${stats.humidity.avg.toFixed(1)}%, Range: ${stats.humidity.min.toFixed(1)}-${stats.humidity.max.toFixed(1)}%. Anomalies detected in ${stats.humidity.anomalies} readings. Safe range: ${SENSOR_THRESHOLDS.humidity.min}-${SENSOR_THRESHOLDS.humidity.max}%.
      - Light: Current: ${stats.light.current.toFixed(0)} lux, Avg: ${stats.light.avg.toFixed(0)} lux, Range: ${stats.light.min.toFixed(0)}-${stats.light.max.toFixed(0)} lux. Anomalies detected in ${stats.light.anomalies} readings.
      - Air Quality: Current: ${stats.airQuality.current.toFixed(0)} AQI, Avg: ${stats.airQuality.avg.toFixed(0)} AQI, Range: ${stats.airQuality.min.toFixed(0)}-${stats.airQuality.max.toFixed(0)} AQI. Anomalies detected in ${stats.airQuality.anomalies} readings. Good range: <50 AQI.

      Provide up to 4 key insights. Identify significant trends, anomalies, and correlations. For each insight, provide a title, a short description, a severity level ('info', 'warning', 'critical', 'success'), and a concise, actionable recommendation. If all readings are within optimal ranges, provide a 'success' insight confirming system stability.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            severity: { type: Type.STRING, enum: ['info', 'warning', 'critical', 'success'] },
                            title: { type: Type.STRING },
                            description: { type: Type.STRING },
                            recommendation: { type: Type.STRING }
                        },
                        required: ["severity", "title", "description", "recommendation"]
                    },
                },
            },
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        return result as Insight[];
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to generate insights from Gemini API.");
    }
};
