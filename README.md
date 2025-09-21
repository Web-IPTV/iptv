# IPTV Player with EPG

A modern web-based IPTV player with Electronic Program Guide (EPG) support, featuring a Spotify-inspired dark theme and advanced streaming capabilities.

## Features

### 🎬 **Advanced Streaming**
- **HLS Support**: Native HLS.js integration for `.m3u8` streams
- **MPEG-TS Support**: mpegts.js for raw transport streams
- **Smart Detection**: Automatic stream format detection and fallback
- **CORS Bypass**: HTTP server setup to avoid browser CORS restrictions

### 📺 **EPG Integration**
- **Real-time EPG**: Fetches program guide data from XMLTV feeds
- **Smart Caching**: 30-minute cache with persistent storage
- **Channel Matching**: Uses exact `tvg-id` from M3U files for accurate EPG lookup
- **Current/Next Programs**: Highlights current and upcoming shows

### 🎨 **Modern UI**
- **Spotify Theme**: Dark black and green color scheme
- **Responsive Design**: Works on desktop and mobile devices
- **Scrollable Channels**: Compact channel list with proper scrolling
- **Channel Logos**: Support for channel logos with fallback emojis

### 📁 **File Management**
- **Auto-load**: Automatically loads `channels_filtered.m3u` on startup
- **Manual Upload**: File picker for custom M3U files
- **M3U Parsing**: Full support for M3U playlist format with metadata

## Quick Start

### 🌐 **Live Demo (GitHub Pages)**
**Try it now**: https://web-iptv.github.io/iptv/

### Prerequisites
- Node.js (for EPG server)
- Python 3 (for EPG fetching script)
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd iptv
   ```

2. **Install dependencies**
   ```bash
   npm install express cors dotenv
   ```

3. **Configure environment (optional)**
   ```bash
   # Copy the example environment file
   cp env.example .env
   
   # Edit .env with your settings
   nano .env
   ```

4. **Start the servers**
   ```bash
   # Terminal 1: Start EPG server
   node epg-server.js
   
   # Terminal 2: Start HTTP server
   python3 -m http.server 8080
   ```

5. **Open the application**
   ```
   http://localhost:8080/web-iptv.html
   ```

## 🌐 External Access

### Quick Setup with ngrok (Recommended)
```bash
# Start the server
python3 -m http.server 8080

# In another terminal, create public tunnel
./ngrok-tunnel.sh
```

### Network Access (Local Network Only)
```bash
# Start with external access script
./start-external.sh
```

### Manual Port Forwarding
1. **Find your local IP**: `192.168.1.103`
2. **Configure router port forwarding**:
   - External Port: `8080`
   - Internal IP: `192.168.1.103`
   - Internal Port: `8080`
3. **Access via**: `http://YOUR_EXTERNAL_IP:8080/web-iptv.html`

### Access URLs
- **Local**: `http://localhost:8080/web-iptv.html`
- **Network**: `http://192.168.1.103:8080/web-iptv.html`
- **External**: `http://107.142.214.21:8080/web-iptv.html` (after port forwarding)
- **ngrok**: `https://random-id.ngrok.io/web-iptv.html` (temporary public URL)
- **GitHub Pages**: `https://web-iptv.github.io/iptv/` (permanent public hosting)

## 🚀 GitHub Pages Deployment

### Automatic Deployment
Your IPTV player is automatically deployed to GitHub Pages whenever you push to the `main` branch.

**Live URL**: https://web-iptv.github.io/iptv/

### Manual Setup (if needed)
1. Go to your repository **Settings**
2. Scroll to **Pages** section
3. Under **Source**, select **"Deploy from a branch"**
4. Select **main** branch and **/ (root)** folder
5. Click **Save**

### GitHub Pages Features
- ✅ **Free hosting** with custom domain support
- ✅ **HTTPS enabled** by default
- ✅ **Automatic deployment** on every push
- ✅ **CDN distribution** for fast global access
- ✅ **Custom 404 pages** and redirects
- ⚠️ **EPG server not available** (client-side only)
- ⚠️ **Sample playlists only** (no local M3U files)

## Usage

### Loading Channels
- **Automatic**: The app loads the configured M3U file automatically
- **Manual**: Click "📁 Upload M3U File" to select a custom playlist
- **Reload**: Click "🔄 Load Default Playlist" to reload the default file
- **Settings**: Click "⚙️ Settings" to configure paths and options

### Watching Channels
1. Click any channel in the list to start streaming
2. The player automatically detects the best streaming method
3. Use video controls for play/pause, mute, and fullscreen

