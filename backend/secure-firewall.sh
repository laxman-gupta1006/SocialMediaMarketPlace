#!/bin/bash

echo "🔒 Starting firewall & DDoS protection setup..."

# 1. Install UFW and configure basic rules
if ! command -v ufw >/dev/null 2>&1; then
    echo "Installing ufw..."
    sudo apt update
    sudo apt install -y ufw
fi

echo "Resetting UFW and applying default policies..."
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing

# 2. Allow essential ports
echo "Allowing SSH (22), HTTP (80), and HTTPS (443)..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 3. Rate limit SSH to prevent brute force attacks
echo "Rate limiting SSH..."
sudo ufw limit 22/tcp comment "Limit SSH to prevent brute-force"

# 4. Enable UFW logging
echo "Enabling UFW logging..."
sudo ufw logging on

# 5. Enable UFW
echo "Enabling UFW..."
sudo ufw --force enable

# 6. Basic kernel hardening (via sysctl)
echo "Applying basic kernel-level protections..."
cat <<EOF | sudo tee /etc/sysctl.d/99-hardening.conf > /dev/null
# IP Spoofing protection
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.rp_filter = 1

# Ignore broadcast pings
net.ipv4.icmp_echo_ignore_broadcasts = 1

# Ignore bad ICMP errors
net.ipv4.icmp_ignore_bogus_error_responses = 1

# Enable SYN cookies (protects against SYN flood)
net.ipv4.tcp_syncookies = 1

# Log suspicious packets
net.ipv4.conf.all.log_martians = 1
net.ipv4.conf.default.log_martians = 1

# Disable source packet routing
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.conf.default.accept_source_route = 0

# Disable redirects
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.default.accept_redirects = 0
net.ipv6.conf.all.accept_redirects = 0
net.ipv6.conf.default.accept_redirects = 0
EOF

# Reload sysctl
sudo sysctl --system

# 7. IPTables (optional) - Drop excessive connections from same IP
echo "Applying simple DDoS rules via iptables..."
sudo iptables -F

# Drop excessive new TCP connections from same IP (20/sec)
sudo iptables -A INPUT -p tcp --syn -m limit --limit 20/second --limit-burst 40 -j ACCEPT

# Drop ICMP (ping flood)
sudo iptables -A INPUT -p icmp --icmp-type echo-request -m limit --limit 1/second -j ACCEPT

# Save iptables (Ubuntu specific)
sudo apt install -y iptables-persistent
sudo netfilter-persistent save

echo "✅ Firewall and DDoS protections applied!"
