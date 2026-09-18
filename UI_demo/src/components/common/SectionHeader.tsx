import React from 'react';
import { Search } from 'lucide-react';
import { useConfig } from '../../context/ConfigContext';
import { SectionId } from '../../types/config';

interface SectionHeaderProps {
  category?: string;
  title: string;
  description: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
}

const SUB_TABS: Array<{ id: SectionId; label: string }> = [
  { id: 'overview', label: 'General Settings' },
  { id: 'llm', label: "Agents' Settings" },
  { id: 'rag', label: 'Knowledge Base' },
  { id: 'ticketing', label: 'Ticket Workflows' },
  { id: 'source_control', label: 'Connections' },
  { id: 'test_runner', label: 'Maintenance & QA' },
  { id: 'integrations', label: 'Security & Webhooks' },
];

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  description,
  badge,
  actions,
}) => {
  const { activeSection, setActiveSection } = useConfig();

  return (
    <div className="space-y-5">
      {/* Title + Search Bar Row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
            {badge}
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">{description}</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search Settings..."
              className="bg-white text-xs text-slate-800 placeholder:text-slate-400 rounded-lg pl-8 pr-3 py-1.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-lime-400/40 focus:border-lime-500 shadow-2xs"
            />
            <Search size={13} className="absolute left-2.5 top-2 text-slate-400" />
          </div>
          {actions}
        </div>
      </div>

      {/* Horizontal Sub-Tabs (as seen in Better AI) */}
      <div className="flex items-center space-x-6 border-b border-slate-200 text-xs overflow-x-auto select-none pt-1">
        {SUB_TABS.map((tab) => {
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSection(tab.id)}
              className={`pb-2.5 font-semibold transition-colors relative whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'text-[#84cc16] border-b-2 border-[#84cc16]'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
