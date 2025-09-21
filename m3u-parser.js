// M3U Parser with progress updates
class M3UParser {
    constructor() {
        this.channels = [];
        this.currentProgress = 0;
        this.totalLines = 0;
        this.onProgress = null;
    }

    setProgressCallback(callback) {
        this.onProgress = callback;
    }

    async parseM3U(content) {
        this.channels = [];
        this.currentProgress = 0;
        
        const lines = content.split('\n');
        this.totalLines = lines.length;
        
        let currentChannel = null;
        let processedLines = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (line.startsWith('#EXTINF:')) {
                currentChannel = this.parseExtInf(line);
            } else if (line && !line.startsWith('#') && currentChannel) {
                currentChannel.url = line;
                this.channels.push(currentChannel);
                currentChannel = null;
            }

            processedLines++;
            
            // Update progress every 10 lines to keep UI responsive
            if (processedLines % 10 === 0 || i === lines.length - 1) {
                this.currentProgress = Math.round((processedLines / this.totalLines) * 100);
                if (this.onProgress) {
                    this.onProgress({
                        progress: this.currentProgress,
                        channelsFound: this.channels.length,
                        currentLine: i + 1,
                        totalLines: this.totalLines
                    });
                }
                
                // Allow UI to update
                await new Promise(resolve => setTimeout(resolve, 1));
            }
        }

        return this.channels;
    }

    parseExtInf(line) {
        const channel = {
            name: '',
            logo: '',
            group: '',
            id: '',
            url: ''
        };

        // Extract tvg-name
        const nameMatch = line.match(/tvg-name="([^"]*)"/);
        if (nameMatch) {
            channel.name = nameMatch[1];
        }

        // Extract tvg-logo
        const logoMatch = line.match(/tvg-logo="([^"]*)"/);
        if (logoMatch) {
            channel.logo = logoMatch[1];
        }

        // Extract group-title
        const groupMatch = line.match(/group-title="([^"]*)"/);
        if (groupMatch) {
            channel.group = groupMatch[1];
        }

        // Extract tvg-id
        const idMatch = line.match(/tvg-id="([^"]*)"/);
        if (idMatch) {
            channel.id = idMatch[1];
        }

        // If no tvg-name, try to extract from the end of the line
        if (!channel.name) {
            const parts = line.split(',');
            if (parts.length > 1) {
                channel.name = parts[parts.length - 1].trim();
            }
        }

        return channel;
    }

    getChannelEmoji(channelName) {
        const name = channelName.toLowerCase();
        
        // BBC channels
        if (name.includes('bbc')) {
            if (name.includes('bbc 1') || name.includes('bbc1')) return '🔴';
            if (name.includes('bbc 2') || name.includes('bbc2')) return '🟠';
            if (name.includes('bbc 3') || name.includes('bbc3')) return '🟡';
            if (name.includes('bbc 4') || name.includes('bbc4')) return '🟢';
            if (name.includes('cbbc')) return '🟣';
            if (name.includes('cbeebies')) return '🟤';
            return '🔴';
        }
        
        // ITV channels
        if (name.includes('itv')) {
            if (name.includes('itv 1') || name.includes('itv1')) return '🟠';
            if (name.includes('itv 2') || name.includes('itv2')) return '🟡';
            if (name.includes('itv 3') || name.includes('itv3')) return '🟢';
            if (name.includes('itv 4') || name.includes('itv4')) return '🔵';
            return '🟠';
        }
        
        // Channel 4
        if (name.includes('channel 4') || name.includes('channel4')) return '🟢';
        
        // Channel 5
        if (name.includes('channel 5') || name.includes('channel5')) return '🔵';
        
        // Sky channels
        if (name.includes('sky')) return '⭐';
        
        // Sports
        if (name.includes('sport')) return '⚽';
        if (name.includes('football')) return '⚽';
        if (name.includes('cricket')) return '🏏';
        if (name.includes('tennis')) return '🎾';
        
        // News
        if (name.includes('news')) return '📰';
        
        // Movies
        if (name.includes('movie')) return '🎬';
        if (name.includes('cinema')) return '🎬';
        
        // Music
        if (name.includes('music')) return '🎵';
        
        // Kids
        if (name.includes('kids') || name.includes('children')) return '👶';
        
        // Default
        return '📺';
    }
}

// Export for use in renderer
module.exports = M3UParser;