# 🐳 Docker Setup Guide for CodeClash

## Current Status
✅ Docker is **installed** (version 29.1.3)  
⚠️ Docker Desktop is **not running**

## Steps to Start Docker

### Windows Instructions:

1. **Launch Docker Desktop**
   - Press `Windows` key
   - Type "Docker Desktop"
   - Click to open
   - Wait for the whale icon 🐳 to appear in the system tray (bottom-right)

2. **Verify Docker is Running**
   ```powershell
   docker ps
   ```
   - If successful, you'll see a table header (even if no containers are running)
   - If it fails, Docker Desktop hasn't fully started yet - wait 30-60 seconds

3. **Common Issues**

   **Issue**: "Docker Desktop is unable to start"
   
   **Solutions**:
   - **Restart Docker Desktop**: Right-click whale icon → Quit Docker Desktop → Relaunch
   - **Enable WSL 2**: Docker Desktop → Settings → General → "Use the WSL 2 based engine" (checked)
   - **Windows Features**: Enable "Virtual Machine Platform" and "Windows Subsystem for Linux"
     ```powershell
     # Run as Administrator
     dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
     dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
     ```
   - **Restart Computer**: Sometimes required after enabling features

4. **Test Docker**
   ```powershell
   docker run hello-world
   ```
   - This will download and run a test container
   - If successful, Docker is working!

## After Docker Starts

### Test the Judge Engine:

1. **Ensure Backend is Running**
   ```powershell
   cd backend
   .\venv\Scripts\python manage.py runserver
   ```

2. **Ensure Frontend is Running**
   ```powershell
   cd frontend
   npm run dev
   ```

3. **Test in Browser**
   - Go to: http://localhost:3000/problem/two-sum
   - The code editor should show working Python code
   - Click **"Run"** button
   - Wait 5-10 seconds
   - You should see: **"✅ Accepted - 3/3 test cases passed"**

## Expected Docker Images

The judge will automatically pull these images on first run:
- `python:3.10-slim` (~120MB)
- `gcc:11` (~1.2GB) - for C/C++
- `openjdk:17-slim` (~450MB) - for Java

First execution will be slower (~30-60 seconds) due to image downloads.

## Troubleshooting

### Docker Not Starting
- Check if Hyper-V is enabled (Windows Pro/Enterprise)
- Or ensure WSL 2 is installed (Windows Home)
- Try running Docker Desktop as Administrator

### Still Not Working?
1. Open Docker Desktop
2. Go to Settings → Resources
3. Increase CPU/Memory if needed (minimum: 2 CPU, 4GB RAM)
4. Click "Apply & Restart"

### Permission Errors
If you see "permission denied" when running docker commands:
- Add your user to the "docker-users" group (Windows Security → Local Users and Groups)
- Log out and back in

---

## Quick Status Check

Run these commands to verify everything:

```powershell
# 1. Docker version
docker --version

# 2. Docker daemon running
docker ps

# 3. Python available
python --version

# 4. Backend dependencies
cd backend
.\venv\Scripts\pip list | Select-String docker

# 5. Test simple container
docker run --rm hello-world
```

If all pass, you're ready to test the Judge Engine! 🚀
