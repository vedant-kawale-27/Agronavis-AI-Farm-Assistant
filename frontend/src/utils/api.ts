import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export const fetchFarmData = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/farm`);
        return response.data;
    } catch (error) {
        console.error('Error fetching farm data:', error);
        throw error;
    }
};

export const updateCropData = async (cropId: string, data: any) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/crops/${cropId}`, data);
        return response.data;
    } catch (error) {
        console.error('Error updating crop data:', error);
        throw error;
    }
};

export const fetchWeatherData = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/weather`);
        return response.data;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        throw error;
    }
};