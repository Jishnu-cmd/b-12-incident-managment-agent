from typing import Dict, Any

class MonitoringAgent:
    """
    Monitoring Intelligence Agent:
    Retrieves metrics (CPU, Memory, Disk, Latency, Error Rate, DB Connections) and checks threshold anomalies.
    """
    
    def fetch_metrics_for_service(self, service: str, category: str) -> Dict[str, Any]:
        if category == "Database":
            metrics = {
                "cpu_utilization_pct": 78.4,
                "memory_utilization_pct": 86.2,
                "disk_usage_pct": 62.1,
                "error_rate_pct": 14.8,
                "latency_p99_ms": 2840,
                "db_connections_active": 98,
                "db_connections_max": 100,
                "status": "CRITICAL"
            }
        elif category == "API" or category == "Application":
            metrics = {
                "cpu_utilization_pct": 91.5,
                "memory_utilization_pct": 89.0,
                "disk_usage_pct": 45.0,
                "error_rate_pct": 32.5,
                "latency_p99_ms": 4200,
                "http_5xx_rate_pct": 31.8,
                "status": "DEGRADED"
            }
        elif category == "Infrastructure":
            metrics = {
                "cpu_utilization_pct": 98.7,
                "memory_utilization_pct": 96.4,
                "disk_usage_pct": 94.2,
                "error_rate_pct": 8.5,
                "latency_p99_ms": 1950,
                "status": "CRITICAL"
            }
        else:
            metrics = {
                "cpu_utilization_pct": 45.0,
                "memory_utilization_pct": 52.0,
                "disk_usage_pct": 40.0,
                "error_rate_pct": 5.2,
                "latency_p99_ms": 650,
                "status": "WARNING"
            }
        return metrics

monitoring_agent = MonitoringAgent()
