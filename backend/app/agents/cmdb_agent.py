from typing import Dict, Any, List

class CMDBAgent:
    """
    CMDB (Configuration Management Database) Agent:
    Retrieves service topology, server node dependencies, upstream/downstream impact paths, and owner details.
    """
    
    def get_topology_for_service(self, service_name: str) -> Dict[str, Any]:
        # Pre-configured CMDB topology mapping
        topologies = {
            "Payment API": {
                "service": "Payment API",
                "environment": "Production",
                "tier": "Tier-1 Mission Critical",
                "owner_team": "Payments Engineering",
                "dependencies": [
                    {"name": "AWS ALB Load Balancer", "type": "Network/Ingress", "status": "Degraded"},
                    {"name": "Payment Service Pods (k8s)", "type": "Compute App Server", "status": "CrashLoopBackOff"},
                    {"name": "PostgreSQL Main DB", "type": "Database Cluster", "status": "Connection Exhaustion"},
                    {"name": "Redis Session Cache", "type": "In-Memory Store", "status": "Healthy"}
                ],
                "downstream_impact": ["Checkout Web App", "Mobile POS Application", "Billing Billing Worker"]
            },
            "Database Cluster": {
                "service": "PostgreSQL Production Cluster",
                "environment": "Production",
                "tier": "Tier-1 Mission Critical",
                "owner_team": "Database Administrators",
                "dependencies": [
                    {"name": "Primary DB Node (pg-db-01)", "type": "Bare Metal Host", "status": "Connections Maxed Out"},
                    {"name": "Replica DB Node (pg-db-02)", "type": "Bare Metal Host", "status": "Replication Lag High"},
                    {"name": "SAN Storage Array", "type": "Storage", "status": "Healthy"}
                ],
                "downstream_impact": ["Payment API", "User Auth API", "Reporting Pipeline"]
            }
        }

        # Default fallback topology
        default_topology = {
            "service": service_name,
            "environment": "Production",
            "tier": "Tier-2 Standard",
            "owner_team": "IT Infrastructure & DevOps",
            "dependencies": [
                {"name": f"{service_name} Host Node", "type": "Virtual Machine", "status": "Warning"},
                {"name": f"{service_name} Backend Store", "type": "Database / Cache", "status": "Investigating"}
            ],
            "downstream_impact": ["Internal Web Portal", "Monitoring Agent"]
        }

        return topologies.get(service_name, default_topology)

cmdb_agent = CMDBAgent()
