import React from 'react';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { ToastContainer } from './Toast';
import { NewProjectModal } from './NewProjectModal';
import { useConfig } from '../../context/ConfigContext';
import { X, Copy, Check, Download } from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { jsonConfigDrawerOpen, setJsonConfigDrawerOpen, config, showToast } = useConfig();
  const [copied, setCopied] = React.useState(false);

  const jsonString = JSON.stringify(config, null, 2);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    showToast('info', 'Copied to Clipboard', 'Full runtime JSON config copied.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `astra-config-${config.projectName}-${config.environment}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', 'Config Downloaded', 'Exported JSON file.');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <TopBar />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-5xl mx-auto space-y-6">{children}</div>
        </main>

        {/* JSON Code Inspector Drawer */}
        {jsonConfigDrawerOpen && (
          <aside className="w-96 bg-slate-900 border-l border-slate-800 text-slate-200 flex flex-col z-30 shadow-2xl animate-fade-in">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Generated Runtime JSON
                </h3>
                <p className="text-[11px] text-slate-400">Live reflection of reactive state</p>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
                  title="Copy JSON"
                >
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
                  title="Download JSON file"
                >
                  <Download size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setJsonConfigDrawerOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
                  title="Close Drawer"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto bg-[#0a0f1d] font-mono text-[11px] leading-relaxed text-emerald-400">
              <pre>{jsonString}</pre>
            </div>
          </aside>
        )}
      </div>

      <NewProjectModal />
      <ToastContainer />
    </div>
  );
};
