const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

// Load environment variables
require('dotenv').config();

const app = express();
const PORT = process.env.EPG_PORT || 3001;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// EPG Cache
const epgCache = new Map();
const CACHE_DURATION = (process.env.CACHE_DURATION_MINUTES || 30) * 60 * 1000; // minutes to milliseconds
const CACHE_FILE = 'epg-cache.json';

// Load cache from file on startup
loadCacheFromFile();

// Cache management functions
function loadCacheFromFile() {
    try {
        if (fs.existsSync(CACHE_FILE)) {
            const data = fs.readFileSync(CACHE_FILE, 'utf8');
            const cacheData = JSON.parse(data);
            
            // Only load non-expired entries
            const now = Date.now();
            for (const [key, value] of Object.entries(cacheData)) {
                if (value.timestamp && (now - value.timestamp) < CACHE_DURATION) {
                    epgCache.set(key, value);
                }
            }
            
            console.log(`Loaded ${epgCache.size} cached EPG entries`);
        }
    } catch (error) {
        console.error('Error loading cache:', error);
    }
}

function saveCacheToFile() {
    try {
        const cacheData = {};
        for (const [key, value] of epgCache.entries()) {
            cacheData[key] = value;
        }
        fs.writeFileSync(CACHE_FILE, JSON.stringify(cacheData, null, 2));
    } catch (error) {
        console.error('Error saving cache:', error);
    }
}

function isCacheValid(timestamp) {
    return timestamp && (Date.now() - timestamp) < CACHE_DURATION;
}

// EPG endpoint
app.get('/api/epg/:channelId', (req, res) => {
    const { channelId } = req.params;
    
    console.log(`Fetching EPG for channel: ${channelId}`);
    
    // Check cache first
    const cachedData = epgCache.get(channelId);
    if (cachedData && isCacheValid(cachedData.timestamp)) {
        console.log(`Using cached EPG data for ${channelId}`);
        return res.json({
            success: true,
            channelId: channelId,
            programmes: cachedData.programmes,
            cached: true
        });
    }
    
    // Call the Python script
    const epgScriptPath = process.env.EPG_SCRIPT_PATH || '/Users/harshalkutkar/epg_fetch.py';
    const pythonScript = spawn('python3', [
        epgScriptPath,
        channelId,
        '--limit', '20'
    ]);
    
    let output = '';
    let errorOutput = '';
    
    pythonScript.stdout.on('data', (data) => {
        output += data.toString();
    });
    
    pythonScript.stderr.on('data', (data) => {
        errorOutput += data.toString();
    });
    
    pythonScript.on('close', (code) => {
        if (code === 0) {
            // Parse the output from the Python script
            const programmes = parseEPGOutput(output);
            
            // Cache the result
            epgCache.set(channelId, {
                programmes: programmes,
                timestamp: Date.now()
            });
            
            // Save cache to file
            saveCacheToFile();
            
            console.log(`Cached EPG data for ${channelId}`);
            
            res.json({
                success: true,
                channelId: channelId,
                programmes: programmes,
                cached: false
            });
        } else {
            console.error('Python script error:', errorOutput);
            res.status(500).json({
                success: false,
                error: errorOutput || 'Failed to fetch EPG data'
            });
        }
    });
    
    pythonScript.on('error', (err) => {
        console.error('Failed to start Python script:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to start EPG fetch process'
        });
    });
});

function parseEPGOutput(output) {
    const lines = output.trim().split('\n');
    const programmes = [];
    
    for (const line of lines) {
        if (line.includes(' -> ') && line.includes(' | ')) {
            const parts = line.split(' | ');
            if (parts.length >= 2) {
                const timePart = parts[0].trim();
                const title = parts[1].trim();
                
                // Match format: YYYYMMDDHHMMSS +0000 -> YYYYMMDDHHMMSS +0000
                const timeMatch = timePart.match(/(\d{14})\s*\+\d{4}\s*->\s*(\d{14})\s*\+\d{4}/);
                if (timeMatch) {
                    const startTime = parseEPGTime(timeMatch[1]);
                    const stopTime = parseEPGTime(timeMatch[2]);
                    
                    programmes.push({
                        start: startTime,
                        stop: stopTime,
                        title: title
                    });
                }
            }
        }
    }
    
    return programmes;
}

function parseEPGTime(timeString) {
    // Parse EPG time format (YYYYMMDDHHMMSS)
    if (timeString.length < 14) return new Date().toISOString();
    
    const year = parseInt(timeString.substring(0, 4));
    const month = parseInt(timeString.substring(4, 6)) - 1; // Month is 0-indexed
    const day = parseInt(timeString.substring(6, 8));
    const hour = parseInt(timeString.substring(8, 10));
    const minute = parseInt(timeString.substring(10, 12));
    const second = parseInt(timeString.substring(12, 14));
    
    return new Date(year, month, day, hour, minute, second).toISOString();
}

// Cache management endpoints
app.get('/api/cache/status', (req, res) => {
    const now = Date.now();
    const validEntries = Array.from(epgCache.entries()).filter(([key, value]) => 
        isCacheValid(value.timestamp)
    );
    
    res.json({
        totalEntries: epgCache.size,
        validEntries: validEntries.length,
        cacheDuration: CACHE_DURATION,
        entries: validEntries.map(([key, value]) => ({
            channelId: key,
            programmesCount: value.programmes.length,
            age: Math.round((now - value.timestamp) / 1000 / 60) // minutes
        }))
    });
});

app.delete('/api/cache', (req, res) => {
    epgCache.clear();
    if (fs.existsSync(CACHE_FILE)) {
        fs.unlinkSync(CACHE_FILE);
    }
    res.json({ message: 'Cache cleared successfully' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        cacheEntries: epgCache.size
    });
});

app.listen(PORT, () => {
    console.log(`EPG Server running on http://localhost:${PORT}`);
    console.log('Available endpoints:');
    console.log(`  GET /api/epg/:channelId - Fetch EPG for a channel (with caching)`);
    console.log(`  GET /api/cache/status - View cache status`);
    console.log(`  DELETE /api/cache - Clear cache`);
    console.log(`  GET /api/health - Health check`);
    console.log(`Cache duration: ${CACHE_DURATION / 1000 / 60} minutes`);
});
