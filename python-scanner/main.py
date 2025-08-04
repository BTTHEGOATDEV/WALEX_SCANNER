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
        "quick": "-T4 -F --open",  # Fast scan of most common ports, only show open
        "full": "-T4 -A -v --open",  # Aggressive scan with OS detection, only open ports
        "stealth": "-sS -T2 --open",  # SYN stealth scan, only open ports
        "udp": "-sU -T4 --top-ports 1000 --open",  # UDP scan of top 1000 ports
        "vulnerability": "-T4 --script vuln --open",  # Vulnerability scan with scripts
        "ssl": "-T4 --script ssl-enum-ciphers,ssl-cert,ssl-heartbleed,ssl-poodle -p 443,8443",  # SSL/TLS analysis
        "port": "-T4 -p- --open",  # Full port scan
        "domain": "-T4 -sn",  # Host discovery only
        "comprehensive": "-T4 -A -sC -sV --script vuln --open"  # Comprehensive scan
    }
    
    # Combine base scan with subtype
    args = base_args.get(scan_type, "-T4 -F --open")
    
    if scan_subtype:
        if scan_subtype == "port_range":
            if scan_type in ["stealth", "udp", "port"]:
                args += " -p 1-10000"  # Extended port range
        elif scan_subtype == "intense":
            args = args.replace("-T4", "-T5")  # More aggressive timing
        elif scan_subtype == "slow":
            args = args.replace("-T4", "-T2")  # Slower, more stealthy
    
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
    vulnerabilities_found = 0
    
    for host in scan_result.all_hosts():
        hosts_scanned += 1
        host_info = {
            "host": host,
            "hostname": scan_result[host].hostname(),
            "state": scan_result[host].state(),
            "protocols": []
        }
        
        # Process each protocol (TCP, UDP)
        for protocol in scan_result[host].all_protocols():
            protocol_info = {
                "protocol": protocol,
                "ports": []
            }
            
            ports = scan_result[host][protocol].keys()
            for port in sorted(ports):
                port_info = scan_result[host][protocol][port]
                
                # Enhanced severity determination
                severity = determine_port_severity(port, port_info, protocol)
                
                port_data = {
                    "port": port,
                    "state": port_info["state"],
                    "name": port_info.get("name", ""),
                    "product": port_info.get("product", ""),
                    "version": port_info.get("version", ""),
                    "extrainfo": port_info.get("extrainfo", ""),
                    "severity": severity,
                    "risk_level": severity.upper(),
                    "protocol": protocol
                }
                
                protocol_info["ports"].append(port_data)
                
                # Add as finding if open
                if port_info["state"] == "open":
                    finding = {
                        "type": "open_port",
                        "severity": severity,
                        "title": f"Open Port {port}/{protocol}",
                        "description": create_port_description(port, port_info, protocol),
                        "host": host,
                        "port": port,
                        "protocol": protocol,
                        "service": port_info.get("name", ""),
                        "version": port_info.get("version", ""),
                        "product": port_info.get("product", ""),
                        "risk_level": severity.upper(),
                        "recommendation": get_port_recommendation(port, port_info)
                    }
                    findings.append(finding)
                    
                    if severity in ["high", "critical"]:
                        vulnerabilities_found += 1
            
            host_info["protocols"].append(protocol_info)
        
        # Check for OS detection
        if 'osclass' in scan_result[host]:
            for osclass in scan_result[host]['osclass']:
                findings.append({
                    "type": "os_detection",
                    "severity": "info",
                    "title": f"Operating System Detected",
                    "description": f"Detected OS: {osclass.get('osfamily', 'Unknown')} {osclass.get('osgen', '')}",
                    "host": host,
                    "os_family": osclass.get('osfamily', ''),
                    "os_gen": osclass.get('osgen', ''),
                    "accuracy": osclass.get('accuracy', ''),
                    "risk_level": "INFO"
                })
        
        # Check for script results (vulnerabilities)
        if 'hostscript' in scan_result[host]:
            for script in scan_result[host]['hostscript']:
                vuln_finding = parse_script_result(script, host)
                if vuln_finding:
                    findings.append(vuln_finding)
                    if vuln_finding["severity"] in ["high", "critical"]:
                        vulnerabilities_found += 1
    
    # Calculate risk metrics
    total_findings = len(findings)
    risk_score = calculate_risk_score(findings)
    
    return {
        "hosts_scanned": hosts_scanned,
        "findings": findings,
        "findings_count": total_findings,
        "vulnerabilities_found": vulnerabilities_found,
        "risk_score": risk_score,
        "risk_level": get_risk_level(risk_score),
        "scan_stats": {
            "total_hosts": hosts_scanned,
            "up_hosts": len([h for h in scan_result.all_hosts() if scan_result[h].state() == "up"]),
            "down_hosts": len([h for h in scan_result.all_hosts() if scan_result[h].state() == "down"]),
            "open_ports": len([f for f in findings if f["type"] == "open_port"]),
            "vulnerabilities": vulnerabilities_found
        },
        "recommendations": generate_recommendations(findings)
    }

