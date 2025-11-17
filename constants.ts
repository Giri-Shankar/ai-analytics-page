
import { Thresholds } from './types';
import { TrendingUp, Droplets, Sun, Wind } from 'lucide-react';

export const SENSOR_THRESHOLDS: Thresholds = {
  temperature: { min: 15, max: 30, optimal: [18, 26] },
  humidity: { min: 30, max: 70, optimal: [40, 60] },
  light: { min: 100, max: 1000, optimal: [300, 800] },
  airQuality: { min: 0, max: 150, optimal: [0, 50] }
};

export const SENSOR_CONFIG = {
  temperature: { name: 'Temperature', unit: '°C', color: '#EF4444', icon: TrendingUp },
  humidity: { name: 'Humidity', unit: '%', color: '#3B82F6', icon: Droplets },
  light: { name: 'Light', unit: 'lux', color: '#F59E0B', icon: Sun },
  airQuality: { name: 'Air Quality', unit: 'AQI', color: '#10B981', icon: Wind }
};

export const SAMPLE_CSV_DATA = `date,time,temperature,humidity,light,airQuality
2023-10-01,00:00,20.5,55,5,30
2023-10-01,01:00,20.2,56,4,32
2023-10-01,02:00,20.0,57,5,35
2023-10-01,03:00,19.8,58,6,33
2023-10-01,04:00,19.6,59,5,36
2023-10-01,05:00,19.5,60,10,38
2023-10-01,06:00,19.7,61,50,40
2023-10-01,07:00,20.1,60,150,42
2023-10-01,08:00,21.0,58,300,45
2023-10-01,09:00,22.2,55,500,50
2023-10-01,10:00,23.5,52,700,55
2023-10-01,11:00,24.8,50,850,60
2023-10-01,12:00,25.5,48,950,65
2023-10-01,13:00,26.0,47,980,70
2023-10-01,14:00,25.8,48,900,68
2023-10-01,15:00,25.1,50,750,62
2023-10-01,16:00,24.2,53,550,58
2023-10-01,17:00,23.1,56,350,54
2023-10-01,18:00,22.5,58,100,51
2023-10-01,19:00,21.8,60,10,48
2023-10-01,20:00,21.4,62,8,46
2023-10-01,21:00,21.0,63,6,44
2023-10-01,22:00,20.8,64,5,41
2023-10-01,23:00,20.6,65,5,39
`;
