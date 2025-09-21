#!/bin/bash

# Quick ngrok tunnel for IPTV Player
echo "🌐 Creating ngrok tunnel for IPTV Player..."

# Check if server is running on port 8080
if ! lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  No server running on port 8080"
    echo "💡 Start the server first with: python3 -m http.server 8080"
    exit 1
fi

echo "✅ Server detected on port 8080"
echo "🔗 Creating public tunnel..."
echo ""
echo "📋 Your IPTV Player will be accessible via the ngrok URL below"
echo "⚠️  Keep this terminal open to maintain the tunnel"
echo "🛑 Press Ctrl+C to stop the tunnel"
echo ""

# Start ngrok tunnel
ngrok http 8080
