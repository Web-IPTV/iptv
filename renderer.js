const M3UParser = require('./m3u-parser.js');

class IPTVApp {
    constructor() {
        this.channels = [];
        this.currentChannel = null;
        this.video = null;
        this.hls = null;
        this.mpegts = null;
        this.parser = new M3UParser();
        this.isLoading = false;
        
        this.initializeApp();
    }

    initializeApp() {
        this.video = document.getElementById('video-player');
        this.setupEventListeners();
        this.setupProgressCallback();
        
        // Auto-load the default M3U file
        this.loadDefaultM3U();
    }

    setupEventListeners() {
        // File input
        const fileInput = document.getElementById('file-input');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                console.log('File selected:', e.target.files[0]);
                this.handleFileSelect(e.target.files[0]);
            });
        } else {
            console.error('File input element not found!');
        }

        // Load file button
        const loadBtn = document.getElementById('load-file-btn');
        if (loadBtn) {
            loadBtn.addEventListener('click', () => {
                console.log('Load file button clicked');
                const fileInput = document.getElementById('file-input');
                if (fileInput) {
                    fileInput.click();
                } else {
                    console.error('File input not found when button clicked');
                }
            });
        } else {
            console.error('Load file button not found!');
        }

        // Video controls
        document.getElementById('play-btn').addEventListener('click', () => {
            this.togglePlayPause();
        });

        document.getElementById('stop-btn').addEventListener('click', () => {
            this.stopStream();
        });

        document.getElementById('fullscreen-btn').addEventListener('click', () => {
            this.toggleFullscreen();
        });

        // Search
        document.getElementById('search-input').addEventListener('input', (e) => {
            this.filterChannels(e.target.value);
        });

        // Video events
        this.video.addEventListener('error', (e) => {
            this.handleVideoError(e);
        });

        this.video.addEventListener('loadstart', () => {
            this.updateStatus('Loading stream...');
        });

        this.video.addEventListener('canplay', () => {
            this.updateStatus('Stream ready');
        });
    }

    setupProgressCallback() {
        this.parser.setProgressCallback((progress) => {
            this.updateProgress(progress);
        });
    }

    async loadDefaultM3U() {
        // Skip auto-loading for now, let user load manually
        this.updateStatus('Ready - Load an M3U file to start');
    }

    async handleFileSelect(file) {
        if (!file) return;
        
        this.updateStatus('Loading M3U file...');
        
        // Read file directly using FileReader for better compatibility
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const content = e.target.result;
                this.channels = await this.parser.parseM3U(content);
                this.renderChannels();
                this.updateStatus(`Loaded ${this.channels.length} channels successfully`);
            } catch (error) {
                console.error('Error parsing M3U file:', error);
                this.updateStatus(`Error: ${error.message}`);
                this.showError(`Failed to parse M3U file: ${error.message}`);
            }
        };
        
        reader.onerror = () => {
            this.updateStatus('Error reading file');
            this.showError('Failed to read the selected file');
        };
        
        reader.readAsText(file);
    }

    async loadM3UFile(filePath) {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.showLoadingOverlay();
        
        try {
            // Read file using IPC
            const result = await ipcRenderer.invoke('read-m3u-file', filePath);
            
            if (!result.success) {
                throw new Error(result.error);
            }

            // Parse M3U with progress updates
            this.channels = await this.parser.parseM3U(result.content);
            
            // Render channels
            this.renderChannels();
            
            this.updateStatus(`Loaded ${this.channels.length} channels successfully`);
            
        } catch (error) {
            console.error('Error loading M3U file:', error);
            this.updateStatus(`Error: ${error.message}`);
            this.showError(`Failed to load M3U file: ${error.message}`);
        } finally {
            this.isLoading = false;
            this.hideLoadingOverlay();
        }
    }

    renderChannels() {
        const container = document.getElementById('channels-container');
        container.innerHTML = '';

        this.channels.forEach((channel, index) => {
            const channelElement = this.createChannelElement(channel, index);
            container.appendChild(channelElement);
        });

        this.updateStatus(`Displaying ${this.channels.length} channels`);
    }

    createChannelElement(channel, index) {
        const div = document.createElement('div');
        div.className = 'channel-item';
        div.dataset.index = index;

        // Channel logo
        const logoDiv = document.createElement('div');
        logoDiv.className = 'channel-logo';
        
        if (channel.logo) {
            const img = document.createElement('img');
            img.src = channel.logo;
            img.alt = channel.name;
            img.onerror = () => {
                // Fallback to emoji if logo fails
                logoDiv.innerHTML = this.parser.getChannelEmoji(channel.name);
                logoDiv.className = 'channel-logo channel-logo-emoji';
            };
            logoDiv.appendChild(img);
        } else {
            // Use emoji fallback
            logoDiv.innerHTML = this.parser.getChannelEmoji(channel.name);
            logoDiv.className = 'channel-logo channel-logo-emoji';
        }

        // Channel info
        const infoDiv = document.createElement('div');
        infoDiv.className = 'channel-info';
        
        const nameDiv = document.createElement('div');
        nameDiv.className = 'channel-name';
        nameDiv.textContent = channel.name;
        
        const groupDiv = document.createElement('div');
        groupDiv.className = 'channel-group';
        groupDiv.textContent = channel.group || 'General';
        
        infoDiv.appendChild(nameDiv);
        infoDiv.appendChild(groupDiv);

        div.appendChild(logoDiv);
        div.appendChild(infoDiv);

        // Click handler
        div.addEventListener('click', () => {
            this.playChannel(channel);
        });

        return div;
    }

    async playChannel(channel) {
        if (this.currentChannel === channel) return;
        
        this.currentChannel = channel;
        this.updateStatus(`Loading ${channel.name}...`);
        
        // Clean up previous streams
        this.cleanupStreams();
        
        try {
            // Try different playback methods
            await this.playStreamWithMpegts(channel.url);
        } catch (error) {
            console.error('Stream error:', error);
            this.updateStatus(`Error playing ${channel.name}`);
            this.showError(`Failed to play ${channel.name}: ${error.message}`);
        }
    }

    async playStreamWithMpegts(url) {
        // For now, use simple video element
        // In a full implementation, you'd integrate mpegts.js here
        this.video.src = url;
        this.video.load();
        
        try {
            await this.video.play();
            this.updateStatus(`Playing ${this.currentChannel.name}`);
        } catch (error) {
            throw new Error(`Playback failed: ${error.message}`);
        }
    }

    cleanupStreams() {
        if (this.hls) {
            this.hls.destroy();
            this.hls = null;
        }
        
        if (this.mpegts) {
            this.mpegts.destroy();
            this.mpegts = null;
        }
        
        this.video.src = '';
        this.video.load();
    }

    togglePlayPause() {
        if (this.video.paused) {
            this.video.play();
        } else {
            this.video.pause();
        }
    }

    stopStream() {
        this.cleanupStreams();
        this.currentChannel = null;
        this.updateStatus('Stream stopped');
    }

    toggleFullscreen() {
        if (this.video.requestFullscreen) {
            this.video.requestFullscreen();
        }
    }

    filterChannels(searchTerm) {
        const channels = document.querySelectorAll('.channel-item');
        const term = searchTerm.toLowerCase();
        
        channels.forEach(channel => {
            const name = channel.querySelector('.channel-name').textContent.toLowerCase();
            const group = channel.querySelector('.channel-group').textContent.toLowerCase();
            
            if (name.includes(term) || group.includes(term)) {
                channel.style.display = 'flex';
            } else {
                channel.style.display = 'none';
            }
        });
    }

    updateStatus(message) {
        document.getElementById('status').textContent = message;
        console.log(`[${new Date().toLocaleTimeString()}] ${message}`);
    }

    updateProgress(progress) {
        const progressBar = document.getElementById('progress-bar');
        const progressText = document.getElementById('progress-text');
        
        if (progressBar && progressText) {
            progressBar.style.width = `${progress.progress}%`;
            progressText.textContent = `Loading... ${progress.progress}% (${progress.channelsFound} channels found)`;
        }
    }

    showLoadingOverlay() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.style.display = 'flex';
        }
    }

    hideLoadingOverlay() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    showError(message) {
        const errorDiv = document.getElementById('error-message');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
            
            setTimeout(() => {
                errorDiv.style.display = 'none';
            }, 5000);
        }
    }

    handleVideoError(event) {
        const error = event.target.error;
        let message = 'Unknown video error';
        
        if (error) {
            switch (error.code) {
                case error.MEDIA_ERR_ABORTED:
                    message = 'Video playback was aborted';
                    break;
                case error.MEDIA_ERR_NETWORK:
                    message = 'Network error occurred';
                    break;
                case error.MEDIA_ERR_DECODE:
                    message = 'Video decoding error';
                    break;
                case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                    message = 'Video format not supported';
                    break;
            }
        }
        
        this.updateStatus(`Video Error: ${message}`);
        this.showError(message);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.iptvApp = new IPTVApp();
});