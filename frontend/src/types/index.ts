export interface AIAnalysis {
  summary: string;
  classification: string;
  impact: string;
  urgency: string;
  root_cause: string;
  confidence: number;
  recommendation: string;
}

export interface IncidentEvidence {
  id: number;
  source_type: 'LOG' | 'METRIC' | 'CMDB' | 'RAG_DOCUMENT' | 'HISTORICAL_INCIDENT';
  source_reference: string;
  content: string;
  relevance_score: number;
}

export interface RemediationAction {
  id: number;
  action_name: string;
  action_description?: string;
  risk_level: 'Low' | 'Medium' | 'High' | 'Critical';
  approval_status: 'PENDING' | 'PENDING_APPROVAL' | 'AUTO_APPROVED' | 'APPROVED' | 'REJECTED' | 'EXECUTED' | 'VERIFIED' | 'NOT_ELIGIBLE';
  execution_status: 'NOT_STARTED' | 'IN_PROGRESS' | 'SUCCESS' | 'FAILED';
  execution_output?: string;
  executed_at?: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  category?: string;
  severity?: 'Low' | 'Medium' | 'High' | 'Critical';
  priority?: 'P1' | 'P2' | 'P3' | 'P4';
  status: 'NEW' | 'TRIAGED' | 'INVESTIGATING' | 'DIAGNOSED' | 'REMEDIATION_RECOMMENDED' | 'AUTO_HEALING' | 'ASSIGNED' | 'VERIFYING' | 'RESOLVED' | 'CLOSED';
  source: string;
  service: string;
  environment: string;
  assigned_team?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  ai_analysis?: AIAnalysis;
  evidences?: IncidentEvidence[];
  remediations?: RemediationAction[];
}

export interface KnowledgeDocument {
  id: number;
  title: string;
  content: string;
  document_type: string;
  source: string;
  version: string;
  created_at: string;
}

export interface EvaluationMetrics {
  dataset_summary: {
    total_benchmark_incidents: number;
    resolved_incidents: number;
    test_coverage: string;
  };
  performance_comparison: {
    mttr_minutes: {
      manual_baseline: number;
      ai_agent_proposed: number;
      improvement_pct: number;
    };
    classification_accuracy_pct: number;
    priority_prediction_accuracy_pct: number;
    rca_root_cause_accuracy_pct: number;
    recommendation_accuracy_pct: number;
    auto_healing_success_rate_pct: number;
    human_intervention_rate_pct: {
      manual_baseline: number;
      ai_agent_proposed: number;
      reduction_pct: number;
    };
  };
  confusion_matrix_sample: {
    categories: string[];
    matrix: number[][];
  };
}
