
import { SensorData } from '../types';
import { SENSOR_THRESHOLDS } from '../constants';

export const processSensorData = (rawData: Record<string, any>[]): SensorData[] => {
  return rawData
    .map((row, index) => {
      const temp = parseFloat(row.temperature || row.Temperature || row.temp || row.Temp);
      const hum = parseFloat(row.humidity || row.Humidity || row.humd || row.Humd);
      const light = parseFloat(row.light || row.Light);
      const air = parseFloat(row.airQuality || row['air quality'] || row.AirQuality || row['Air Quality']);
      
      if (isNaN(temp) || isNaN(hum) || isNaN(light) || isNaN(air)) {
        return null;
      }
      
      const time = String(row.time || row.Time || '00:00');
      const date = String(row.date || row.Date || new Date().toISOString().split('T')[0]);
      const hour = time ? parseInt(time.split(':')[0], 10) : 0;
      
      const thresholds = SENSOR_THRESHOLDS;

      return {
        id: index,
        date: date,
        time: time,
        hour: isNaN(hour) ? 0 : hour,
        isDaytime: hour >= 6 && hour < 18,
        temperature: temp,
        humidity: hum,
        light: light,
        airQuality: air,
        timestamp: `${date} ${time}`,
        tempAnomaly: temp < thresholds.temperature.min || temp > thresholds.temperature.max,
        humAnomaly: hum < thresholds.humidity.min || hum > thresholds.humidity.max,
        lightAnomaly: light < thresholds.light.min || light > thresholds.light.max,
        airAnomaly: air > thresholds.airQuality.max
      };
    })
    .filter((item): item is SensorData => item !== null);
};
