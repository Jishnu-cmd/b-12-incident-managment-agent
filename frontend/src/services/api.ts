import axios from 'axios';
import type { Incident, KnowledgeDocument, EvaluationMetrics } from '../types';

const API_BASE = 'http://127.0.0.1:8008/api';

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token if present
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('aetherpay_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // Auth API
  login: async (email: string, password: string) => {
    const res = await client.post<{ access_token: string; token_type: string; user: any }>('/auth/login', { email, password });
    return res.data;
  },

  register: async (payload: { name: string; email: string; password: string; role?: string; department?: string }) => {
    const res = await client.post<{ access_token: string; token_type: string; user: any }>('/auth/register', payload);
    return res.data;
  },

  getMe: async () => {
    const res = await client.get<any>('/auth/me');
    return res.data;
  },

  // Incidents CRUD
  getIncidents: async (params?: { status?: string; priority?: string; category?: string; search?: string }) => {
    const res = await client.get<{ incidents: Incident[]; total: number }>('/incidents', { params });
    return res.data;
  },

  getIncidentById: async (id: string) => {
    const res = await client.get<Incident>(`/incidents/${id}`);
    return res.data;
  },

  createIncident: async (payload: { title: string; description: string; service: string; environment?: string; source?: string }) => {
    const res = await client.post<Incident>('/incidents', payload);
    return res.data;
  },

  updateIncident: async (id: string, payload: { title?: string; description?: string; priority?: string; status?: string; assigned_team?: string }) => {
    const res = await client.put<Incident>(`/incidents/${id}`, payload);
    return res.data;
  },

  deleteIncident: async (id: string) => {
    const res = await client.delete<{ status: string; message: string; deleted_id: string }>(`/incidents/${id}`);
    return res.data;
  },

  // Incident Analysis & Solving
  reanalyzeIncident: async (id: string) => {
    const res = await client.post<Incident>(`/incidents/${id}/analyze`);
    return res.data;
  },

  approveRemediation: async (id: string) => {
    const res = await client.post<{ status: string; message: string }>(`/incidents/${id}/remediation/approve`);
    return res.data;
  },

  executeRemediation: async (id: string) => {
    const res = await client.post<{ status: string; incident_status: string; output: string }>(`/incidents/${id}/remediation/execute`);
    return res.data;
  },

  resolveIncident: async (id: string) => {
    const res = await client.post<{ status: string; incident_id: string }>(`/incidents/${id}/resolve`);
    return res.data;
  },

  // Knowledge Base RAG
  getKnowledgeDocuments: async () => {
    const res = await client.get<KnowledgeDocument[]>('/knowledge');
    return res.data;
  },

  addKnowledgeDocument: async (payload: { title: string; content: string; document_type: string; source?: string }) => {
    const res = await client.post<{ status: string; id: number; title: string }>('/knowledge', payload);
    return res.data;
  },

  searchKnowledge: async (query: string, top_k = 3) => {
    const res = await client.post<any[]>('/knowledge/search', { query, top_k });
    return res.data;
  },

  // Copilot Chat
  copilotChat: async (user_message: string, incident_id?: string) => {
    const res = await client.post<{ reply: string; suggested_actions: string[] }>('/copilot/chat', { user_message, incident_id });
    return res.data;
  },

  // Evaluation Metrics
  getEvaluationMetrics: async () => {
    const res = await client.get<EvaluationMetrics>('/evaluation/metrics');
    return res.data;
  },

  runBenchmarkEval: async () => {
    const res = await client.post<any>('/evaluation/run');
    return res.data;
  },

  // Tools Testing Sandbox
  getTools: async () => {
    const res = await client.get<any[]>('/tools');
    return res.data;
  },

  executeTool: async (payload: { tool_name: string; target_service: string; user_role?: string }) => {
    const res = await client.post<{ status: string; output: string }>('/tools/execute', payload);
    return res.data;
  }
};
