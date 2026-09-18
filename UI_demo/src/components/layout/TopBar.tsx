import React from 'react';
import {
  Save,
  RotateCcw,
  FileCode,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Plus,
  Trash2,
  FolderGit2,
  Search,
  Bell,
} from 'lucide-react';
import { useConfig } from '../../context/ConfigContext';

export const TopBar: React.FC = () => {
  const {
    config,
    isDirty,
    saveConfig,
    discardChanges,
    setJsonConfigDrawerOpen,
    jsonConfigDrawerOpen,
    activeProjectId,
    projectList,
    switchProject,
    setNewProjectModalOpen,
    deleteProject,
  } = useConfig();

  return (
    <header className="h-16 bg-white text-slate-800 border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-40 select-none shadow-xs">
      {/* Left: Global Search Bar */}
      <div className="flex items-center space-x-4 flex-1 max-w-md">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search here..."
            className="w-full bg-slate-50 text-xs text-slate-800 placeholder:text-slate-400 rounded-lg pl-9 pr-4 py-2 border border-slate-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-lime-400/50 focus:border-lime-500 transition-all"
          />
          <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
        </div>
      </div>

      {/* Middle/Right: Project Switcher + Actions + Profile */}
      <div className="flex items-center space-x-3">
        {/* Project Selector Dropdown */}
        <div className="relative group">
          <div className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 text-xs cursor-pointer transition">
            <FolderGit2 size={14} className="text-lime-600" />
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono font-bold text-slate-800">{activeProjectId}</span>
              <span className="text-slate-500 hidden sm:inline text-[11px]">({config.projectName})</span>
            </div>
            <ChevronDown size={13} className="text-slate-400 ml-1" />
          </div>

          {/* Dropdown Menu */}
          <div className="absolute top-full right-0 mt-1.5 w-72 bg-white border border-slate-200 rounded-xl shadow-xl py-1 hidden group-hover:block z-50 animate-fade-in">
            <div className="px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 flex items-center justify-between">
              <span>Connected Projects</span>
              <span className="text-slate-400 font-mono">{projectList.length} total</span>
            </div>

            <div className="max-h-60 overflow-y-auto py-1 divide-y divide-slate-100">
              {projectList.map((p) => {
                const isCurrent = p.id === activeProjectId;
                return (
                  <div
                    key={p.id}
                    onClick={() => switchProject(p.id)}
                    className={`px-3.5 py-2.5 text-xs flex items-center justify-between cursor-pointer transition ${
                      isCurrent
                        ? 'bg-[#edf8c7] text-slate-900 border-l-3 border-[#84cc16]'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="truncate">
                      <div className="font-bold flex items-center gap-1.5">
                        <span className="font-mono">{p.key}</span>
                        <span className="text-[11px] font-normal text-slate-500">({p.name})</span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate font-mono">{p.repo}</div>
                    </div>

                    {projectList.length > 1 && !isCurrent && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete project ${p.id}?`)) {
                            deleteProject(p.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-500 rounded transition"
                        title="Delete project"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="p-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setNewProjectModalOpen(true)}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-lime-700 hover:text-lime-800 bg-[#edf8c7]/70 hover:bg-[#edf8c7] rounded-lg transition"
              >
                <Plus size={13} />
                <span>Add New Project</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sync Status Pill */}
        <div className="hidden lg:flex items-center">
          {isDirty ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full animate-pulse font-medium">
              <AlertCircle size={12} className="text-amber-600" />
              <span>Unsaved</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full font-medium">
              <CheckCircle2 size={12} className="text-[#84cc16]" />
              <span>Synced</span>
            </span>
          )}
        </div>

        {/* Config Code Drawer */}
        <button
          type="button"
          onClick={() => setJsonConfigDrawerOpen(!jsonConfigDrawerOpen)}
          className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border transition ${
            jsonConfigDrawerOpen
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
          title="Inspect generated runtime JSON configuration"
        >
          <FileCode size={13} />
          <span className="hidden sm:inline">JSON</span>
        </button>

        {/* Discard Button */}
        {isDirty && (
          <button
            type="button"
            onClick={discardChanges}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
          >
            <RotateCcw size={12} />
            <span className="hidden sm:inline">Discard</span>
          </button>
        )}

        {/* Save Button */}
        <button
          type="button"
          onClick={saveConfig}
          disabled={!isDirty}
          className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg transition active:scale-[0.98] ${
            isDirty
              ? 'bg-[#94d320] hover:bg-[#84cc16] text-slate-900 shadow-xs ring-2 ring-lime-400/30 cursor-pointer'
              : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
          }`}
        >
          <Save size={13} />
          <span>Save</span>
        </button>

        {/* Bell Notifications */}
        <div className="h-6 w-px bg-slate-200 mx-1" />
        <button
          type="button"
          className="p-2 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-100 transition relative"
          title="Notifications"
        >
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#84cc16]" />
        </button>
      </div>
    </header>
  );
};
