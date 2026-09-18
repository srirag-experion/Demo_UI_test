import React, { useState } from 'react';
import { X, Plus, FolderGit2, Shield } from 'lucide-react';
import { useConfig } from '../../context/ConfigContext';
import { FormField } from '../common/FormField';

export const NewProjectModal: React.FC = () => {
  const { newProjectModalOpen, setNewProjectModalOpen, createNewProject } = useConfig();
  const [projectKey, setProjectKey] = useState('');
  const [projectName, setProjectName] = useState('');
  const [orgName, setOrgName] = useState('Astra Global');
  const [repoName, setRepoName] = useState('');

  if (!newProjectModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectKey.trim()) return;
    createNewProject(projectKey, projectName || projectKey.toLowerCase(), orgName, repoName || projectKey.toLowerCase());
    setProjectKey('');
    setProjectName('');
    setRepoName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-blue-600 rounded-lg text-white">
              <FolderGit2 size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold">Register New Client Project</h3>
              <p className="text-[11px] text-slate-400">Provision isolated configuration & pipeline context</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setNewProjectModalOpen(false)}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <FormField
            label="Project Identifier / Ticket Prefix Key"
            description="Used to route tickets (e.g., 'PAY-104' routes to project 'PAY')."
            required
          >
            <input
              type="text"
              placeholder="e.g. PAY, WEB, CORE, AUTH"
              value={projectKey}
              onChange={(e) => setProjectKey(e.target.value.toUpperCase())}
              className="w-full uppercase font-mono font-bold bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              required
            />
          </FormField>

          <FormField label="Project Display Name" required>
            <input
              type="text"
              placeholder="e.g. Payment Microservice"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Organization / Group">
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </FormField>

            <FormField label="GitHub / GitLab Repo">
              <input
                type="text"
                placeholder="e.g. pay-service"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                className="w-full font-mono bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </FormField>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-blue-900 text-[11px] leading-relaxed flex items-start gap-2">
            <Shield size={15} className="text-blue-600 shrink-0 mt-0.5" />
            <span>
              This provisions an isolated configuration file. The Autonomous Coding Agent will load these parameters whenever tickets with key <strong>{projectKey || 'KEY'}</strong> are processed.
            </span>
          </div>

          {/* Actions */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={() => setNewProjectModalOpen(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 rounded font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!projectKey.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={13} />
              <span>Create Project</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
