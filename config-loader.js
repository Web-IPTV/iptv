// Configuration loader for IPTV Player
// This script loads environment variables and provides default values

class ConfigLoader {
    constructor() {
        this.config = this.loadConfig();
    }

    loadConfig() {
        // Default configuration
        const defaultConfig = {
            DEFAULT_M3U_FILE: 'channels_filtered.m3u',
            HTTP_PORT: '8080',
            EPG_PORT: '3001',
            EPG_SCRIPT_PATH: '/Users/harshalkutkar/epg_fetch.py',
            EPG_URL: '',
            M3U_URL: ''
        };

        // Try to load from config.env file (if available)
        try {
            // In a real environment, you would load from a .env file
            // For now, we'll use localStorage to store user preferences
            const savedConfig = localStorage.getItem('iptv-config');
            if (savedConfig) {
                const parsedConfig = JSON.parse(savedConfig);
                return { ...defaultConfig, ...parsedConfig };
            }
        } catch (error) {
            console.warn('Could not load saved configuration:', error);
        }

        return defaultConfig;
    }

    get(key) {
        return this.config[key] || '';
    }

    set(key, value) {
        this.config[key] = value;
        this.saveConfig();
    }

    saveConfig() {
        try {
            localStorage.setItem('iptv-config', JSON.stringify(this.config));
        } catch (error) {
            console.warn('Could not save configuration:', error);
        }
    }

    // Get all configuration as an object
    getAll() {
        return { ...this.config };
    }

    // Reset to defaults
    reset() {
        this.config = {
            DEFAULT_M3U_FILE: 'channels_filtered.m3u',
            HTTP_PORT: '8080',
            EPG_PORT: '3001',
            EPG_SCRIPT_PATH: '/Users/harshalkutkar/epg_fetch.py',
            EPG_URL: '',
            M3U_URL: ''
        };
        this.saveConfig();
    }
}

// Create global instance
window.iptvConfig = new ConfigLoader();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConfigLoader;
}