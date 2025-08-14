# 🚀 CyberScan Python Backend Deployment Guide

⚠️ **IMPORTANT HOSTING LIMITATION**: Most cloud platforms (Railway, Render, Heroku) restrict or block nmap port scanning for security reasons. This guide provides both local development setup and alternative production deployment options.

## 📋 Prerequisites

- Python 3.11+ installed
- nmap installed on your system
- For production: VPS or dedicated server (see production options below)
- Your Supabase project details

## 🔧 Local Development Setup

### 1. Prepare Your Python Environment

```bash
# Navigate to your scanner directory
cd python-scanner

# Install dependencies
pip install -r requirements.txt

# Verify nmap is installed
nmap --version
```

### 2. Set Environment Variables

Create a `.env` file in your `python-scanner` directory:

```bash
# .env file
SCANNER_SECRET=your-super-secret-key-here
CALLBACK_URL_DEFAULT=https://sxqguvbqxmdqcwjybekk.supabase.co/functions/v1/receive-scan-results
ALLOWED_ORIGINS=*
```

**Generate your secret key:**
```bash
# Option 1: Python
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Option 2: OpenSSL
openssl rand -base64 32

# Option 3: Online generator
# Visit: https://generate-secret.vercel.app/32
```

### 3. Test Locally

```bash
# Run the scanner
python enhanced_main.py

# You should see:
# 🚀 Starting CyberScan nmap Service v1.3.0
# 📡 Listening on http://0.0.0.0:8000
# 🔒 Secret authentication: ✅ Enabled
# 📞 Callback URL: https://your-callback-url
```

Test the health endpoint:
```bash
curl http://localhost:8000/health
# Should return: {"status":"healthy","service":"nmap-scanner","version":"1.3.0"}
```

## 🌐 Production Deployment Options

⚠️ **Cloud Platform Limitations**: Railway, Render, Heroku, and most PaaS providers restrict nmap for security reasons. Here are viable alternatives:

### Option 1: VPS/Dedicated Server (Recommended for Production)

**DigitalOcean, Linode, AWS EC2, or Google Compute Engine:**

```bash
# SSH into your VPS
ssh user@your-server-ip

# Install dependencies
sudo apt update
sudo apt install python3-pip nmap -y
pip3 install -r requirements.txt

# Create systemd service
sudo nano /etc/systemd/system/cyberscan.service
```

**Service configuration:**
```ini
[Unit]
Description=CyberScan nmap Service
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/python-scanner
Environment=SCANNER_SECRET=your-secret-key
Environment=CALLBACK_URL_DEFAULT=https://sxqguvbqxmdqcwjybekk.supabase.co/functions/v1/receive-scan-results
ExecStart=/usr/bin/python3 enhanced_main.py
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start service
sudo systemctl enable cyberscan
sudo systemctl start cyberscan
sudo systemctl status cyberscan
```

### Option 2: Docker Container on VPS

```bash
# Build and run container
docker build -t cyberscan .
docker run -d -p 8000:8000 \
  -e SCANNER_SECRET=your-secret-key \
  -e CALLBACK_URL_DEFAULT=https://your-callback-url \
  --name cyberscan cyberscan
```

### Option 3: Local Development Only

For testing and development, run locally and use ngrok for external access:

```bash
# Install ngrok
npm install -g ngrok

# Run your Python backend locally
python enhanced_main.py

# In another terminal, expose with ngrok
ngrok http 8000

# Use the ngrok URL as your PYTHON_SCANNER_URL
```

### Option 4: Mock Scanner for Demo

If you just want to demo the UI without real scanning, create a mock version that returns fake data - this can be deployed anywhere.

## 🔗 Connect to Lovable Frontend

### 1. Add Secrets to Supabase

1. **Go to your Supabase project dashboard**
2. **Navigate to Settings > Secrets**
3. **Add these secrets:**

```
PYTHON_SCANNER_URL = https://your-deployed-scanner-url.com
SCANNER_SECRET = your-secret-key-here
```

### 2. Verify Connection

1. **Test the connection:**
```bash
# Replace with your actual URLs and secret
curl -X POST https://your-scanner-url.com/scan \
  -H "Content-Type: application/json" \
  -H "X-Scanner-Secret: your-secret-key" \
  -d '{
    "scan_id": "test-123",
    "target": "scanme.nmap.org",
    "scan_type": "basic",
    "priority": "medium",
    "callback_url": "https://your-supabase-callback-url"
  }'
```

## 🎯 Testing End-to-End

### 1. Run a Test Scan

1. **Go to your Lovable app**
2. **Navigate to /scans**
3. **Click "New Scan"**
4. **Fill in:**
   - Target: `scanme.nmap.org`
   - Scan Type: Domain Scan > Basic Vulnerability Scan
   - Priority: Medium

5. **Click "Start Scan"**

### 2. Monitor Progress

- **Watch the verbose logs in the progress modal**
- **Check your Python backend logs for detailed output**
- **Verify scan results appear in the frontend**

## 📊 Expected Results Display

When a scan completes, you should see:

- **Summary Dashboard:** Risk score, findings count, severity breakdown
- **Detailed Findings:** Open ports, vulnerabilities, recommendations
- **Host Information:** Discovered services, versions, OS detection
- **Security Recommendations:** Actionable security advice

## 🛠️ Troubleshooting

### Common Issues:

1. **404 Error - Scanner not found:**
   - Verify `PYTHON_SCANNER_URL` is correct in Supabase secrets
   - Ensure your Python service is running and accessible

2. **401 Error - Unauthorized:**
   - Check `SCANNER_SECRET` matches in both Python backend and Supabase
   - Verify the secret is being passed in headers

3. **nmap command not found:**
   - Install nmap on your deployment platform
   - For Docker: Ensure nmap is in your Dockerfile

4. **Callback failures:**
   - Verify `CALLBACK_URL_DEFAULT` points to your Supabase function
   - Check Supabase function logs for errors

### Debugging Commands:

```bash
# Check Python backend logs
railway logs  # Railway
heroku logs --tail  # Heroku

# Test scan endpoint directly
curl https://your-scanner-url.com/scan-types

# Verify nmap installation
nmap --version
```

## 🔒 Security Considerations

1. **Use strong secrets** (32+ characters)
2. **Restrict CORS origins** in production
3. **Implement rate limiting** for high-volume usage
4. **Monitor scan targets** to prevent abuse
5. **Use HTTPS** for all communications

## 🚀 Performance Optimization

For production use:

1. **Increase worker processes:**
```python
uvicorn.run(app, host="0.0.0.0", port=8000, workers=4)
```

2. **Set resource limits** on your cloud platform
3. **Implement scan queuing** for high volume
4. **Cache scan results** to avoid duplicate scans

## 📈 Monitoring

Monitor these metrics:

- Scan completion rate
- Average scan duration
- Error rates
- Resource usage (CPU, memory)
- Active scan count

Your Python backend is now ready to perform real nmap scans and beautifully display results in your Lovable frontend! 🎉