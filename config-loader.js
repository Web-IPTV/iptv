const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

// Create a configuration object
const config = {
    M3U_FILE_NAME: process.env.M3U_FILE_PATH || 'channels_filtered.m3u',
    HTTP_PORT: process.env.HTTP_PORT || '8080',
    EPG_PORT: process.env.EPG_PORT || '3001',
    EPG_SCRIPT_PATH: process.env.EPG_SCRIPT_PATH || '/Users/harshalkutkar/epg_fetch.py',
    CACHE_DURATION_MINUTES: process.env.CACHE_DURATION_MINUTES || '30'
};

// Generate a JavaScript file that can be included in the HTML
const configJs = `
// Auto-generated configuration from environment variables
window.IPTV_CONFIG = ${JSON.stringify(config, null, 2)};
`;

// Write the config file
fs.writeFileSync(path.join(__dirname, 'config.js'), configJs);

console.log('Configuration loaded:');
console.log('- M3U File:', config.M3U_FILE_NAME);
console.log('- HTTP Port:', config.HTTP_PORT);
console.log('- EPG Port:', config.EPG_PORT);
console.log('- EPG Script:', config.EPG_SCRIPT_PATH);
console.log('- Cache Duration:', config.CACHE_DURATION_MINUTES, 'minutes');
