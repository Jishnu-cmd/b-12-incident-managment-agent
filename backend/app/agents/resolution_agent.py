from typing import Dict, Any
from app.core.config import settings

class ResolutionAgent:
    """
    Resolution & Auto-Healing Agent:
    - Generates step-by-step remediation recommendation
    - Maps remediation to safe pre-approved execution tool
    - Evaluates safety thresholds (Confidence >= 90% -> Auto-heal, 70-89% -> Human Approval, < 70% -> Escalation)
    """

    def generate_resolution(
        self,
        category: str,
        root_cause: str,
        confidence: float
    ) -> Dict[str, Any]:
        
        tool_name = "restart_service"
        action_name = "Restart Application Service & Clear Cache"
        risk_level = "Low"
        recommendation = ""

        if "Connection Pool" in root_cause or category == "Database":
            tool_name = "clear_cache"
            action_name = "Flush Idle DB Connections & Expand Pool"
            risk_level = "Medium"
            recommendation = "1. Flush idle connection pool handlers.\n2. Scale database connection pool limit from 20 to 50.\n3. Verify API endpoint health check."
        elif "Gunicorn" in root_cause or category == "API":
            tool_name = "restart_service"
            action_name = "Restart Gunicorn Application Workers"
            risk_level = "Low"
            recommendation = "1. Gracefully restart background Gunicorn worker processes.\n2. Reload Nginx reverse proxy configuration.\n3. Verify HTTP 200 response rate."
        elif "Memory Leak" in root_cause or category == "Infrastructure":
            tool_name = "scale_container"
            action_name = "Restart Worker Daemon & Scale Memory Limit"
            risk_level = "Medium"
            recommendation = "1. Restart killed process daemon.\n2. Allocate additional 2GB container memory threshold.\n3. Run health verification script."
        else:
            tool_name = "verify_health"
            action_name = "Execute System Diagnostic & Health Verification"
            risk_level = "Low"
            recommendation = "1. Perform diagnostic health check on affected microservices.\n2. Escalate to team for deep code inspection if degradation persists."

        # Safety decision matrix based on configurable confidence thresholds
        if confidence >= settings.AUTO_HEAL_CONFIDENCE_THRESHOLD:
            decision = "AUTO_HEAL_ELIGIBLE"
            approval_status = "AUTO_APPROVED"
            workflow_state = "REMEDIATION_RECOMMENDED"
        elif confidence >= settings.HUMAN_APPROVAL_CONFIDENCE_THRESHOLD:
            decision = "HUMAN_APPROVAL_REQUIRED"
            approval_status = "PENDING_APPROVAL"
            workflow_state = "REMEDIATION_RECOMMENDED"
        else:
            decision = "ESCALATE_TO_HUMAN_TEAM"
            approval_status = "NOT_ELIGIBLE"
            workflow_state = "ASSIGNED"

        return {
            "recommendation": recommendation,
            "tool_name": tool_name,
            "action_name": action_name,
            "risk_level": risk_level,
            "decision": decision,
            "approval_status": approval_status,
            "workflow_state": workflow_state
        }

resolution_agent = ResolutionAgent()
