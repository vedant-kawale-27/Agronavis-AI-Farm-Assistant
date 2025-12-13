import { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase';

export const authenticateSupabase = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    // Verify the token with Supabase
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      return res.status(401).json({ success: false, error: 'Invalid authentication token' });
    }
    
    // Add the authenticated user to the request
    req.user = data.user;
    
    next();
  } catch (err) {
    console.error('Auth error:', err);
    return res.status(401).json({ success: false, error: 'Authentication failed' });
  }
};