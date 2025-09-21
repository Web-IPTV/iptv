# Tailscale VPN Setup for IPTV Access

## Overview
Tailscale is the easiest way to create a secure VPN connection. It's built on WireGuard but handles all the complex setup automatically.

## Step 1: Install Tailscale

### On your Mac (Server):
```bash
# Install via Homebrew
brew install tailscale

# Or download from: https://tailscale.com/download
```

### On friend's device (Client):
- **Windows**: Download from https://tailscale.com/download
- **Android**: Tailscale app from Play Store
- **iOS**: Tailscale app from App Store
- **Linux**: Follow instructions at https://tailscale.com/download/linux

## Step 2: Sign Up and Login

1. Go to https://tailscale.com
2. Sign up for a free account
3. Both you and your friend need accounts

## Step 3: Connect Devices

### On your Mac:
```bash
# Start Tailscale
sudo tailscale up

# This will open a browser to authenticate
# Login with your Tailscale account
```

### On friend's device:
1. Install Tailscale app
2. Login with their Tailscale account
3. Connect to your network

## Step 4: Share Access

1. Go to https://login.tailscale.com/admin/machines
2. Find your friend's device
3. Click "..." → "Edit route settings"
4. Enable "Subnet routes" if needed

## Step 5: Access IPTV

Once connected, your friend can access:
- **Your IPTV app**: `http://192.168.1.103:8080/web-iptv.html`
- **Your Mac's Tailscale IP**: `http://100.x.x.x:8080/web-iptv.html`

## Benefits of Tailscale:
- ✅ No router configuration needed
- ✅ Automatic key management
- ✅ Works through firewalls/NAT
- ✅ Free for personal use
- ✅ Easy to manage multiple devices
- ✅ Built-in security

## Finding Tailscale IPs:
```bash
# On your Mac, find Tailscale IPs
tailscale ip -4

# List all devices
tailscale status
```

## Security:
- All traffic is encrypted
- Only devices you approve can connect
- Easy to revoke access anytime
- No need to expose ports on your router
