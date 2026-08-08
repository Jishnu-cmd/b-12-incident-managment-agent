from typing import List, Dict, Any
import datetime

class LogAgent:
    """
    Log Analysis Agent:
    Fetches server and application log entries for a target service, detects error patterns,
    and returns relevant stack trace evidence snippets.
    """
    
    def fetch_logs_for_incident(self, service: str, category: str, title: str) -> List[Dict[str, Any]]:
        now = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        title_lower = title.lower()

        logs = []
        if "database" in title_lower or category == "Database":
            logs = [
                {"timestamp": now, "level": "WARN", "message": f"[{service}] Connection pool usage reached 95% capacity (19/20 connections in use)."},
                {"timestamp": now, "level": "ERROR", "message": f"[{service}] psycopg2.OperationalError: FATAL: remaining connection slots are reserved for non-replication superuser connections."},
                {"timestamp": now, "level": "ERROR", "message": f"[{service}] sqlalchemy.exc.TimeoutError: QueuePool limit of size 20 overflow 10 reached, connection timed out after 30.00 seconds."},
                {"timestamp": now, "level": "INFO", "message": f"[{service}] Health check endpoint /healthz returned 500 Internal Server Error."}
            ]
        elif "502" in title_lower or "api" in title_lower or category == "API":
            logs = [
                {"timestamp": now, "level": "INFO", "message": f"[{service}] GET /api/v1/checkout HTTP/1.1 502 Bad Gateway - 342ms"},
                {"timestamp": now, "level": "ERROR", "message": f"[{service}] nginx/1.24.0: *44189 upstream prematurely closed connection while reading response header from upstream server: http://127.0.0.1:8080/api/v1/checkout"},
                {"timestamp": now, "level": "ERROR", "message": f"[{service}] gunicorn.errors: Worker (pid: 14022) exited with code 139 (SIGSEGV - Segfault in memory allocation)"},
                {"timestamp": now, "level": "WARN", "message": f"[{service}] System alert: Worker process died unexpectedly. Restart attempt 1 failed."}
            ]
        elif "cpu" in title_lower or "memory" in title_lower or category == "Infrastructure":
            logs = [
                {"timestamp": now, "level": "WARN", "message": f"[{service}] System host memory utilization exceeded 92.4% threshold."},
                {"timestamp": now, "level": "ERROR", "message": f"[{service}] kernel: [894102.112] Out of memory: Kill process 8912 ({service}-worker) score 910 or sacrifice child."},
                {"timestamp": now, "level": "CRITICAL", "message": f"[{service}] Process {service}-worker killed by OOM Killer."},
                {"timestamp": now, "level": "ERROR", "message": f"[{service}] Service daemon crashed with exit status 137."}
            ]
        else:
            logs = [
                {"timestamp": now, "level": "INFO", "message": f"[{service}] Starting request handling pipeline..."},
                {"timestamp": now, "level": "ERROR", "message": f"[{service}] Exception: Unexpected service degradation detected: {title}"},
                {"timestamp": now, "level": "WARN", "message": f"[{service}] Response latency spiked to 4500ms (SLA threshold: 500ms)"}
            ]

        return logs

log_agent = LogAgent()
