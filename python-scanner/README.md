# CyberScan Python nmap Scanner Service

This service provides real Python-based nmap scanning capabilities for the CyberScan application. It uses the python-nmap library to perform actual network scans and reports results back to the Supabase edge functions.

## Features

- **Real nmap scanning** using python-nmap library
- **Multiple scan types**: Quick, Full, Stealth, UDP, Vulnerability, SSL/TLS
- **Asynchronous processing** with background tasks
- **Structured results** with severity assessment
- **Callback integration** with Supabase edge functions
- **Docker support** for easy deployment

## Scan Types

### Quick Scan (`quick`)
- Fast scan of most common ports
- Arguments: `-T4 -F`
- Best for: Initial reconnaissance

### Full Scan (`full`)  
- Comprehensive scan with OS detection
- Arguments: `-T4 -A -v`
- Best for: Detailed analysis

### Stealth Scan (`stealth`)
- SYN stealth scan to avoid detection
- Arguments: `-sS -T2`
- Best for: Covert scanning

### UDP Scan (`udp`)
- UDP port scanning
- Arguments: `-sU -T4`
- Best for: Finding UDP services

### Vulnerability Scan (`vulnerability`)
- NSE vulnerability scripts
- Arguments: `--script vuln`
- Best for: Finding known vulnerabilities

### SSL/TLS Analysis (`ssl`)
- SSL/TLS certificate and cipher analysis
- Arguments: `--script ssl-enum-ciphers,ssl-cert,ssl-heartbleed`
- Best for: SSL security assessment

## Installation

### Docker (Recommended)

```bash
# Build the image
docker build -t cyberscan-nmap .

# Run locally
docker run -p 8000:8000 cyberscan-nmap
```

### Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Install nmap (Ubuntu/Debian)
sudo apt-get install nmap

# Run the service
uvicorn main:app --host 0.0.0.0 --port 8000
```

## Deployment Options

### 1. Railway (Recommended)

1. Install Railway CLI: `npm install -g @railway/cli`
2. Login: `railway login`
3. Create project: `railway new`
4. Deploy: `railway up`
5. Copy the deployment URL

### 2. Render

1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Use the provided Dockerfile
4. Deploy and copy the service URL

### 3. DigitalOcean App Platform

1. Create a new app from GitHub
2. Use the Dockerfile for deployment
3. Set environment variables if needed

### 4. Heroku

1. Create a new app: `heroku create your-app-name`
2. Set container stack: `heroku stack:set container`
3. Deploy: `git push heroku main`

## Configuration

### Environment Variables

- `PORT`: Service port (default: 8000)
- `LOG_LEVEL`: Logging level (default: INFO)

### Supabase Integration

Once deployed, add the service URL as a secret in your Supabase project:

1. Go to Supabase Dashboard > Settings > Edge Functions
2. Add a new secret:
   - Name: `PYTHON_SCANNER_URL`
   - Value: `https://your-deployed-service.domain.com`

## API Endpoints

### POST /scan
Start a new scan

**Request Body:**
```json
{
  "scan_id": "uuid",
  "target": "example.com",
  "scan_type": "quick",
  "scan_subtype": "port_range",
  "priority": "medium",
  "callback_url": "https://your-supabase-url/functions/v1/receive-scan-results"
}
```

**Response:**
```json
{
  "status": "started",
  "scan_id": "uuid",
  "message": "Scan started for target: example.com"
}
```

### GET /scan/{scan_id}/status
Get scan status

**Response:**
```json
{
  "status": "running",
  "progress": 75,
  "started_at": "2024-01-01T12:00:00Z",
  "target": "example.com",
  "scan_type": "quick"
}
```

### GET /health
Health check endpoint

### GET /
Service information

## Security Considerations

1. **Network Isolation**: Deploy in a secure network environment
2. **Rate Limiting**: Implement rate limiting to prevent abuse
3. **Authentication**: Add API key authentication for production
4. **Firewall Rules**: Restrict outbound scanning as needed
5. **Resource Limits**: Set appropriate CPU/memory limits

## Sample Implementation

Here's how the integration works:

1. **User starts scan** in CyberScan UI
2. **Supabase edge function** creates scan record
3. **Edge function calls** Python scanner service
4. **Python service** performs real nmap scan
5. **Results are sent back** to Supabase via callback
6. **UI updates** with real scan results

## Troubleshooting

### Common Issues

1. **nmap not found**: Ensure nmap is installed on the system
2. **Permission denied**: Scanner may need elevated privileges for some scan types
3. **Timeout errors**: Increase scan timeouts for large networks
4. **Callback failures**: Check network connectivity to Supabase

### Debug Mode

Run with debug logging:
```bash
LOG_LEVEL=DEBUG uvicorn main:app --host 0.0.0.0 --port 8000
```

### Testing

Test the service locally:
```bash
curl -X POST http://localhost:8000/scan \
  -H "Content-Type: application/json" \
  -d '{
    "scan_id": "test-123",
    "target": "scanme.nmap.org",
    "scan_type": "quick",
    "callback_url": "http://localhost:8000/test-callback"
  }'
```

## Production Recommendations

1. **Use HTTPS** for all communications
2. **Implement authentication** (API keys, OAuth)
3. **Add monitoring** and alerting
4. **Set up log aggregation**
5. **Use a process manager** (PM2, supervisor)
6. **Configure auto-scaling** based on load
7. **Regular security updates** for nmap and dependencies

## Legal Notice

This scanning service is intended for authorized security testing only. Users are responsible for ensuring they have proper authorization before scanning any networks or systems. Unauthorized scanning may violate laws and regulations.