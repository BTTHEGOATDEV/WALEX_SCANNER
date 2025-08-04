# CyberScan Python nmap Scanner - Production Deployment Guide

This guide provides comprehensive instructions for deploying the real Python nmap scanner backend that integrates with your CyberScan application.

## 🚀 Quick Start

The Python scanner service performs real network security scans using nmap and reports results back to your Supabase database via edge functions.

### Prerequisites

- Docker installed on your system
- A hosting platform account (Railway, Render, DigitalOcean, etc.)
- Access to your Supabase project secrets

## 📋 Local Development Setup

### 1. Test Locally with Docker

```bash
# Clone or navigate to your project
cd python-scanner

# Build the Docker image
docker build -t cyberscan-nmap .

# Run locally for testing
docker run -p 8000:8000 cyberscan-nmap

# Test the service
curl http://localhost:8000/health
```

### 2. Test with Real Scan

```bash
# Test scan endpoint (replace with your Supabase callback URL)
curl -X POST http://localhost:8000/scan \
  -H "Content-Type: application/json" \
  -d '{
    "scan_id": "test-123",
    "target": "scanme.nmap.org", 
    "scan_type": "quick",
    "callback_url": "https://your-project.supabase.co/functions/v1/receive-scan-results"
  }'
```

## 🌐 Production Deployment Options

### Option 1: Railway (Recommended - Easy)

Railway offers simple deployment with automatic HTTPS and good performance.

#### Steps:

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**
   ```bash
   railway login
   ```

3. **Deploy from your python-scanner directory**
   ```bash
   cd python-scanner
   railway deploy
   ```

4. **Get your deployment URL**
   - Copy the URL from Railway dashboard (e.g., `https://cyberscan-nmap-production-xxxx.up.railway.app`)

#### Railway Configuration:
- **Runtime**: Docker
- **Port**: 8000 (automatically detected)
- **Environment**: Production
- **Auto-scaling**: Available on paid plans

---

### Option 2: Render (Free Tier Available)

Render offers a free tier perfect for testing and small deployments.

#### Steps:

1. **Push code to GitHub**
   - Create a GitHub repository
   - Push your `python-scanner` directory