### EPG Guide
- **View EPG**: Select a channel to see its program guide
- **Toggle Panel**: Use "Hide/Show" button to collapse the EPG panel
- **Current Program**: Shows what's currently airing with "🔴 NOW" indicator
- **Upcoming**: Lists next programs with times

### Settings Configuration
Click the "⚙️ Settings" button to access the configuration panel:

#### 📁 M3U Configuration
- **M3U File Name**: Local file name for the playlist
- **M3U URL**: Remote URL for online playlists

#### 🌐 Server Configuration
- **HTTP Server Port**: Port for the web server (default: 8080)
- **EPG Server Port**: Port for the EPG server (default: 3001)

#### 📺 EPG Configuration
- **EPG Script Path**: Path to your Python EPG script
- **EPG URL**: URL for XMLTV EPG data
- **Cache Duration**: How long to cache EPG data (minutes)

#### 🎨 UI Configuration
- **Theme**: Choose between Spotify Dark, Classic, or Minimal
- **Channel Logo Size**: Small (24px), Medium (40px), or Large (60px)

#### 💾 Data Management
- **Save Settings**: Persist current configuration
- **Reset to Defaults**: Restore factory settings
- **Export/Import**: Backup and restore settings as JSON files

#### 🔧 Advanced Tools
- **Clear EPG Cache**: Remove cached EPG data
- **Test EPG Connection**: Verify EPG server connectivity
- **Reload Configuration**: Apply settings changes

## File Structure

```
iptv/
├── web-iptv.html          # Main web application
├── epg-server.js          # EPG server with caching
├── channels_filtered.m3u  # Default channel playlist
├── package.json           # Node.js dependencies
└── README.md             # This file
```

## EPG Configuration

The EPG system uses your Python script at `/Users/harshalkutkar/epg_fetch.py`:

```bash
# Test EPG fetching
python3 /Users/harshalkutkar/epg_fetch.py bbcone.nl --limit 5
```

### EPG Server Endpoints
- `GET /api/epg/:channelId` - Fetch EPG for a channel
- `GET /api/cache/status` - View cache status
- `DELETE /api/cache` - Clear cache
- `GET /api/health` - Health check

## M3U Format Support

The player supports standard M3U format with extended metadata:

```m3u
#EXTM3U
#EXTINF:-1 tvg-id="bbcone.nl" tvg-name="UK| BBC ONE HD" tvg-logo="https://example.com/logo.png" group-title="UK Channels",UK| BBC ONE HD
http://example.com/stream.m3u8
```

### Supported Attributes
- `tvg-id`: Channel ID for EPG matching
- `tvg-name`: Display name
- `tvg-logo`: Channel logo URL
- `group-title`: Channel category

## Streaming Technologies

### HLS (HTTP Live Streaming)
- **Format**: `.m3u8` playlists
- **Library**: HLS.js
- **Features**: Adaptive bitrate, low latency mode

### MPEG-TS (Transport Stream)
- **Format**: Raw `.ts` streams
- **Library**: mpegts.js
- **Features**: Live streaming, CORS support

### Direct Video
- **Format**: Direct video URLs
- **Fallback**: HTML5 video element
- **Features**: Native browser support

## Caching System

### EPG Cache
- **Duration**: 30 minutes
- **Storage**: Persistent JSON file (`epg-cache.json`)
- **Benefits**: Faster loading, reduced API calls

### Cache Management
```bash
# View cache status
curl http://localhost:3001/api/cache/status

# Clear cache
curl -X DELETE http://localhost:3001/api/cache
```

## Troubleshooting

### CORS Issues
- Ensure you're accessing via `http://localhost:8080` not `file://`
- Check that both servers are running

### Stream Not Playing
- Check browser console for errors
- Verify stream URL is accessible
- Try different streaming methods (HLS vs MPEG-TS)

### EPG Not Loading
- Verify Python script is accessible at `/Users/harshalkutkar/epg_fetch.py`
- Check EPG server logs for errors
- Test EPG endpoint directly: `curl http://localhost:3001/api/epg/bbcone.nl`

## Development

### Adding New Features
1. Modify `web-iptv.html` for UI changes
2. Update `epg-server.js` for server-side changes
3. Test with different M3U files and stream formats

### Customization
- **Theme**: Modify CSS variables in `web-iptv.html`
- **EPG Source**: Update Python script path in `epg-server.js`
- **Cache Duration**: Change `CACHE_DURATION` in `epg-server.js`

## License

This project is open source and available under the MIT License.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Enjoy your IPTV streaming experience!** 🎬📺