def determine_port_severity(port: int, port_info: dict, protocol: str) -> str:
    """Determine severity based on port, service, and context"""
    service = port_info.get("name", "").lower()
    product = port_info.get("product", "").lower()
    version = port_info.get("version", "").lower()
    
    # Critical severity ports
    critical_ports = {
        21: "FTP - often misconfigured",
        23: "Telnet - unencrypted protocol", 
        135: "RPC - Windows management",
        139: "NetBIOS - file sharing",
        445: "SMB - file sharing vulnerability prone",
        1433: "MSSQL - database access",
        3389: "RDP - remote desktop access"
    }
    
    # High severity ports
    high_ports = {
        22: "SSH - secure but exposed management",
        25: "SMTP - mail server",
        53: "DNS - potential for amplification",
        110: "POP3 - mail access",
        143: "IMAP - mail access", 
        993: "IMAPS - encrypted mail",
        995: "POP3S - encrypted mail"
    }
    
    # Check for critical services
    if port in critical_ports:
        return "critical"
    
    # Check for high risk services
    if port in high_ports:
        return "high"
    
    # Check for known vulnerable products/versions
    if any(vuln in product for vuln in ["apache/2.2", "nginx/1.0", "iis/6.0"]):
        return "high"
    
    # Medium risk for common services
    if port in [80, 443, 8080, 8443]:
        return "medium"
    
    # Default to low for other open ports
    return "low"

def create_port_description(port: int, port_info: dict, protocol: str) -> str:
    """Create detailed description for port finding"""
    service = port_info.get("name", "unknown")
    product = port_info.get("product", "")
    version = port_info.get("version", "")
    
    desc = f"Port {port}/{protocol} is open running {service}"
    if product:
        desc += f" ({product}"
        if version:
            desc += f" {version}"
        desc += ")"
    
    return desc

def get_port_recommendation(port: int, port_info: dict) -> str:
    """Get security recommendation for open port"""
    service = port_info.get("name", "").lower()
    
    recommendations = {
        21: "Consider using SFTP instead of FTP. If FTP is required, use FTPS.",
        22: "Ensure SSH uses key-based authentication and disable password auth.",
        23: "Disable Telnet and use SSH instead for secure remote access.",
        25: "Ensure SMTP uses encryption (STARTTLS) and proper authentication.",
        53: "Ensure DNS is properly configured to prevent amplification attacks.",
        80: "Consider redirecting HTTP traffic to HTTPS for better security.",
        135: "Consider disabling RPC if not required, or restrict access.",
        139: "Disable NetBIOS if not required, or restrict to internal networks.",
        443: "Ensure SSL/TLS is properly configured with strong ciphers.",
        445: "Restrict SMB access to required networks and keep system updated.",
        1433: "Ensure database uses strong authentication and encrypted connections.",
        3389: "Use strong passwords and consider VPN access instead of direct RDP."
    }
    
    return recommendations.get(port, "Review if this service needs to be publicly accessible.")

def parse_script_result(script: dict, host: str) -> Optional[dict]:
    """Parse nmap script results for vulnerabilities"""
    script_id = script.get("id", "")
    output = script.get("output", "")
    
    # Common vulnerability patterns
    if "vuln" in script_id.lower():
        severity = "medium"
        if any(keyword in output.lower() for keyword in ["critical", "high", "rce", "remote code"]):
            severity = "high"
        elif any(keyword in output.lower() for keyword in ["exploit", "vulnerable", "cve"]):
            severity = "medium"
        else:
            severity = "low"
            
        return {
            "type": "vulnerability",
            "severity": severity,
            "title": f"Vulnerability Detected: {script_id}",
            "description": output[:500] + ("..." if len(output) > 500 else ""),
            "host": host,
            "script_id": script_id,
            "risk_level": severity.upper()
        }
    
    return None

def calculate_risk_score(findings: list) -> float:
    """Calculate overall risk score based on findings"""
    score = 0.0
    severity_weights = {
        "critical": 10.0,
        "high": 7.5,
        "medium": 5.0,
        "low": 2.5,
        "info": 1.0,
        "none": 0.0
    }
    
    for finding in findings:
        severity = finding.get("severity", "info")
        score += severity_weights.get(severity, 1.0)
    
    # Normalize score to 0-10 scale
    max_possible = len(findings) * 10.0
    if max_possible > 0:
        normalized_score = min(10.0, (score / max_possible) * 10.0)
    else:
        normalized_score = 0.0
    
    return round(normalized_score, 1)

def get_risk_level(risk_score: float) -> str:
    """Convert risk score to risk level"""
    if risk_score >= 8.0:
        return "critical"
    elif risk_score >= 6.0:
        return "high"
    elif risk_score >= 4.0:
        return "medium"
    elif risk_score >= 2.0:
        return "low"
    else:
        return "minimal"

def generate_recommendations(findings: list) -> list:
    """Generate overall security recommendations"""
    recommendations = []
    
    # Count findings by type and severity
    port_findings = [f for f in findings if f["type"] == "open_port"]
    vuln_findings = [f for f in findings if f["type"] == "vulnerability"]
    critical_findings = [f for f in findings if f["severity"] == "critical"]
    
    if critical_findings:
        recommendations.append({
            "priority": "critical",
            "title": "Address Critical Vulnerabilities Immediately",
            "description": f"Found {len(critical_findings)} critical issues requiring immediate attention."
        })
    
    if len(port_findings) > 10:
        recommendations.append({
            "priority": "high",
            "title": "Reduce Attack Surface",
            "description": f"Found {len(port_findings)} open ports. Consider closing unnecessary services."
        })
    
    if vuln_findings:
        recommendations.append({
            "priority": "medium",
            "title": "Patch Management",
            "description": f"Found {len(vuln_findings)} potential vulnerabilities. Update systems and software."
        })
    
    recommendations.append({
        "priority": "low",
        "title": "Regular Security Monitoring",
        "description": "Schedule regular security scans to monitor for new vulnerabilities."
    })
    
    return recommendations

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