2. **Create Render Web Service**
   - Go to [render.com](https://render.com)
   - Connect your GitHub repository
   - Select "Web Service"

3. **Configure Render Service**
   ```yaml
   Name: cyberscan-nmap-scanner
   Environment: Docker
   Branch: main
   Root Directory: python-scanner
   ```

4. **Deploy**
   - Render will build and deploy automatically
   - Get URL from Render dashboard

#### Render Configuration:
- **Free Tier**: 750 hours/month
- **Paid Plans**: Start at $7/month
- **Auto-sleep**: Free tier sleeps after 15 minutes of inactivity

---

### Option 3: DigitalOcean App Platform

Professional hosting with good performance and scaling options.

#### Steps:

1. **Create DigitalOcean Account**
   - Sign up at digitalocean.com

2. **Create App**
   - Go to App Platform
   - Connect GitHub repository
   - Select `python-scanner` directory

3. **Configure App**
   ```yaml
   Name: cyberscan-nmap
   Source: GitHub
   Branch: main
   Dockerfile Path: python-scanner/Dockerfile
   HTTP Port: 8000
   ```

4. **Deploy**
   - DigitalOcean builds and deploys
   - Get app URL from dashboard

#### DigitalOcean Pricing:
- **Basic**: $5/month
- **Professional**: $12/month with scaling
- **Includes**: SSL, CDN, monitoring

---

### Option 4: Google Cloud Run

Serverless option that scales to zero when not in use.

#### Steps:

1. **Install Google Cloud CLI**
   ```bash
   # Install gcloud CLI for your platform
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

2. **Build and Deploy**
   ```bash
   cd python-scanner
   
   # Build container
   gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/cyberscan-nmap
   
   # Deploy to Cloud Run
   gcloud run deploy cyberscan-nmap \
     --image gcr.io/YOUR_PROJECT_ID/cyberscan-nmap \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --port 8000
   ```

3. **Get Service URL**
   - Copy URL from Cloud Run console

#### Cloud Run Benefits:
- **Pay per use**: Only charged when processing requests
- **Auto-scaling**: Scales from 0 to 1000+ instances
- **Managed**: No server maintenance required

---

## 🔧 Supabase Integration Setup

Once your Python scanner is deployed, you need to configure Supabase to use it.

### 1. Add Scanner URL to Supabase Secrets

1. **Go to Supabase Dashboard**
   - Navigate to Settings > Edge Functions
   - Click "Environment Variables"

2. **Add Secret**
   ```
   Secret Name: PYTHON_SCANNER_URL
   Secret Value: https://your-deployed-scanner-url.com
   ```

3. **Save Configuration**

### 2. Test Integration

1. **Go to your CyberScan app**
2. **Launch a scan** from the Scans page  
3. **Monitor results** in the dashboard
4. **Check logs** in Supabase Edge Functions if needed

## 🔍 Monitoring & Troubleshooting

### Health Checks

Each deployment platform provides health monitoring:

```bash
# Check if scanner is healthy
curl https://your-scanner-url.com/health

# Expected response:
{"status": "healthy", "service": "nmap-scanner"}
```

### Common Issues

#### 1. nmap Command Not Found
**Solution**: Ensure Dockerfile installs nmap correctly
```dockerfile
RUN apt-get update && apt-get install -y nmap
```

#### 2. Callback URL Unreachable
**Solution**: Verify Supabase edge function URL is correct
```bash
# Test callback endpoint
curl https://your-project.supabase.co/functions/v1/receive-scan-results
```

#### 3. Permission Denied on Scans
**Solution**: Some cloud providers restrict nmap. Use basic scans or contact support.

### Logs Access

- **Railway**: View logs in Railway dashboard
- **Render**: Check logs in Render service dashboard  
- **DigitalOcean**: Monitor in App Platform console
- **Google Cloud**: Use Cloud Logging

## 🚨 Security Considerations

### 1. Network Security
```bash
# Limit scanning scope
ALLOWED_TARGETS="internal-network.com,test-domain.com"
```

### 2. Rate Limiting
```python
# Add to main.py
from slowapi import Limiter
limiter = Limiter(key_func=get_remote_address)

@app.post("/scan")
@limiter.limit("10/minute")
async def start_scan(...):
```

### 3. Authentication
```python
# Add API key authentication
API_KEY = os.getenv("SCANNER_API_KEY")

@app.middleware("http")
async def verify_api_key(request: Request, call_next):
    if request.url.path == "/scan":
        api_key = request.headers.get("X-API-Key")
        if api_key != API_KEY:
            return Response("Unauthorized", status_code=401)
    return await call_next(request)
```

## 📊 Performance Optimization

### 1. Concurrent Scans
```python
# Increase worker processes
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

### 2. Memory Limits
```yaml
# For Railway
resources:
  limits:
    memory: 1Gi
    cpu: 1000m
```

### 3. Scan Timeouts
```python
# Add timeout to nmap scans
nm.scan(target, arguments=nmap_args, timeout=300)  # 5 minute timeout
```

## 📈 Scaling Considerations

### For High Volume Usage:

1. **Use Multiple Instances**
   - Deploy to multiple regions
   - Load balance scan requests

2. **Queue System**
   - Implement Redis/RabbitMQ for scan queuing
   - Process scans asynchronously

3. **Database Optimization**
   - Index scan results properly
   - Archive old scan data

## 🎯 Next Steps

1. **Deploy** using your preferred platform
2. **Configure** Supabase with your scanner URL
3. **Test** end-to-end scanning workflow
4. **Monitor** performance and logs
5. **Scale** based on usage patterns

## 📞 Support

If you encounter issues:

1. Check the deployment platform's documentation
2. Review Supabase edge function logs
3. Verify network connectivity between services
4. Test with simple targets like `scanme.nmap.org`

## 🔗 Useful Links

- [Railway Documentation](https://docs.railway.app/)
- [Render Documentation](https://render.com/docs)
- [DigitalOcean App Platform](https://docs.digitalocean.com/products/app-platform/)
- [Google Cloud Run](https://cloud.google.com/run/docs)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

---

**Ready to deploy? Choose your platform and follow the steps above!**