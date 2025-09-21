# Port Forwarding Setup for External IP Access

## Your Network Information:
- **External IP**: 107.142.214.21
- **Local IP**: 192.168.1.103
- **Port**: 8080

## Router Configuration Steps:

1. **Access Router Admin Panel:**
   - Open browser and go to: http://192.168.1.1 (or http://192.168.0.1)
   - Login with your router credentials

2. **Find Port Forwarding Settings:**
   - Look for "Port Forwarding", "Virtual Server", or "NAT" settings
   - Usually under "Advanced" or "Network" section

3. **Add Port Forwarding Rule:**
   - **Service Name**: IPTV Server
   - **External Port**: 8080
   - **Internal IP**: 192.168.1.103
   - **Internal Port**: 8080
   - **Protocol**: TCP
   - **Status**: Enabled

4. **Save and Apply Changes**

## After Setup:
- Your IPTV app will be accessible at: http://107.142.214.21:8080/web-iptv.html
- Test from external network to verify it works

## Troubleshooting:
- Some ISPs block common ports (80, 8080, 443)
- Try alternative ports: 8081, 9000, 3000
- Check if your ISP uses CGNAT (Carrier Grade NAT)

## Security Considerations:
- Port forwarding exposes your server to the internet
- Consider using a firewall
- Monitor for unauthorized access
- Use HTTPS if possible

## Alternative: Use ngrok (Current Setup)
- Already working: https://britney-undeclaimed-unvauntingly.ngrok-free.app
- No router configuration needed
- More secure and reliable
