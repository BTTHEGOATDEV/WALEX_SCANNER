# Python nmap scanner fine-tuned configuration for the 6 free scan types

SCAN_CONFIGS = {
    "basic": {
        "name": "Basic Vulnerability Scan",
        "description": "Top 1000 ports with vulnerability scripts",
        "args": "-sS -sV --top-ports 1000 --script vulners,vulscan,http-enum,http-title,http-headers,http-server-header,http-methods,http-vuln*",
        "timeout": "180s"
    },
    "tcp": {
        "name": "TCP Port Range Check", 
        "description": "Full TCP port range scan",
        "args": "-p 1-65535 -T4 -sS -sV",
        "timeout": "300s"
    },
    "full": {
        "name": "Full Vulnerability Scan",
        "description": "All TCP ports with vulnerability scripts", 
        "args": "-sS -sV -p 1-65535 --script vulners,vulscan,http-enum,http-title,http-headers,http-server-header,http-methods,http-vuln*",
        "timeout": "600s"
    },
    "udp": {
        "name": "UDP Port Scan",
        "description": "Top 200 UDP ports scan",
        "args": "-sU --top-ports 200 -sV",
        "timeout": "240s"
    },
    "stealth": {
        "name": "Stealth Port Scan", 
        "description": "Fast stealth scan without version detection",
        "args": "-sS --top-ports 1000 -T3 -Pn",
        "timeout": "120s"
    },
    "deep": {
        "name": "Deep Pentest Scan",
        "description": "Aggressive scan with all vulnerability scripts",
        "args": "-A -p 1-65535 -sS -sV --script vulners,vulscan,http-enum,http-title,http-headers,http-server-header,http-methods,http-vuln*",
        "timeout": "900s"
    }
}

def get_nmap_arguments(scan_type: str, scan_subtype: str = None) -> str:
    """Get nmap arguments for the specified scan type"""
    config = SCAN_CONFIGS.get(scan_type)
    if not config:
        raise ValueError(f"Invalid scan_type '{scan_type}'. Valid types: {', '.join(SCAN_CONFIGS.keys())}")
    
    args = config["args"]
    
    # Add timeout if specified
    if config.get("timeout"):
        args += f" --host-timeout {config['timeout']} --max-retries 2"
    
    # Add port range modifier for subtype if applicable
    if scan_subtype == "port_range" and scan_type in ["stealth", "udp"]:
        args += " -p 1-1000"
    
    # Add OS detection for full/deep scans if running as root
    if scan_type in ["full", "deep"]:
        try:
            import os
            if hasattr(os, "geteuid") and os.geteuid() == 0:
                args += " -O"
        except:
            pass
    
    return args

def get_scan_info(scan_type: str) -> dict:
    """Get scan configuration info"""
    return SCAN_CONFIGS.get(scan_type, {})