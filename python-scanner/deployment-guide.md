# 🚀 CyberScan Local Development + ngrok Setup

Run your Python nmap scanner locally and expose it to Supabase using ngrok.

## 📋 Prerequisites

- Python 3.11+ installed
- nmap installed on your system
- ngrok account (free tier works fine)
- Your Supabase project details

## 🔧 Local Development Setup

### 1. Install nmap

**Windows:**
```bash
# Download from: https://nmap.org/download.html
# Or using chocolatey:
choco install nmap
```

**macOS:**
```bash
brew install nmap
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install nmap
```

### 2. Install Python Dependencies

```bash
# Navigate to your scanner directory
cd python-scanner

# Install dependencies
pip install -r requirements.txt

# Verify nmap is working
nmap --version
```

### 3. Install and Setup ngrok

```bash
# Install ngrok
npm install -g ngrok

# Sign up at https://ngrok.com and get your auth token
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

## 🚀 Running the Scanner

### 1. Generate Scanner Secret

```bash
# Generate a secure secret key
python -c "import secrets; print(secrets.token_urlsafe(32))"
# Copy the output - you'll need it for both Python and Supabase
```

### 2. Set Environment Variables

**Windows (Command Prompt):**
```cmd
set SCANNER_SECRET=your-generated-secret-key
set CALLBACK_URL_DEFAULT=https://sxqguvbqxmdqcwjybekk.supabase.co/functions/v1/receive-scan-results
```

**Windows (PowerShell):**
```powershell
$env:SCANNER_SECRET="your-generated-secret-key"
$env:CALLBACK_URL_DEFAULT="https://sxqguvbqxmdqcwjybekk.supabase.co/functions/v1/receive-scan-results"
```

**macOS/Linux:**
```bash
export SCANNER_SECRET="your-generated-secret-key"
export CALLBACK_URL_DEFAULT="https://sxqguvbqxmdqcwjybekk.supabase.co/functions/v1/receive-scan-results"
```

### 3. Start the Python Backend

```bash
# Run the enhanced scanner
python enhanced_main.py

# You should see:
# 🚀 Starting CyberScan nmap Service v1.3.0
# 📡 Listening on http://0.0.0.0:8000
# 🔒 Secret authentication: ✅ Enabled
```

### 4. Expose with ngrok

**In a new terminal:**
```bash
# Expose your local server
ngrok http 8000

# You'll see something like:
# Forwarding: https://abc123.ngrok-free.app -> http://localhost:8000
```

**Copy the HTTPS URL** (e.g., `https://abc123.ngrok-free.app`) - this is your `PYTHON_SCANNER_URL`.

## 🔗 Connect to Lovable Frontend

### 1. Add Secrets to Supabase

Since you have Supabase connected, you need to add these secrets:

1. **PYTHON_SCANNER_URL** = `https://your-ngrok-url.ngrok-free.app`
2. **SCANNER_SECRET** = `your-generated-secret-key`

Use the secrets tool to add them securely.

### 2. Test the Connection

```bash
# Test your ngrok URL
curl https://your-ngrok-url.ngrok-free.app/health

# Should return:
# {"status":"healthy","service":"nmap-scanner","version":"1.3.0"}
```

## 🎯 Testing End-to-End

### 1. Run a Test Scan

1. **Go to your Lovable app at /scans**
2. **Click "New Scan"**
3. **Fill in:**
   - Target: `scanme.nmap.org` (safe test target)
   - Scan Type: Domain Scan > Basic Vulnerability Scan
   - Priority: Medium
4. **Click "Start Scan"**

### 2. Monitor Progress

- **Watch verbose logs in the progress modal**
- **Check your Python terminal for detailed nmap output**
- **Verify scan results appear in the frontend**

## 📊 Expected Results

When a scan completes, you should see:
- **Summary Dashboard:** Risk score, findings count, severity breakdown
- **Detailed Findings:** Open ports, vulnerabilities, recommendations  
- **Host Information:** Discovered services, versions, OS detection
- **Security Recommendations:** Actionable security advice

## 🛠️ Troubleshooting

### Common Issues:

1. **ngrok URL changes on restart:**
   - Update `PYTHON_SCANNER_URL` in Supabase secrets
   - Use ngrok paid plan for static URLs

2. **nmap permission errors:**
   - Run as administrator/sudo for advanced scans
   - Some scan types require elevated privileges

3. **Callback failures:**
   - Verify `CALLBACK_URL_DEFAULT` points to your Supabase function
   - Check that ngrok tunnel is active

4. **401 Unauthorized:**
   - Ensure `SCANNER_SECRET` matches in both Python and Supabase

### Debugging Commands:

```bash
# Check if nmap is working
nmap scanme.nmap.org

# Test your local API
curl http://localhost:8000/health

# Test via ngrok
curl https://your-ngrok-url.ngrok-free.app/health

# Check available scan types
curl https://your-ngrok-url.ngrok-free.app/scan-types
```

## 🚀 Quick Start Script

Save this as `start-scanner.sh` (macOS/Linux) or `start-scanner.bat` (Windows):

**start-scanner.sh:**
```bash
#!/bin/bash
export SCANNER_SECRET="your-secret-here"
export CALLBACK_URL_DEFAULT="https://sxqguvbqxmdqcwjybekk.supabase.co/functions/v1/receive-scan-results"
echo "🚀 Starting CyberScan Python Backend..."
python enhanced_main.py
```

**start-scanner.bat:**
```cmd
@echo off
set SCANNER_SECRET=your-secret-here
set CALLBACK_URL_DEFAULT=https://sxqguvbqxmdqcwjybekk.supabase.co/functions/v1/receive-scan-results
echo 🚀 Starting CyberScan Python Backend...
python enhanced_main.py
```

Your local nmap scanner is now ready to perform real scans and display beautiful results in your Lovable frontend! 🎉

## 💡 Pro Tips

- **Keep ngrok running:** Your tunnel stays active as long as ngrok is running
- **Monitor terminal:** Watch both Python and ngrok terminals for logs
- **Test targets:** Use `scanme.nmap.org` for safe testing
- **Restart ngrok:** Get a new URL anytime by restarting ngrok