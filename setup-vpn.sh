#!/bin/bash

# VPN Setup Script for IPTV Access
# This script helps set up Tailscale for secure remote access

echo "🔐 Setting up VPN for IPTV remote access..."
echo ""

# Check if Tailscale is installed
if ! command -v tailscale &> /dev/null; then
    echo "📦 Installing Tailscale..."
    
    # Check if Homebrew is installed
    if command -v brew &> /dev/null; then
        brew install tailscale
    else
        echo "❌ Homebrew not found. Please install Tailscale manually:"
        echo "   Visit: https://tailscale.com/download"
        exit 1
    fi
else
    echo "✅ Tailscale is already installed"
fi

echo ""
echo "🚀 Starting Tailscale..."
sudo tailscale up

echo ""
echo "📋 Next steps:"
echo "1. Your friend in India should:"
echo "   - Install Tailscale on their device"
echo "   - Sign up at https://tailscale.com"
echo "   - Login and connect"
echo ""
echo "2. Once connected, they can access your IPTV app at:"
echo "   http://192.168.1.103:8080/web-iptv.html"
echo ""
echo "3. To find Tailscale IPs, run:"
echo "   tailscale ip -4"
echo "   tailscale status"
echo ""
echo "4. To manage devices, visit:"
echo "   https://login.tailscale.com/admin/machines"
echo ""

# Get current Tailscale IP
TAILSCALE_IP=$(tailscale ip -4 2>/dev/null)
if [ ! -z "$TAILSCALE_IP" ]; then
    echo "🌐 Your Tailscale IP: $TAILSCALE_IP"
    echo "   Alternative access: http://$TAILSCALE_IP:8080/web-iptv.html"
fi

echo ""
echo "✅ Setup complete! Share this information with your friend in India."
