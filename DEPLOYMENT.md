# Python Scanner Deployment Guide

## Local Development Setup

### 1. Configure Environment Variables

Create a `.env` file in your Python scanner directory:

```bash
# Required - Your ngrok callback URL
CALLBACK_URL_DEFAULT=https://your-ngrok-url.ngrok.io/functions/v1/receive-scan-results

# Required - Scanner secret (must match Supabase secret)
SCANNER_SECRET=your-scanner-secret-here

# Optional - CORS settings
ALLOWED_ORIGINS=*
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Setup ngrok

1. Install ngrok: https://ngrok.com/download
2. Create account and get auth token
3. Start ngrok tunnel:
```bash
ngrok http 8333
```
4. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`) 
5. Update your `.env` file with the callback URL

### 4. Update Supabase Secrets

In your Lovable project, the following secrets should be configured:

1. **PYTHON_SCANNER_URL**: `https://your-ngrok-url.ngrok.io`
2. **SCANNER_SECRET**: Same value as in your Python `.env` file

### 5. Start the Python Scanner

```bash
python enhanced_main.py
```

The scanner will start on `http://127.0.0.1:8333`

### 6. Test the Integration

1. Go to your Lovable app
2. Navigate to the Scans page
3. Create a new scan
4. Watch the scan progress and results

## Production Deployment

### Option 1: VPS/Cloud Server

1. **Deploy to Ubuntu Server:**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python and pip
sudo apt install python3 python3-pip python3-venv -y

# Install nmap
sudo apt install nmap -y

# Create app directory
sudo mkdir /opt/cyberscan
sudo chown $USER:$USER /opt/cyberscan
cd /opt/cyberscan

# Upload your scanner files
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create systemd service
sudo nano /etc/systemd/system/cyberscan.service
```

2. **Systemd Service File:**
```ini
[Unit]
Description=CyberScan Python Scanner
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/opt/cyberscan
Environment=PATH=/opt/cyberscan/venv/bin
ExecStart=/opt/cyberscan/venv/bin/python enhanced_main.py
Restart=always
EnvironmentFile=/opt/cyberscan/.env

[Install]
WantedBy=multi-user.target
```

3. **Start and Enable Service:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable cyberscan
sudo systemctl start cyberscan
sudo systemctl status cyberscan
```

4. **Setup Nginx Reverse Proxy:**
```bash
sudo apt install nginx -y
sudo nano /etc/nginx/sites-available/cyberscan
```

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://127.0.0.1:8333;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/cyberscan /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

5. **Setup SSL with Let's Encrypt:**
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

### Option 2: Docker Deployment

1. **Create Dockerfile:**
```dockerfile
FROM python:3.11-slim

# Install nmap
RUN apt-get update && apt-get install -y nmap && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8333

CMD ["python", "enhanced_main.py"]
```

2. **Create docker-compose.yml:**
```yaml
version: '3.8'
services:
  cyberscan:
    build: .
    ports:
      - "8333:8333"
    environment:
      - CALLBACK_URL_DEFAULT=${CALLBACK_URL_DEFAULT}
      - SCANNER_SECRET=${SCANNER_SECRET}
    restart: unless-stopped
```

3. **Deploy:**
```bash
docker-compose up -d
```

## Security Considerations

### 1. Enable Authentication

In your Python scanner, uncomment the authentication:

```python
def check_secret(x_scanner_secret: Optional[str] = Header(None)):
    if SC_SECRET and x_scanner_secret != SC_SECRET:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return True

# Add back to endpoints:
@app.post("/scan", dependencies=[Depends(check_secret)])
@app.get("/scan/{scan_id}/status", dependencies=[Depends(check_secret)])
```

### 2. Firewall Configuration

```bash
# Allow only necessary ports
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 3. Network Security

- Use HTTPS only in production
- Implement rate limiting
- Use a reverse proxy (nginx/cloudflare)
- Regular security updates

## Monitoring and Logging

### 1. Application Logs

```bash
# View scanner logs
sudo journalctl -u cyberscan -f

# View nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 2. Health Monitoring

Set up monitoring for:
- `/health` endpoint
- System resources (CPU, memory, disk)
- Network connectivity
- SSL certificate expiration

## Troubleshooting

### Common Issues:

1. **Connection Refused**: Check if scanner is running and port is accessible
2. **Timeout Errors**: Increase timeout values in scanner configuration
3. **Permission Errors**: Ensure proper file permissions and user privileges
4. **nmap Not Found**: Install nmap package on the system

### Debug Commands:

```bash
# Test scanner directly
curl -X POST http://localhost:8333/scan \
  -H "Content-Type: application/json" \
  -H "X-Scanner-Secret: your-secret" \
  -d '{"scan_id":"test","target":"scanme.nmap.org","scan_type":"basic","callback_url":"https://your-callback-url"}'

# Check scanner status
curl http://localhost:8333/health

# Test callback URL
curl -X POST https://your-lovable-app.com/functions/v1/receive-scan-results \
  -H "Content-Type: application/json" \
  -d '{"scan_id":"test","status":"completed","progress":100}'
```