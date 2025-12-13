import express, { Response } from 'express'
import { FarmService } from '../services/farmService'

interface AuthenticatedRequest extends express.Request {
  user?: {
    id: string;
    email: string;
  };
}

const router = express.Router()

// GET /api/farms - Get all farms for current farmer
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const farmerId = req.user?.id
    if (!farmerId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' })
    }

    const farms = await FarmService.getFarmsByFarmerId(farmerId)
    res.json({ success: true, data: farms })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// GET /api/farms/summary - Get farms summary with basic crop info
router.get('/summary', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const farmerId = req.user?.id
    if (!farmerId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' })
    }

    const summary = await FarmService.getFarmsSummary(farmerId)
    res.json({ success: true, data: summary })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// GET /api/farms/:id - Get specific farm by ID
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const farmerId = req.user?.id
    const farmId = req.params.id

    if (!farmerId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' })
    }

    // Validate farm ownership
    const isOwner = await FarmService.validateFarmOwnership(farmId, farmerId)
    if (!isOwner) {
      return res.status(403).json({ success: false, error: 'Access denied to this farm' })
    }

    const farm = await FarmService.getFarmById(farmId)
    if (!farm) {
      return res.status(404).json({ success: false, error: 'Farm not found' })
    }

    res.json({ success: true, data: farm })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// GET /api/farms/:id/details - Get farm with all related data
router.get('/:id/details', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const farmerId = req.user?.id
    const farmId = req.params.id

    if (!farmerId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' })
    }

    // Validate farm ownership
    const isOwner = await FarmService.validateFarmOwnership(farmId, farmerId)
    if (!isOwner) {
      return res.status(403).json({ success: false, error: 'Access denied to this farm' })
    }

    const farmDetails = await FarmService.getFarmWithDetails(farmId)
    if (!farmDetails) {
      return res.status(404).json({ success: false, error: 'Farm not found' })
    }

    res.json({ success: true, data: farmDetails })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// POST /api/farms - Create new farm
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const farmerId = req.user?.id
    if (!farmerId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' })
    }

    const farmData = {
      farmer_id: farmerId,
      name: req.body.name,
      total_area: req.body.total_area,
      address: req.body.address,
      location: req.body.location || {},
      soil_type: req.body.soil_type,
      irrigation_type: req.body.irrigation_type,
      ownership_type: req.body.ownership_type
    }

    // Process location data if provided
    if (req.body.latitude && req.body.longitude) {
      farmData.location = {
        ...farmData.location,
        latitude: parseFloat(req.body.latitude),
        longitude: parseFloat(req.body.longitude)
      }
    }

    // Validate required fields
    if (!farmData.name || !farmData.total_area) {
      return res.status(400).json({ 
        success: false, 
        error: 'Farm name and total area are required' 
      })
    }
    
    // Validate coordinates if provided
    if (farmData.location?.latitude && 
        (farmData.location.latitude < -90 || farmData.location.latitude > 90)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Latitude must be between -90 and 90 degrees' 
      })
    }
    
    if (farmData.location?.longitude && 
        (farmData.location.longitude < -180 || farmData.location.longitude > 180)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Longitude must be between -180 and 180 degrees' 
      })
    }

    if (farmData.total_area <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Total area must be greater than 0' 
      })
    }

    const farm = await FarmService.createFarm(farmData)
    res.status(201).json({ success: true, data: farm })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// PUT /api/farms/:id - Update farm
router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const farmerId = req.user?.id
    const farmId = req.params.id

    if (!farmerId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' })
    }

    // Validate farm ownership
    const isOwner = await FarmService.validateFarmOwnership(farmId, farmerId)
    if (!isOwner) {
      return res.status(403).json({ success: false, error: 'Access denied to this farm' })
    }

    const updates: any = {
      name: req.body.name,
      total_area: req.body.total_area,
      address: req.body.address,
      soil_type: req.body.soil_type,
      irrigation_type: req.body.irrigation_type,
      ownership_type: req.body.ownership_type
    }

    // Process location data if provided
    if (req.body.location || req.body.latitude || req.body.longitude) {
      // Get current location data first to merge with updates
      const currentFarm = await FarmService.getFarmById(farmId)
      const currentLocation = currentFarm?.location || {}
      
      updates.location = {
        ...currentLocation,
        ...(req.body.location || {})
      }
      
      // Process direct latitude/longitude if provided
      if (req.body.latitude) {
        updates.location.latitude = parseFloat(req.body.latitude)
      }
      
      if (req.body.longitude) {
        updates.location.longitude = parseFloat(req.body.longitude)
      }
      
      // Validate coordinates
      if (updates.location.latitude !== undefined && 
          (updates.location.latitude < -90 || updates.location.latitude > 90)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Latitude must be between -90 and 90 degrees' 
        })
      }
      
      if (updates.location.longitude !== undefined && 
          (updates.location.longitude < -180 || updates.location.longitude > 180)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Longitude must be between -180 and 180 degrees' 
        })
      }
    }

    // Remove undefined fields
    Object.keys(updates).forEach(key => {
      if (updates[key as keyof typeof updates] === undefined) {
        delete updates[key as keyof typeof updates]
      }
    })

    if (updates.total_area !== undefined && updates.total_area <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Total area must be greater than 0' 
      })
    }

    const farm = await FarmService.updateFarm(farmId, updates)
    res.json({ success: true, data: farm })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// DELETE /api/farms/:id - Delete farm
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const farmerId = req.user?.id
    const farmId = req.params.id

    if (!farmerId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' })
    }

    // Validate farm ownership
    const isOwner = await FarmService.validateFarmOwnership(farmId, farmerId)
    if (!isOwner) {
      return res.status(403).json({ success: false, error: 'Access denied to this farm' })
    }

    await FarmService.deleteFarm(farmId)
    res.json({ success: true, message: 'Farm deleted successfully' })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// GET /api/farms/location/nearby - Find farms near coordinates
router.get('/location/nearby', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const farmerId = req.user?.id
    if (!farmerId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' })
    }

    const latitude = parseFloat(req.query.latitude as string)
    const longitude = parseFloat(req.query.longitude as string)
    const radius = parseFloat(req.query.radius as string) || 10 // default 10km radius
    
    // Validate coordinates
    if (isNaN(latitude) || latitude < -90 || latitude > 90) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid latitude. Must be a number between -90 and 90' 
      })
    }
    
    if (isNaN(longitude) || longitude < -180 || longitude > 180) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid longitude. Must be a number between -180 and 180' 
      })
    }
    
    if (isNaN(radius) || radius <= 0 || radius > 100) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid radius. Must be a positive number less than 100km' 
      })
    }

    const farms = await FarmService.getFarmsByLocation(latitude, longitude, radius, farmerId)
    res.json({ success: true, data: farms })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

export default router