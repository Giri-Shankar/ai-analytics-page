// Clean, single implementation for extracting insights from AI responses.
import { SensorData, Insight, StatsCollection } from '../types';
import { SENSOR_THRESHOLDS } from '../constants';

const OPENROUTER_API_KEY = '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';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

const getStatsSummary = (data: SensorData[]): StatsCollection => {
    const calculate = (key: keyof SensorData, anomalyKey: keyof SensorData) => {
        const values = data.map(d => d[key] as number).filter(v => !isNaN(v));
        if (values.length === 0) return { current: 0, min: 0, max: 0, avg: 0, change: 0, anomalies: 0 };
        const anomalies = data.filter(d => d[anomalyKey]).length;
        return {
            current: values[values.length - 1],
            min: Math.min(...values),
            max: Math.max(...values),
            avg: values.reduce((a, b) => a + b, 0) / values.length,
            change: values.length > 1 ? values[values.length - 1] - values[values.length - 2] : 0,
            anomalies
        };
    };
    return {
        temperature: calculate('temperature', 'tempAnomaly'),
        humidity: calculate('humidity', 'humAnomaly'),
        light: calculate('light', 'lightAnomaly'),
        airQuality: calculate('airQuality', 'airAnomaly')
    };
};

export const parseInsightsFromMarkdown = (md: string): Insight[] => {
    if (!md || typeof md !== "string") return [];

    // Normalize markdown
    const clean = md.replace(/\*\*/g, "").replace(/\*/g, "").trim();

    // Split by "Insight" or empty lines
    const rawBlocks = clean
        .split(/(?:Insight\s*\d+|\n\s*\n+)/i)
        .map(b => b.trim())
        .filter(b => b.length > 0);

    const insights: Insight[] = [];

    for (const block of rawBlocks) {
        const titleMatch = block.match(/Title:\s*(.+)/i);
        const descMatch = block.match(/Description:\s*([\s\S]*?)(?=\n(?:Severity|Recommendation):|$)/i);
        const severityMatch = block.match(/Severity:\s*(info|warning|critical|success)/i);
        const recMatch = block.match(/Recommendation:\s*([\s\S]*?)$/i);

        insights.push({
            title: titleMatch ? titleMatch[1].trim() : "Untitled Insight",
            description: descMatch ? descMatch[1].trim() : "",
            severity: severityMatch ? severityMatch[1].toLowerCase() as any : "info",
            recommendation: recMatch ? recMatch[1].trim() : ""
        });
    }

    return insights;
};


export const generateInsightsFromData = async (data: SensorData[]): Promise<Insight[]> => {
    if (!OPENROUTER_API_KEY) return [{ severity: 'warning', title: 'OpenRouter API Key Missing', description: 'AI insights cannot be generated without the API key.', recommendation: 'Set OPENROUTER_API_KEY to enable AI insights.' }];
    if (!data || data.length === 0) return [];
    const stats = getStatsSummary(data);
    const firstTimestamp = data[0].timestamp;
    const lastTimestamp = data[data.length - 1].timestamp;
    const prompt = `Analyze the following summary of environmental sensor data.\nData points: ${data.length}\nTime range: ${firstTimestamp} to ${lastTimestamp}\n\nStatistical Summary:\n- Temperature: Current: ${stats.temperature.current.toFixed(1)}°C, Avg: ${stats.temperature.avg.toFixed(1)}°C, Range: ${stats.temperature.min.toFixed(1)}-${stats.temperature.max.toFixed(1)}°C. Anomalies detected in ${stats.temperature.anomalies} readings. Safe range: ${SENSOR_THRESHOLDS.temperature.min}-${SENSOR_THRESHOLDS.temperature.max}°C.\n- Humidity: Current: ${stats.humidity.current.toFixed(1)}%, Avg: ${stats.humidity.avg.toFixed(1)}%, Range: ${stats.humidity.min.toFixed(1)}-${stats.humidity.max.toFixed(1)}%. Anomalies detected in ${stats.humidity.anomalies} readings. Safe range: ${SENSOR_THRESHOLDS.humidity.min}-${SENSOR_THRESHOLDS.humidity.max}%.\n- Light: Current: ${stats.light.current.toFixed(0)} lux, Avg: ${stats.light.avg.toFixed(0)} lux, Range: ${stats.light.min.toFixed(0)}-${stats.light.max.toFixed(0)} lux. Anomalies detected in ${stats.light.anomalies} readings.\n- Air Quality: Current: ${stats.airQuality.current.toFixed(0)} AQI, Avg: ${stats.airQuality.avg.toFixed(0)} AQI, Range: ${stats.airQuality.min.toFixed(0)}-${stats.airQuality.max.toFixed(0)} AQI. Anomalies detected in ${stats.airQuality.anomalies} readings. Good range: <50 AQI.\n\nProvide up to 4 key insights. Identify significant trends, anomalies, and correlations. For each insight, provide a title, a short description, a severity level ('info', 'warning', 'critical', 'success'), and a concise, actionable recommendation. If all readings are within optimal ranges, provide a 'success' insight confirming system stability. Please give me the data in json format instead of markdown format.`;
    try {
        const response = await fetch(OPENROUTER_URL, { method: 'POST', headers: { 'Authorization': `Bearer ${OPENROUTER_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'google/gemma-2-27b-it', messages: [{ role: 'system', content: 'You are a precise data analytics engine.' }, { role: 'user', content: prompt }], temperature: 0.4 }) });
        const result = await response.json();
        console.log(result)
        // console.log(result.text.trim())
        const text = result.choices?.[0]?.message?.content ?? result.choices?.[0]?.text ?? result.output?.[0]?.content ?? null;
        console.log('AI raw response:', text);
        if (!text || typeof text !== 'string') throw new Error('Invalid AI response');
        // let parsed = parseInsightsFromMarkdown(text);
        let cleanText = text.replace(/```json|```/g, '').trim();
        let parsed = JSON.parse(cleanText)
        if (!parsed) {
            console.error('Failed to parse AI response. Raw text:', text);
            throw new Error('Invalid AI JSON response');
        }
        const insights =
            Array.isArray(parsed) ? parsed :
                Array.isArray(parsed.insights) ? parsed.insights :
                    Array.isArray(parsed.data) ? parsed.data :
                        [];

        console.log("FINAL INSIGHTS ARRAY:", insights);

        return insights as Insight[];
    } catch (err) {
        console.error('Error calling GPT-OSS-20B:', err);
        throw new Error('Failed to generate insights using GPT-OSS-20B.');
    }
};
