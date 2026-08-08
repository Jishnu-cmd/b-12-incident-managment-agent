from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
import sys
import os

# Add mcp-server directory to sys.path
mcp_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "mcp-server"))
if mcp_dir not in sys.path:
    sys.path.insert(0, mcp_dir)

from remediation.scripts.executor import remediation_executor
from tools import MCPTools

router = APIRouter(prefix="/tools", tags=["MCP Tool Execution Sandbox"])

class ToolExecuteRequest(BaseModel):
    tool_name: str
    target_service: str = "Payment API"
    user_role: str = "Engineer"
    params: Optional[Dict[str, Any]] = None

@router.get("")
def list_available_tools():
    """List all registered MCP remediation tools and safety policies."""
    return [
        {
            "tool_name": "restart_service",
            "display_name": "Restart Service Daemon",
            "description": "Gracefully restarts application background worker processes and reloads reverse proxy configuration.",
            "risk_level": "Low",
            "allowed_roles": ["Admin", "Incident Manager", "Engineer", "Service Desk"],
            "default_service": "Payment API"
        },
        {
            "tool_name": "clear_cache",
            "display_name": "Flush Cache & Reset Pool",
            "description": "Purges idle connection handles, flushes RAM cache buffers, and expands connection pool limit.",
            "risk_level": "Medium",
            "allowed_roles": ["Admin", "Incident Manager", "Engineer"],
            "default_service": "PostgreSQL Production Cluster"
        },
        {
            "tool_name": "scale_container",
            "display_name": "Scale Container Replicas",
            "description": "Scales Kubernetes pod deployment replicas to absorb traffic bursts and allocate extra memory.",
            "risk_level": "Medium",
            "allowed_roles": ["Admin", "Incident Manager", "Engineer"],
            "default_service": "Inventory Microservice"
        },
        {
            "tool_name": "verify_health",
            "display_name": "Health Verification Diagnostic",
            "description": "Runs synthetic HTTP ping tests, SLA latency checks, and error rate verification.",
            "risk_level": "Low",
            "allowed_roles": ["Admin", "Incident Manager", "Engineer", "Service Desk", "Viewer"],
            "default_service": "Payment API"
        },
        {
            "tool_name": "get_logs",
            "display_name": "Fetch Live Log Stream",
            "description": "Retrieves server and application log lines filtered by service name.",
            "risk_level": "Low",
            "allowed_roles": ["Admin", "Incident Manager", "Engineer", "Service Desk", "Viewer"],
            "default_service": "Payment API"
        },
        {
            "tool_name": "get_metrics",
            "display_name": "Prometheus Metrics Sampler",
            "description": "Samples live CPU, Memory, Disk, Latency, and Error Rate metrics.",
            "risk_level": "Low",
            "allowed_roles": ["Admin", "Incident Manager", "Engineer", "Service Desk", "Viewer"],
            "default_service": "Payment API"
        }
    ]

@router.post("/execute")
def execute_tool(payload: ToolExecuteRequest):
    """Execute target MCP tool in safe sandbox environment."""
    if payload.tool_name in ["get_logs", "get_metrics"]:
        if payload.tool_name == "get_logs":
            res = MCPTools.get_logs(payload.target_service)
        else:
            res = MCPTools.get_metrics(payload.target_service)
        return {
            "status": "SUCCESS",
            "tool_name": payload.tool_name,
            "target_service": payload.target_service,
            "output": f"Executed tool {payload.tool_name} successfully.\nResult: {res}"
        }

    exec_res = remediation_executor.execute_remediation(
        tool_name=payload.tool_name,
        target_service=payload.target_service,
        user_role=payload.user_role
    )
    return exec_res
