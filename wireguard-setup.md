# WireGuard VPN Setup for IPTV Access

## Overview
This setup allows someone in India to connect to your local network and access the IPTV app as if they were on your local network.

## Prerequisites
- Your Mac (server)
- Friend's device in India (client)
- Both need WireGuard installed

## Step 1: Install WireGuard

### On your Mac (Server):
```bash
# Install via Homebrew
brew install wireguard-tools

# Or download from: https://www.wireguard.com/install/
```

### On friend's device (Client):
- **Windows**: Download from https://www.wireguard.com/install/
- **Android**: WireGuard app from Play Store
- **iOS**: WireGuard app from App Store
- **Linux**: `sudo apt install wireguard` or `sudo yum install wireguard-tools`

## Step 2: Generate Keys

### On your Mac:
```bash
# Create WireGuard directory
mkdir -p ~/wireguard-config
cd ~/wireguard-config

# Generate server private key
wg genkey | tee server_private_key | wg pubkey > server_public_key

# Generate client private key
wg genkey | tee client_private_key | wg pubkey > client_public_key

# Display keys
echo "Server Private Key: $(cat server_private_key)"
echo "Server Public Key: $(cat server_public_key)"
echo "Client Private Key: $(cat client_private_key)"
echo "Client Public Key: $(cat client_public_key)"
```

## Step 3: Create Server Configuration

Create `~/wireguard-config/wg0.conf`:
```ini
[Interface]
PrivateKey = YOUR_SERVER_PRIVATE_KEY
Address = 10.0.0.1/24
ListenPort = 51820
PostUp = iptables -A FORWARD -i %i -j ACCEPT; iptables -A FORWARD -o %i -j ACCEPT; iptables -t nat -A POSTROUTING -o en0 -j MASQUERADE
PostDown = iptables -D FORWARD -i %i -j ACCEPT; iptables -D FORWARD -o %i -j ACCEPT; iptables -t nat -D POSTROUTING -o en0 -j MASQUERADE

[Peer]
PublicKey = CLIENT_PUBLIC_KEY
AllowedIPs = 10.0.0.2/32
```

## Step 4: Create Client Configuration

Create `~/wireguard-config/client.conf`:
```ini
[Interface]
PrivateKey = CLIENT_PRIVATE_KEY
Address = 10.0.0.2/24
DNS = 8.8.8.8

[Peer]
PublicKey = SERVER_PUBLIC_KEY
Endpoint = YOUR_EXTERNAL_IP:51820
AllowedIPs = 0.0.0.0/0
PersistentKeepalive = 25
```

## Step 5: Configure Router Port Forwarding

1. Access your router admin panel (usually 192.168.1.1)
2. Go to Port Forwarding settings
3. Add rule:
   - **External Port**: 51820
   - **Internal IP**: 192.168.1.103 (your Mac's IP)
   - **Internal Port**: 51820
   - **Protocol**: UDP

## Step 6: Start WireGuard Server

```bash
# Start WireGuard
sudo wg-quick up wg0

# Check status
sudo wg show

# To stop
sudo wg-quick down wg0
```

## Step 7: Client Connection

Send the `client.conf` file to your friend in India. They can:
1. Import it into their WireGuard app
2. Connect to your VPN
3. Access your IPTV app at: `http://192.168.1.103:8080/web-iptv.html`

## Security Notes
- Keep private keys secure
- Consider using a non-standard port
- Monitor connections regularly
- Use strong passwords for router admin

## Troubleshooting
- Check firewall settings
- Verify port forwarding
- Test with `ping 10.0.0.1` from client
- Check WireGuard logs: `sudo wg show`
