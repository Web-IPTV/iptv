# IPTV Player Configuration

This document explains how to configure the IPTV Player using environment variables.

## Configuration Files

### `config.env.example`
This is a template file showing all available configuration options. Copy it to `config.env` and modify the values as needed.

### `config-loader.js`
This script loads configuration values and provides them to the application. It supports:
- Environment variables (if available)
- LocalStorage for user preferences
- Default fallback values

## Configuration Options

| Variable | Default | Description |
|----------|---------|-------------|
| `DEFAULT_M3U_FILE` | `channels_filtered.m3u` | Default M3U playlist file to load |
| `HTTP_PORT` | `8080` | Port for the HTTP server |
| `EPG_PORT` | `3001` | Port for the EPG server |
| `EPG_SCRIPT_PATH` | `/Users/harshalkutkar/epg_fetch.py` | Path to EPG fetching script |
| `EPG_URL` | `` | URL for EPG data (optional) |
| `M3U_URL` | `` | URL for remote M3U playlist (optional) |

## Setup Instructions

1. **Copy the example configuration:**
   ```bash
   cp config.env.example config.env
   ```

2. **Edit the configuration:**
   ```bash
   nano config.env
   ```

3. **Modify the values as needed:**
   ```env
   DEFAULT_M3U_FILE=my_channels.m3u
   HTTP_PORT=8080
   EPG_PORT=3001
   ```

4. **Start the application:**
   The configuration will be automatically loaded when the app starts.

## How It Works

1. The `config-loader.js` script loads configuration values
2. The `loadSettings()` function in `web-iptv.html` uses these values as defaults
3. User preferences are saved in localStorage and override the defaults
4. The configuration is used throughout the application

## Security Notes

- **Never commit `config.env`** - it may contain sensitive information
- **Keep `channels_filtered.m3u` local** - it contains your IPTV credentials
- **Use `.gitignore`** to exclude sensitive files from version control

## Troubleshooting

### Configuration not loading
- Check that `config-loader.js` is included in the HTML
- Verify the configuration file exists and is readable
- Check browser console for errors

### Default M3U file not found
- Ensure `channels_filtered.m3u` exists in the project directory
- Check the `DEFAULT_M3U_FILE` setting in your configuration
- Verify the HTTP server is running on the correct port

### Port conflicts
- Change the `HTTP_PORT` or `EPG_PORT` in your configuration
- Ensure no other services are using the same ports
- Restart the HTTP server after changing ports
