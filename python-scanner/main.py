from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import nmap
import json
import asyncio
import uuid
from typing import Dict, List, Optional
import requests
import os
from datetime import datetime

app = FastAPI(title="CyberScan nmap Service", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store active scans in memory (in production, use Redis or database)
active_scans: Dict[str, dict] = {}

class ScanRequest(BaseModel):
    scan_id: str
    target: str
    scan_type: str
    scan_subtype: Optional[str] = None
    priority: str = "medium"
    callback_url: str  # Supabase edge function URL to report results

class ScanResult(BaseModel):
    scan_id: str
    status: str
    progress: int
    findings: List[dict]
    error_message: Optional[str] = None

def create_nmap_scanner():
    """Create and return an nmap PortScanner instance"""
    return nmap.PortScanner()

def get_nmap_arguments(scan_type: str, scan_subtype: Optional[str] = None) -> str:
    """Generate nmap arguments based on scan type and subtype"""
    base_args = {
        "quick": "-T4 -F",  # Fast scan of most common ports
        "full": "-T4 -A -v",  # Aggressive scan with OS detection
        "stealth": "-sS -T2",  # SYN stealth scan
        "udp": "-sU -T4",  # UDP scan
        "vulnerability": "--script vuln",  # Vulnerability scan
        "ssl": "--script ssl-enum-ciphers,ssl-cert,ssl-heartbleed"  # SSL/TLS analysis
    }
    
    # Combine base scan with subtype
    args = base_args.get(scan_type, "-T4 -F")
    
    if scan_subtype:
        if scan_subtype == "port_range" and scan_type in ["stealth", "udp"]:
            args += " -p 1-1000"  # Custom port range
    
    return args

async def update_scan_progress(scan_id: str, progress: int, status: str = "running"):
    """Update scan progress in Supabase via callback"""
    if scan_id in active_scans:
        active_scans[scan_id].update({
            "progress": progress,
            "status": status,
            "updated_at": datetime.utcnow().isoformat()
        })

async def report_scan_results(scan_id: str, results: dict):
    """Send scan results back to Supabase edge function"""
    try:
        callback_url = active_scans[scan_id]["callback_url"]
        
        # Format results for Supabase
        formatted_results = {
            "scan_id": scan_id,
            "status": "completed",
            "progress": 100,
            "results": results,
            "completed_at": datetime.utcnow().isoformat()
        }
        
        # Send results to callback URL
        response = requests.post(
            callback_url,
            json=formatted_results,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            print(f"Successfully reported results for scan {scan_id}")
        else:
            print(f"Failed to report results for scan {scan_id}: {response.status_code}")
            
    except Exception as e:
        print(f"Error reporting results for scan {scan_id}: {str(e)}")

def parse_nmap_results(scan_result) -> dict:
    """Parse nmap scan results into structured format"""
    findings = []
    hosts_scanned = 0
    
    for host in scan_result.all_hosts():
        hosts_scanned += 1
        host_info = {
            "host": host,
            "hostname": scan_result[host].hostname(),
            "state": scan_result[host].state(),
            "protocols": []
        }
        
        for protocol in scan_result[host].all_protocols():
            protocol_info = {
                "protocol": protocol,
                "ports": []
            }
            
            ports = scan_result[host][protocol].keys()
            for port in sorted(ports):
                port_info = scan_result[host][protocol][port]
                
                # Determine severity based on port state and service
                severity = "info"
                if port_info["state"] == "open":
                    if port in [21, 23, 80, 443, 22, 3389]:  # Common vulnerable ports
                        severity = "medium"
                    if "http" in port_info.get("name", "").lower():
                        severity = "low"
                
                port_data = {
                    "port": port,
                    "state": port_info["state"],
                    "name": port_info.get("name", ""),
                    "product": port_info.get("product", ""),
                    "version": port_info.get("version", ""),
                    "extrainfo": port_info.get("extrainfo", ""),
                    "severity": severity,
                    "risk_level": severity.upper()
                }
                
                protocol_info["ports"].append(port_data)
                
                # Add as finding if open
                if port_info["state"] == "open":
                    findings.append({
                        "type": "open_port",
                        "severity": severity,
                        "title": f"Open Port {port}/{protocol}",
                        "description": f"Port {port} is open running {port_info.get('name', 'unknown')}",
                        "host": host,
                        "port": port,
                        "protocol": protocol,
                        "service": port_info.get("name", ""),
                        "version": port_info.get("version", ""),
                        "risk_level": severity.upper()
                    })
            
            host_info["protocols"].append(protocol_info)
        
        # Check for OS detection
        if 'osclass' in scan_result[host]:
            for osclass in scan_result[host]['osclass']:
                findings.append({
                    "type": "os_detection",
                    "severity": "info",
                    "title": f"Operating System Detected",
                    "description": f"Detected OS: {osclass.get('osfamily', 'Unknown')}",
                    "host": host,
                    "os_family": osclass.get('osfamily', ''),
                    "os_gen": osclass.get('osgen', ''),
                    "accuracy": osclass.get('accuracy', ''),
                    "risk_level": "INFO"
                })
    
    return {
        "hosts_scanned": hosts_scanned,
        "findings": findings,
        "findings_count": len(findings),
        "scan_stats": {
            "total_hosts": hosts_scanned,
            "up_hosts": len([h for h in scan_result.all_hosts() if scan_result[h].state() == "up"]),
            "down_hosts": len([h for h in scan_result.all_hosts() if scan_result[h].state() == "down"])
        }
    }

async def perform_scan(scan_request: ScanRequest):
    """Perform the actual nmap scan"""
    scan_id = scan_request.scan_id
    
    try:
        # Initialize scan
        active_scans[scan_id] = {
            "status": "running",
            "progress": 0,
            "started_at": datetime.utcnow().isoformat(),
            "target": scan_request.target,
            "scan_type": scan_request.scan_type,
            "callback_url": scan_request.callback_url
        }
        
        await update_scan_progress(scan_id, 10, "running")
        
        # Create nmap scanner
        nm = create_nmap_scanner()
        
        # Get scan arguments
        nmap_args = get_nmap_arguments(scan_request.scan_type, scan_request.scan_subtype)
        
        await update_scan_progress(scan_id, 25, "running")
        
        print(f"Starting nmap scan for {scan_request.target} with args: {nmap_args}")
        
        # Perform scan
        scan_result = nm.scan(scan_request.target, arguments=nmap_args)
        
        await update_scan_progress(scan_id, 75, "running")
        
        # Parse results
        parsed_results = parse_nmap_results(nm)
        
        await update_scan_progress(scan_id, 90, "running")
        
        # Report results back to Supabase
        await report_scan_results(scan_id, parsed_results)
        
        await update_scan_progress(scan_id, 100, "completed")
        
        print(f"Scan {scan_id} completed successfully")
        
    except Exception as e:
        error_msg = str(e)
        print(f"Scan {scan_id} failed: {error_msg}")
        
        # Report error
        active_scans[scan_id].update({
            "status": "failed",
            "error_message": error_msg,
            "progress": 0
        })
        
        await report_scan_results(scan_id, {
            "error": error_msg,
            "findings": [],
            "findings_count": 0
        })

@app.post("/scan")
async def start_scan(scan_request: ScanRequest, background_tasks: BackgroundTasks):
    """Start a new nmap scan"""
    try:
        # Validate target
        if not scan_request.target:
            raise HTTPException(status_code=400, detail="Target is required")
        
        # Add scan to background tasks
        background_tasks.add_task(perform_scan, scan_request)
        
        return {
            "status": "started",
            "scan_id": scan_request.scan_id,
            "message": f"Scan started for target: {scan_request.target}"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/scan/{scan_id}/status")
async def get_scan_status(scan_id: str):
    """Get the current status of a scan"""
    if scan_id not in active_scans:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    return active_scans[scan_id]

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "nmap-scanner"}

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "CyberScan nmap Service",
        "version": "1.0.0",
        "status": "running"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)