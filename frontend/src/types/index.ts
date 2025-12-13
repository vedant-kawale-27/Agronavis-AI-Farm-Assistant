export type FarmData = {
  id: string;
  name: string;
  location: string;
  crops: Crop[];
  weather: Weather;
};

export type Crop = {
  id: string;
  name: string;
  growthStage: string;
  healthStatus: string;
  careTips: string[];
};

export type Weather = {
  temperature: number;
  humidity: number;
  precipitation: number;
  conditions: string;
};