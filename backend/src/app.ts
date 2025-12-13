import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';

// Import all route modules
import farmerRoutes from './routes/farmers';
import farmRoutes from './routes/farms';
import cropRoutes from './routes/crops';
import resourceRoutes from './routes/resources';
import soilHealthRoutes from './routes/soilHealth';
import yieldRoutes from './routes/yields';
import mlRoutes from './routes/ml'; // ML routes for plant disease and pest detection

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3002', 'https://localhost:3000', 'https://localhost:3002'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint (no auth required)
app.get('/health', (_req: Request, res: Response) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'agronavis-api'
  });
});

// Public routes (no authentication)
app.get('/api/crop-varieties', async (req: Request, res: Response) => {
  // This endpoint will return crop varieties for dropdowns
  try {
    const { supabase } = await import('./lib/supabase');
    const { data, error } = await supabase
      .from('crop_varieties')
      .select('*')
      .order('crop_type', { ascending: true });
    
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Import authentication middleware
import { authenticateSupabase } from './middleware/supabaseAuth';

// Test auth endpoint
app.get('/api/test-auth', authenticateSupabase, (req: any, res: Response) => {
  res.json({
    success: true,
    message: 'Authentication successful',
    user: {
      id: req.user.id,
      email: req.user.email
    }
  });
});

// API routes with authentication middleware
app.use('/api/farmers', authenticateSupabase, farmerRoutes);
app.use('/api/farms', authenticateSupabase, farmRoutes);
app.use('/api/crops', authenticateSupabase, cropRoutes);
app.use('/api/resources', authenticateSupabase, resourceRoutes);
app.use('/api/soil-health', authenticateSupabase, soilHealthRoutes);
app.use('/api/yields', authenticateSupabase, yieldRoutes);
app.use('/api/ml', mlRoutes); // ML routes for plant disease and pest detection

// Error handling middleware
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  console.error('API Error:', error);
  res.status(error.status || 500).json({
    success: false,
    error: error.message || 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl
  });
});

app.listen(PORT, () => {
  console.log(`🚀 AgroNavis API running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API Base URL: http://localhost:${PORT}/api`);
});

export default app;