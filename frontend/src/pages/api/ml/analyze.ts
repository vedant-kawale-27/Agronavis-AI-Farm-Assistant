import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { image, format } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    // Call the backend ML service
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/api/ml/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_base64: `data:image/jpeg;base64,${image}`,
        confidence_threshold: 0.5
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend ML service error:', errorText);
      return res.status(response.status).json({ 
        error: `Analysis failed: ${response.statusText}` 
      });
    }

    const result = await response.json();
    return res.status(200).json(result);

  } catch (error) {
    console.error('ML analysis API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error during analysis' 
    });
  }
}

// Increase payload size limit for image uploads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};