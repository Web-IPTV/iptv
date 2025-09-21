// GitHub Pages Configuration
// This file provides default settings for when the app is hosted on GitHub Pages

window.GitHubPagesConfig = {
    // Default M3U file that will be available on GitHub Pages
    defaultM3UFile: 'channels_filtered.m3u',
    
    // Sample playlists available on GitHub Pages
    samplePlaylists: [
        {
            name: 'UK Channels',
            file: 'samples/playlist_uk.m3u8',
            description: 'British television channels including BBC, ITV, Channel 4, and more.'
        },
        {
            name: 'USA Channels', 
            file: 'samples/playlist_usa.m3u8',
            description: 'Popular US television channels and networks.'
        },
        {
            name: 'News Channels',
            file: 'samples/playlist_zz_news_en.m3u8', 
            description: 'International news channels including Sky News, Euronews, France 24, and more.'
        }
    ],
    
    // EPG server will not be available on GitHub Pages
    epgAvailable: false,
    
    // Show GitHub Pages specific message
    showGitHubPagesNotice: true
};
