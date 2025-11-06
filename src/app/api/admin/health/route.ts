// @ts-ignore
import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatErrorResponse, AuthenticationError, logError } from '@/lib/error-handler';

interface HealthStatus {
  status: 'healthy' | 'warning' | 'error';
  database: 'connected' | 'disconnected';
  storage: 'normal' | 'warning' | 'critical';
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  lastBackup?: string;
  issues?: string[];
}

// GET - System health check
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new AuthenticationError();
    }

    const startTime = Date.now();

    // Check database connection
    let databaseStatus: 'connected' | 'disconnected' = 'connected';
    try {
      await prisma.$queryRaw`SELECT 1`;
      databaseStatus = 'connected';
    } catch (error) {
      console.error('Database health check error:', error);
      databaseStatus = 'disconnected';
    }

    // Check storage (uploads directory)
    let storageStatus: 'normal' | 'warning' | 'critical' = 'normal';
    try {
      // @ts-ignore
      const fs = require('fs');
      const uploadsDir = './public/uploads';
      
      if (fs.existsSync(uploadsDir)) {
        const stats = fs.statSync(uploadsDir);
        // Check if disk space is low (less than 1GB)
        const freeSpace = require('os').freemem();
        const oneGB = 1024 * 1024 * 1024;
        
        if (freeSpace < oneGB) {
          storageStatus = 'warning';
        }
      } else {
        storageStatus = 'critical';
      }
    } catch (error) {
      console.error('Storage health check error:', error);
      storageStatus = 'critical';
    }

    // Get memory usage
    let memoryUsage = { used: 0, total: 0, percentage: 0 };
    try {
      // @ts-ignore
      const used = process.memoryUsage();
      const total = require('os').totalmem();
      memoryUsage = {
        used: Math.round(used.heapUsed / 1024 / 1024 * 100) / 100,
        total: Math.round(total / 1024 / 1024 * 100) / 100,
        percentage: Math.round((used.heapUsed / total) * 100),
      };
    } catch (error) {
      console.error('Memory usage check error:', error);
    }

    // Get uptime (in a real app, you'd track this)
    const uptime = process.uptime();

    // Check for common issues
    const issues: string[] = [];
    
    if (databaseStatus === 'disconnected') {
      issues.push('Database connection failed');
    }
    
    if (storageStatus === 'critical') {
      issues.push('Uploads directory not accessible');
    }
    
    if (memoryUsage.percentage > 90) {
      issues.push('High memory usage');
    }

    // Determine overall health status
    let status: 'healthy' | 'warning' | 'error' = 'healthy';
    
    if (issues.length > 0) {
      status = 'error';
    } else if (databaseStatus === 'disconnected' || storageStatus === 'warning') {
      status = 'warning';
    }

    const responseTime = Date.now() - startTime;

    const healthData: HealthStatus = {
      status,
      database: databaseStatus,
      storage: storageStatus,
      uptime,
      memory: memoryUsage,
      issues,
    };

    // Log health check
    logError({
      message: `Health check completed in ${responseTime}ms`,
      context: 'System Health',
      metadata: healthData,
    });

    return NextResponse.json({
      success: true,
      data: healthData,
      responseTime,
    });
  } catch (error: any) {
    logError(error, 'Health API - GET');
    return NextResponse.json(
      formatErrorResponse(error),
      { status: error.statusCode || 500 }
    );
  }
}