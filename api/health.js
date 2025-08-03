/**
 * Health Check API Endpoint
 * Provides comprehensive health status including database connectivity
 */

export default async function handler(req, res) {
  const startTime = Date.now();
  
  try {
    // CORS headers for health checks
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    if (req.method !== 'GET') {
      return res.status(405).json({ 
        status: 'error', 
        message: 'Method not allowed' 
      });
    }

    // Basic health checks
    const checks = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0'
    };

    // Database connectivity check (if Supabase is configured)
    if (process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY) {
      try {
        // Simple ping to Supabase
        const supabaseResponse = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/`, {
          method: 'HEAD',
          headers: {
            'apikey': process.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`
          }
        });
        
        checks.database = {
          status: supabaseResponse.ok ? 'healthy' : 'unhealthy',
          responseTime: Date.now() - startTime,
          url: process.env.VITE_SUPABASE_URL
        };
      } catch (error) {
        checks.database = {
          status: 'error',
          error: error.message,
          responseTime: Date.now() - startTime
        };
      }
    } else {
      checks.database = {
        status: 'not_configured',
        message: 'Supabase configuration not found'
      };
    }

    // Calculate overall status
    const isHealthy = (
      checks.database.status === 'healthy' || 
      checks.database.status === 'not_configured'
    ) && checks.memory.heapUsed < checks.memory.heapTotal * 0.9;

    const responseTime = Date.now() - startTime;

    return res.status(isHealthy ? 200 : 503).json({
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: checks.timestamp,
      responseTime: `${responseTime}ms`,
      services: {
        application: 'healthy',
        database: checks.database.status,
        memory: checks.memory.heapUsed < checks.memory.heapTotal * 0.9 ? 'healthy' : 'warning'
      },
      details: checks
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    return res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      error: error.message,
      services: {
        application: 'error',
        database: 'unknown',
        memory: 'unknown'
      }
    });
  }
}