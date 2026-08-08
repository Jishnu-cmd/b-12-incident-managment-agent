from typing import Dict, Any
import re

class TriageAgent:
    """
    Triage Agent:
    - Extracts service, symptom, environment entities
    - Classifies category (Application, Network, Database, Cloud, Infrastructure, Security, Storage, Authentication, API)
    - Predicts Impact & Urgency -> Priority (P1, P2, P3, P4)
    - Generates concise AI Summary
    """
    
    def process(self, title: str, description: str, service: str, environment: str) -> Dict[str, Any]:
        text = f"{title} {description}".lower()

        # 1. Classification
        category = "Application"
        if any(w in text for w in ["database", "postgres", "mysql", "sql", "redis", "connection pool", "timeout query"]):
            category = "Database"
        elif any(w in text for w in ["502", "504", "gateway", "proxy", "nginx", "rest api", "http 500", "endpoint"]):
            category = "API"
        elif any(w in text for w in ["packet loss", "dns", "firewall", "router", "subnet", "network", "latency"]):
            category = "Network"
        elif any(w in text for w in ["cpu", "memory", "out of memory", "disk space", "kernel panic", "server crash"]):
            category = "Infrastructure"
        elif any(w in text for w in ["aws", "kubernetes", "pod", "node down", "docker", "cloud"]):
            category = "Cloud"
        elif any(w in text for w in ["auth", "token", "jwt", "unauthorized", "login failure", "iam", "credential"]):
            category = "Authentication"
        elif any(w in text for w in ["unauthorized access", "ddos", "vulnerability", "attack", "security"]):
            category = "Security"

        # 2. Priority & Impact/Urgency matrix
        is_prod = environment.lower() == "production"
        is_down = any(w in text for w in ["down", "crash", "outage", "500", "502", "unavailable", "fail", "exhausted"])
        has_high_users = any(w in text for w in ["all users", "multiple customers", "payment", "critical", "blocking"])

        if is_prod and is_down and has_high_users:
            impact, urgency, priority = "Critical", "Critical", "P1"
        elif is_prod and is_down:
            impact, urgency, priority = "High", "High", "P2"
        elif is_prod or is_down:
            impact, urgency, priority = "Medium", "Medium", "P3"
        else:
            impact, urgency, priority = "Low", "Low", "P4"

        # 3. Target Support Team Assignment
        team_map = {
            "Database": "DBA Team",
            "API": "Application Development Team",
            "Application": "Application Development Team",
            "Network": "Network Operations Center (NOC)",
            "Infrastructure": "Infrastructure Team",
            "Cloud": "DevOps / Cloud Team",
            "Authentication": "IAM & Security Team",
            "Security": "InfoSec Security Team"
        }
        assigned_team = team_map.get(category, "L2 Service Desk")

        # 4. Generate AI Summary
        summary = f"{category} incident affecting {service} [{environment}]. Symptoms indicate {title}. Priority evaluated as {priority} (Impact: {impact}, Urgency: {urgency})."

        return {
            "category": category,
            "impact": impact,
            "urgency": urgency,
            "priority": priority,
            "assigned_team": assigned_team,
            "summary": summary
        }

triage_agent = TriageAgent()
