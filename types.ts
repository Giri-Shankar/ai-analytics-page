
export interface SensorData {
  id: number;
  date: string;
  time: string;
  hour: number;
  isDaytime: boolean;
  temperature: number;
  humidity: number;
  light: number;
  airQuality: number;
  timestamp: string;
  tempAnomaly: boolean;
  humAnomaly: boolean;
  lightAnomaly: boolean;
  airAnomaly: boolean;
}

export interface SensorStats {
  current: number;
  min: number;
  max: number;
  avg: number;
  change: number;
  anomalies: number;
}

export interface StatsCollection {
  temperature: SensorStats;
  humidity: SensorStats;
  light: SensorStats;
  airQuality: SensorStats;
}

export interface Thresholds {
  [key: string]: {
    min: number;
    max: number;
    optimal: [number, number];
  };
}

export interface Insight {
  severity: 'info' | 'warning' | 'critical' | 'success';
  title: string;
  description: string;
  recommendation: string;
}
