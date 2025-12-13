import axios from 'axios';

const HUGGING_FACE_API_URL = 'https://api-inference.huggingface.co/models';
const HUGGING_FACE_API_KEY = process.env.HUGGING_FACE_API_KEY;

export const getModelPrediction = async (modelName: string, inputData: any) => {
    try {
        const response = await axios.post(
            `${HUGGING_FACE_API_URL}/${modelName}`,
            inputData,
            {
                headers: {
                    Authorization: `Bearer ${HUGGING_FACE_API_KEY}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching prediction from Hugging Face:', error);
        throw new Error('Failed to get prediction');
    }
};