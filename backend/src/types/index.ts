export interface Farm {
    id: string;
    name: string;
    location: string;
    size: number; // in acres
    crops: Crop[];
}

export interface Crop {
    id: string;
    name: string;
    growthStage: string;
    healthStatus: string;
    lastWatered: Date;
}

export interface Weather {
    temperature: number; // in Celsius
    humidity: number; // in percentage
    precipitation: number; // in mm
    windSpeed: number; // in km/h
}