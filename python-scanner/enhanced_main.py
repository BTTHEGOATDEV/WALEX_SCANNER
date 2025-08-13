from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel, field_validator
import os, re, json, nmap, requests, asyncio
from typing import Dict, List, Optional
from datetime import datetime
from nmap_config import get_nmap_arguments, get_scan_info

# Environment config
SC_CALLBACK_DEFAULT = os.getenv("CALLBACK_URL_DEFAULT")
SC_SECRET = os.getenv("SCANNER_SECRET", "")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")

# FastAPI app
app = FastAPI(title="CyberScan nmap Service", version="1.3.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Thread-safe storage
active_scans: Dict[str, dict] = {}
scan_lock = asyncio.Lock()

# Regex to validate target
TARGET_RE = re.compile(r"^[a-zA-Z0-9\.\-:]+$")

class ScanRequest(BaseModel):
    scan_id: str
    target: str
    scan_type: str
    scan_subtype: Optional[str] = None
    priority: str = "medium"
    callback_url: Optional[str] = None

    @field_validator("target")
    @classmethod
    def validate_target(cls, v: str):
        if not TARGET_RE.match(v):
            raise ValueError("Invalid target format")
        return v

def check_secret(x_scanner_secret: Optional[str] = Header(None)):
    if SC_SECRET and x_scanner_secret != SC_SECRET:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return True

def create_nmap_scanner():
    return nmap.PortScanner()

def parse_nmap_results(nm: nmap.PortScanner, scan_type: str) -> dict:
    """Enhanced nmap result parsing with better categorization"""
    findings: List[dict] = []
    hosts_scanned = 0
    hosts_data = []

    for host in nm.all_hosts():
        hosts_scanned += 1
        host_info = {
            "address": host,
            "hostname": nm[host].hostname(),
            "state": nm[host].state(),
            "open_ports": []
        }
        
        for proto in nm[host].all_protocols():
            for port in sorted(nm[host][proto].keys()):
                pi = nm[host][proto][port]
                
                if pi.get("state") == "open":
                    # Enhanced severity calculation
                    sev = determine_port_severity(port, pi.get("name", ""))
                    
                    port_data = {
                        "port": port,
                        "protocol": proto,
                        "state": pi.get("state"),
                        "service": pi.get("name", ""),
                        "product": pi.get("product", ""),
                        "version": pi.get("version", ""),
                        "extrainfo": pi.get("extrainfo", ""),
                        "severity": sev
                    }
                    
                    host_info["open_ports"].append(port_data)
                    
                    findings.append({
                        "type": "open_port",
                        "severity": sev,
                        "title": f"Open Port {port}/{proto}",
                        "description": create_port_description(port, pi),
                        "host": host,
                        "port": port,
                        "protocol": proto,
                        "service": pi.get("name", ""),
                        "version": pi.get("version", ""),
                        "risk_level": sev.upper(),
                        "recommendation": get_port_recommendation(port, pi.get("name", ""))
                    })

        # Add OS detection findings
        if 'osclass' in nm[host]:
            for osclass in nm[host]['osclass']:
                findings.append({
                    "type": "os_detection",
                    "severity": "info",
                    "title": "Operating System Detected",
                    "description": f"Detected OS: {osclass.get('osfamily', 'Unknown')} {osclass.get('osgen', '')}",
                    "host": host,
                    "os_family": osclass.get('osfamily', ''),
                    "os_gen": osclass.get('osgen', ''),
                    "accuracy": osclass.get('accuracy', ''),
                    "risk_level": "INFO"
                })

        # Parse script results for vulnerabilities
        if 'hostscript' in nm[host]:
            for script in nm[host]['hostscript']:
                vuln_finding = parse_script_result(script, host)
                if vuln_finding:
                    findings.append(vuln_finding)

        hosts_data.append(host_info)

    # Calculate overall risk score
    risk_score = calculate_risk_score(findings)
    risk_level = get_risk_level(risk_score)
    
    # Generate high-level recommendations
    recommendations = generate_recommendations(findings, scan_type)

    scan_stats = {
        "total_hosts": hosts_scanned,
        "up_hosts": len([h for h in nm.all_hosts() if nm[h].state() == "up"]),
        "down_hosts": len([h for h in nm.all_hosts() if nm[h].state() == "down"]),
        "total_open_ports": sum(len(h["open_ports"]) for h in hosts_data),
        "scan_type": scan_type,
        "scan_info": get_scan_info(scan_type)
    }

    return {
        "hosts_scanned": hosts_scanned,
        "hosts": hosts_data,
        "findings": findings,
        "findings_count": len(findings),
        "risk_score": risk_score,
        "risk_level": risk_level,
        "recommendations": recommendations,
        "scan_stats": scan_stats,
        "summary": {
            "critical_findings": len([f for f in findings if f["severity"] == "critical"]),
            "high_findings": len([f for f in findings if f["severity"] == "high"]),
            "medium_findings": len([f for f in findings if f["severity"] == "medium"]),
            "low_findings": len([f for f in findings if f["severity"] == "low"]),
            "info_findings": len([f for f in findings if f["severity"] == "info"])
        }
    }

def determine_port_severity(port: int, service: str) -> str:
    """Determine port severity based on common vulnerabilities"""
    critical_ports = [21, 23, 135, 139, 445, 1433, 3389]  # FTP, Telnet, RPC, NetBIOS, SMB, MSSQL, RDP
    high_ports = [22, 80, 443, 3306, 5432, 6379]  # SSH, HTTP, HTTPS, MySQL, PostgreSQL, Redis
    medium_ports = [25, 53, 110, 143, 993, 995]  # SMTP, DNS, POP3, IMAP
    
    if port in critical_ports:
        return "critical"
    elif port in high_ports:
        return "high"
    elif port in medium_ports:
        return "medium"
    else:
        return "low"

def create_port_description(port: int, port_info: dict) -> str:
    """Create a descriptive string for a port finding"""
    service = port_info.get("name", "unknown")
    product = port_info.get("product", "")
    version = port_info.get("version", "")
    
    desc = f"Port {port} is open running {service}"
    if product:
        desc += f" ({product}"
        if version:
            desc += f" {version}"
        desc += ")"
    
    return desc

def get_port_recommendation(port: int, service: str) -> str:
    """Get security recommendations for specific ports"""
    recommendations = {
        21: "Consider using SFTP instead of FTP for secure file transfers",
        22: "Ensure SSH is configured with key-based authentication and disable password auth",
        23: "Telnet is insecure - use SSH instead",
        25: "Secure SMTP with TLS encryption and authentication",
        53: "Ensure DNS server is not open to amplification attacks",
        80: "Consider redirecting HTTP traffic to HTTPS",
        135: "Windows RPC can be exploited - restrict access",
        139: "NetBIOS can expose sensitive information - disable if not needed",
        443: "Ensure HTTPS uses strong ciphers and up-to-date certificates",
        445: "SMB is commonly exploited - ensure latest patches are applied",
        1433: "SQL Server should not be directly accessible from internet",
        3306: "MySQL should be behind a firewall with restricted access",
        3389: "RDP is frequently attacked - use VPN and enable NLA",
        5432: "PostgreSQL should have restricted network access",
        6379: "Redis should not be exposed to internet without authentication"
    }
    
    return recommendations.get(port, "Review if this service needs to be publicly accessible")

def parse_script_result(script: dict, host: str) -> Optional[dict]:
    """Parse nmap script results for vulnerabilities"""
    script_id = script.get("id", "")
    script_output = script.get("output", "")
    
    # Look for common vulnerability indicators
    if "CVE-" in script_output:
        # Extract CVE numbers
        import re
        cves = re.findall(r'CVE-\d{4}-\d+', script_output)
        
        return {
            "type": "vulnerability",
            "severity": "high",
            "title": f"Vulnerability Detected via {script_id}",
            "description": script_output[:200] + ("..." if len(script_output) > 200 else ""),
            "host": host,
            "script": script_id,
            "cves": cves,
            "risk_level": "HIGH"
        }
    
    elif "vulnerable" in script_output.lower():
        return {
            "type": "vulnerability",
            "severity": "medium",
            "title": f"Potential Vulnerability via {script_id}",
            "description": script_output[:200] + ("..." if len(script_output) > 200 else ""),
            "host": host,
            "script": script_id,
            "risk_level": "MEDIUM"
        }
    
    return None

def calculate_risk_score(findings: List[dict]) -> float:
    """Calculate overall risk score based on findings"""
    severity_weights = {
        "critical": 10,
        "high": 7,
        "medium": 4,
        "low": 2,
        "info": 1
    }
    
    total_score = sum(severity_weights.get(f["severity"], 1) for f in findings)
    
    # Normalize to 0-10 scale
    if not findings:
        return 0.0
    
    avg_score = total_score / len(findings)
    return min(avg_score, 10.0)

def get_risk_level(score: float) -> str:
    """Convert numerical risk score to categorical level"""
    if score >= 8:
        return "CRITICAL"
    elif score >= 6:
        return "HIGH"
    elif score >= 4:
        return "MEDIUM"
    elif score >= 2:
        return "LOW"
    else:
        return "INFO"

def generate_recommendations(findings: List[dict], scan_type: str) -> List[str]:
    """Generate high-level security recommendations"""
    recommendations = []
    
    # Count findings by type
    open_ports = [f for f in findings if f["type"] == "open_port"]
    vulnerabilities = [f for f in findings if f["type"] == "vulnerability"]
    
    if open_ports:
        critical_ports = [f for f in open_ports if f["severity"] == "critical"]
        if critical_ports:
            recommendations.append("Close or secure critical ports that don't need to be publicly accessible")
        
        if len(open_ports) > 10:
            recommendations.append("Consider implementing a firewall to reduce attack surface")
    
    if vulnerabilities:
        recommendations.append("Apply security patches for detected vulnerabilities")
        recommendations.append("Implement vulnerability management process")
    
    # Scan-specific recommendations
    if scan_type == "full":
        recommendations.append("Regular comprehensive scanning should be part of security operations")
    elif scan_type == "stealth":
        recommendations.append("Implement intrusion detection to catch stealth scanning attempts")
    
    if not recommendations:
        recommendations.append("Continue regular security assessments to maintain security posture")
    
    return recommendations

def post_callback(callback_url: str, payload: dict):
    try:
        res = requests.post(callback_url, json=payload, headers={"Content-Type": "application/json"}, timeout=30)
        if res.status_code >= 300:
            print(f"[callback] Non-200: {res.status_code} {res.text}")
    except Exception as e:
        print(f"[callback] Error: {e}")

def progress_callback(scan_id: str, status: str, progress: int, callback_url: str):
    post_callback(callback_url, {
        "scan_id": scan_id,
        "status": status,
        "progress": progress,
    })

async def perform_scan(sr: ScanRequest):
    scan_id = sr.scan_id
    cb_url = sr.callback_url or SC_CALLBACK_DEFAULT
    if not cb_url:
        print("No callback URL provided")
        return

    async with scan_lock:
        active_scans[scan_id] = {
            "status": "running",
            "progress": 0,
            "started_at": datetime.utcnow().isoformat(),
            "target": sr.target,
            "scan_type": sr.scan_type,
            "scan_subtype": sr.scan_subtype,
            "callback_url": cb_url,
        }

    progress_callback(scan_id, "running", 10, cb_url)

    nm = create_nmap_scanner()
    try:
        args = get_nmap_arguments(sr.scan_type, sr.scan_subtype)
        print(f"🚀 Starting nmap {scan_id}: target={sr.target} args='{args}'")

        progress_callback(scan_id, "running", 25, cb_url)

        # Run in background thread
        await run_in_threadpool(lambda: nm.scan(sr.target, arguments=args))

        progress_callback(scan_id, "running", 75, cb_url)
        parsed = parse_nmap_results(nm, sr.scan_type)

        progress_callback(scan_id, "running", 90, cb_url)

        result_payload = {
            "scan_id": scan_id,
            "status": "completed",
            "progress": 100,
            "results": parsed,
            "completed_at": datetime.utcnow().isoformat(),
        }
        
        # Print detailed results to console
        print("\n🎯 === SCAN COMPLETED ===")
        print(f"Scan ID: {scan_id}")
        print(f"Target: {sr.target}")
        print(f"Scan Type: {sr.scan_type}")
        print(f"Hosts Scanned: {parsed['hosts_scanned']}")
        print(f"Findings: {parsed['findings_count']}")
        print(f"Risk Level: {parsed['risk_level']}")
        print(f"Risk Score: {parsed['risk_score']:.1f}/10")
        print("=" * 25)
        
        post_callback(cb_url, result_payload)

        async with scan_lock:
            active_scans[scan_id].update({"status": "completed", "progress": 100, "completed_at": result_payload["completed_at"]})

        print(f"✅ Scan {scan_id} completed successfully")

    except Exception as e:
        error_payload = {
            "scan_id": scan_id,
            "status": "failed",
            "progress": 100,
            "error": str(e),
            "completed_at": datetime.utcnow().isoformat(),
        }
        post_callback(cb_url, error_payload)
        async with scan_lock:
            active_scans[scan_id].update({"status": "failed", "progress": 100, "error": str(e), "completed_at": error_payload["completed_at"]})
        print(f"❌ Scan {scan_id} failed: {e}")

@app.post("/scan", dependencies=[Depends(check_secret)])
async def start_scan(sr: ScanRequest, background_tasks: BackgroundTasks):
    if not sr.target or not sr.scan_id:
        raise HTTPException(status_code=400, detail="scan_id and target are required")
    
    # Validate scan type
    scan_info = get_scan_info(sr.scan_type)
    if not scan_info:
        valid_types = ", ".join(["basic", "tcp", "full", "udp", "stealth", "deep"])
        raise HTTPException(status_code=400, detail=f"Invalid scan_type. Valid types: {valid_types}")
    
    background_tasks.add_task(perform_scan, sr)
    return {
        "status": "started", 
        "scan_id": sr.scan_id, 
        "message": f"Scan started for target: {sr.target}",
        "scan_info": scan_info
    }

@app.get("/scan/{scan_id}/status", dependencies=[Depends(check_secret)])
async def get_scan_status(scan_id: str):
    async with scan_lock:
        if scan_id not in active_scans:
            raise HTTPException(status_code=404, detail="Scan not found")
        return active_scans[scan_id]

@app.get("/scan-types")
def get_scan_types():
    """Get available scan types and their configurations"""
    from nmap_config import SCAN_CONFIGS
    return {"scan_types": SCAN_CONFIGS}

@app.get("/health")
def health():
    return {"status": "healthy", "service": "nmap-scanner", "version": "1.3.0"}

@app.get("/")
def root():
    return {"service": "CyberScan nmap Service", "version": "1.3.0", "status": "running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)