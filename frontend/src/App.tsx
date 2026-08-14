import { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { RightSidebar } from './components/RightSidebar';
import { Dashboard } from './pages/Dashboard';
import { IncidentDetail } from './pages/IncidentDetail';
import { CopilotChat } from './pages/CopilotChat';
import { KnowledgeBaseAdmin } from './pages/KnowledgeBaseAdmin';
import { EvaluationSuite } from './pages/EvaluationSuite';
import { ToolSandbox } from './pages/ToolSandbox';
import { Login } from './pages/Login';
import { CreateIncidentModal } from './components/CreateIncidentModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import type { Incident } from './types';

function MainApp() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center text-cyan-400 font-mono text-sm space-x-3">
        <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <span>Authenticating AetherPay Command Center Session...</span>
      </div>
    );
  }

  // Protected View: If not authenticated, render Login Screen
  if (!user) {
    return <Login />;
  }

  const handleSelectIncident = (id: string) => {
    setSelectedIncidentId(id);
  };

  const handleBackToDashboard = () => {
    setSelectedIncidentId(null);
  };

  const handleIncidentCreated = (newIncident: Incident) => {
    setSelectedIncidentId(newIncident.id);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Top Header Navbar */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'dashboard' && tab !== 'incidents') setSelectedIncidentId(null);
        }}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
      />

      {/* Main 3-Column Grid Layout */}
      <div className="flex-1 max-w-[1700px] w-full mx-auto flex items-start">
        
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            if (tab !== 'dashboard' && tab !== 'incidents') setSelectedIncidentId(null);
          }}
          incidentCount={5}
        />

        {/* Center Main Content Area */}
        <main className="flex-1 min-w-0 p-4 lg:p-6 overflow-y-auto">
          {selectedIncidentId ? (
            <IncidentDetail
              incidentId={selectedIncidentId}
              onBack={handleBackToDashboard}
            />
          ) : (
            <>
              {(activeTab === 'dashboard' || activeTab === 'incidents') && (
                <Dashboard
                  onSelectIncident={handleSelectIncident}
                  onOpenCreateModal={() => setIsCreateModalOpen(true)}
                  onNavigateTab={(tab) => {
                    setActiveTab(tab);
                    setSelectedIncidentId(null);
                  }}
                />
              )}

              {activeTab === 'copilot' && (
                <CopilotChat selectedIncidentId={selectedIncidentId || undefined} />
              )}

              {activeTab === 'knowledge' && (
                <KnowledgeBaseAdmin />
              )}

              {activeTab === 'sandbox' && (
                <ToolSandbox />
              )}

              {activeTab === 'evaluation' && (
                <EvaluationSuite />
              )}
            </>
          )}
        </main>

        {/* Right Sidebar */}
        <RightSidebar
          onSelectIncident={handleSelectIncident}
          onNavigateTab={(tab) => {
            setActiveTab(tab);
            setSelectedIncidentId(null);
          }}
        />

      </div>

      {/* Ingest Modal */}
      <CreateIncidentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleIncidentCreated}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900/80 py-4 text-center text-xs text-slate-500 glass-panel mt-auto">
        <div className="max-w-[1700px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            AetherPay Global Inc. • AI Incident Response Command Center
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            Department of CSE (AI & ML) • Batch CSM-C12 • Guide: Mrs. V. Asha Jyothi
          </div>
        </div>
      </footer>

    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
