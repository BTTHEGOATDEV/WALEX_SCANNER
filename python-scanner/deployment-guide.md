# 🚀 CyberScan Python Backend Deployment Guide

This guide walks you through deploying your Python nmap scanner backend and connecting it to your Lovable frontend.

## 📋 Prerequisites

- Python 3.11+ installed
- nmap installed on your system
- A cloud hosting service (Railway, Render, Heroku, etc.)
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

### Option 1: Railway (Recommended)

Railway provides excellent Docker support and is easy to deploy:

1. **Sign up at [Railway.app](https://railway.app)**

2. **Install Railway CLI:**
```bash
npm install -g @railway/cli
railway login
```

3. **Deploy:**
```bash
# In your python-scanner directory
railway new
railway up

# Set environment variables
railway variables set SCANNER_SECRET=your-secret-key
railway variables set CALLBACK_URL_DEFAULT=https://sxqguvbqxmdqcwjybekk.supabase.co/functions/v1/receive-scan-results
```

4. **Get your deployment URL:**
```bash
railway status
# Copy the URL (e.g., https://your-app.railway.app)
```

### Option 2: Render

1. **Connect your GitHub repo to Render**
2. **Create a new Web Service**
3. **Configure:**
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python enhanced_main.py`
   - Environment Variables:
     - `SCANNER_SECRET`: your-secret-key
     - `CALLBACK_URL_DEFAULT`: your-supabase-callback-url

### Option 3: Heroku

1. **Create Heroku app:**
```bash
heroku create your-nmap-scanner
```

2. **Add buildpacks:**
```bash
heroku buildpacks:add heroku/python
heroku buildpacks:add https://github.com/EdwardBetts/heroku-buildpack-nmap.git
```

3. **Set environment variables:**
```bash
heroku config:set SCANNER_SECRET=your-secret-key
heroku config:set CALLBACK_URL_DEFAULT=your-callback-url
```

4. **Deploy:**
```bash
git push heroku main
```

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