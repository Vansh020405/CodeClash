# 🐳 Docker Troubleshooting Guide

## Current Issue

Docker is **installed and running**, but **cannot pull images** from Docker Hub.

**Error**: `failed to copy: httpReadSeeker: failed open: failed to do request: EOF`

This is a common issue with Docker Desktop on Windows.

---

## Quick Fixes (Try in Order)

### Fix 1: Restart Docker Desktop

1. **Right-click** the Docker whale icon in system tray (bottom-right)
2. Click **"Quit Docker Desktop"**
3. Wait 10 seconds
4. **Relaunch Docker Desktop** from Start menu
5. Wait for whale icon to turn green/white (not animated)
6. Try again

### Fix 2: Check Internet Connection

Docker needs internet to download images:

```powershell
# Test connectivity to Docker Hub
ping hub.docker.com
```

If ping fails, check your firewall/proxy settings.

### Fix 3: Configure DNS in Docker Desktop

1. Open **Docker Desktop**
2. Click the **Settings** gear icon (top-right)
3. Go to **Docker Engine**
4. Add this configuration:

```json
{
  "dns": ["8.8.8.8", "8.8.4.4"]
}
```

5. Click **"Apply & Restart"**
6. Try pulling image again

### Fix 4: Disable IPv6 (if enabled)

In Docker Desktop Settings:
1. Go to **Docker Engine**
2. Add: `"ipv6": false`
3. Apply & Restart

### Fix 5: Check WSL 2 Integration (Windows)

1. Docker Desktop → Settings → Resources → **WSL Integration**
2. Enable integration with your default WSL distribution
3. Apply & Restart

---

## Manual Workaround: Use Alpine Python

If Docker Hub is blocked, we can use a lighter alternative:

1. Try pulling a minimal image first:
   ```powershell
   docker pull alpine
   ```

2. If that works, we can modify the judge to use `alpine:latest` instead

---

## Verify Docker is Working

After trying fixes above, test with:

```powershell
# Simple test
docker run alpine echo "Docker works!"

# If that succeeds, try Python
docker pull python:3.10-alpine
docker run python:3.10-alpine python --version
```

---

## Alternative: Offline Mode

If you're in a restricted network:

### Option A: Pre-download Images on Another Computer

1. On a computer with internet, run:
   ```bash
   docker pull python:3.10-slim
   docker save python:3.10-slim > python-image.tar
   ```

2. Transfer `python-image.tar` to your computer

3. Load the image:
   ```powershell
   docker load < python-image.tar
   ```

### Option B: Use Mock Mode (No Docker)

I can create a "mock mode" that simulates code execution without Docker for testing the UI.

---

## After Fixing Docker

Once images successfully download, test the Judge:

1. Refresh: http://localhost:3000/problem/two-sum
2. Click **"Run"**
3. Wait 5-10 seconds
4. Should see: **"✅ Accepted - 3/3 test cases passed"**

---

## Still Not Working?

Check these common issues:

### Antivirus/Firewall
- Temporarily disable antivirus
- Allow Docker Desktop through Windows Firewall

### Proxy/VPN
- If using a proxy, configure it in Docker Desktop:
  - Settings → Resources → Proxies

### Windows Updates
- Ensure Windows is updated (Docker needs recent WSL 2)

### Reinstall Docker Desktop
- Last resort: Uninstall → Reboot → Reinstall

---

## Current Status Check

Run these commands to diagnose:

```powershell
# 1. Docker version
docker version

# 2. Docker info
docker info

# 3. Network test
docker run --rm alpine ping -c 3 8.8.8.8

# 4. List available images
docker images
```

Send me the output if you need help interpreting it.
