#!/bin/bash

# IPTV Player - External Access Script
echo "🚀 Starting IPTV Player with External Access..."

# Check if port 8080 is already in use
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 8080 is already in use. Stopping existing server..."
    pkill -f "python3 -m http.server 8080"
    sleep 2
fi

# Start the HTTP server in the background
echo "📡 Starting HTTP server on port 8080..."
python3 -m http.server 8080 &
SERVER_PID=$!

# Wait a moment for server to start
sleep 3

# Get local IP address
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)

echo ""
echo "✅ Server started successfully!"
echo "📱 Local access: http://localhost:8080/web-iptv.html"
echo "🏠 Network access: http://$LOCAL_IP:8080/web-iptv.html"
echo ""

# Ask user if they want to use ngrok
read -p "🌐 Do you want to expose this to the internet using ngrok? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔗 Starting ngrok tunnel..."
    echo "📋 This will create a public URL that anyone can access"
    echo "⚠️  Make sure to stop this when you're done for security"
    echo ""
    
    # Start ngrok
    ngrok http 8080
else
    echo "🔒 Server running locally only"
    echo "💡 To access from other devices on your network, use:"
    echo "   http://$LOCAL_IP:8080/web-iptv.html"
    echo ""
    echo "🛑 Press Ctrl+C to stop the server"
    
    # Wait for user to stop
    wait $SERVER_PID
fi
