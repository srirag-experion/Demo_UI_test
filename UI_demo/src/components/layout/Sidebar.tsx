import React from 'react';
import {
  LayoutDashboard,
  Network,
  Brain,
  Database,
  Bot,
  GitBranch,
  FlaskConical,
  Ticket,
  MessageSquare,
  HelpCircle,
  LogOut,
  LucideIcon,
} from 'lucide-react';
import { SectionId } from '../../types/config';
import { useConfig } from '../../context/ConfigContext';

interface NavItem {
  id: SectionId;
  label: string;
  icon: LucideIcon;
  badge?: string;
}

const PRIMARY_NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Dashboard & Health', icon: LayoutDashboard },
  { id: 'codegraph', label: 'Codebase Memory & Graph', icon: Network },
  { id: 'llm', label: 'LLM Providers', icon: Brain },
  { id: 'rag', label: 'Knowledge Base & RAG', icon: Database },
  { id: 'goose', label: 'Autonomous Agents', icon: Bot },
  { id: 'source_control', label: 'Source Connections', icon: GitBranch },
  { id: 'test_runner', label: 'Test Runners & QA', icon: FlaskConical },
  { id: 'ticketing', label: 'Ticket Workflows', icon: Ticket },
  { id: 'integrations', label: 'Connected APIs & Slack', icon: MessageSquare },
];

export const Sidebar: React.FC = () => {
  const { activeSection, setActiveSection } = useConfig();

  return (
    <aside className="w-64 bg-white text-slate-700 flex flex-col shrink-0 border-r border-slate-200 select-none min-h-[calc(100vh-3.5rem)] shadow-xs">
      {/* Brand Header */}
      <div className="p-4 px-5 border-b border-slate-100 flex items-center space-x-3">
        <div className="h-9 w-9 rounded-lg bg-[#94d320] flex items-center justify-center text-slate-900 font-extrabold text-lg shadow-xs">
          B
        </div>
        <div>
          <div className="font-extrabold text-base tracking-tight text-slate-900 leading-none">
            BETTER <span className="text-slate-700 font-semibold">AI</span>
          </div>
          <div className="text-[10px] text-slate-400 font-medium tracking-wide uppercase mt-0.5">
            Config Console
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {PRIMARY_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-[#edf8c7] text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon
                  size={16}
                  className={isActive ? 'text-[#84cc16]' : 'text-slate-400 group-hover:text-slate-600'}
                />
                <span>{item.label}</span>
              </div>

              {isActive && (
                <div className="h-1.5 w-1.5 rounded-full bg-[#84cc16]" />
              )}
            </button>
          );
        })}

        <div className="pt-3 mt-3 border-t border-slate-100 space-y-1">
          <button
            type="button"
            className="w-full flex items-center space-x-3 px-3.5 py-2 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition"
          >
            <HelpCircle size={15} className="text-slate-400" />
            <span>Help Center & Docs</span>
          </button>
        </div>
      </div>

      {/* User Profile Footer */}
      <div className="p-3.5 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center space-x-2.5 truncate">
          <div className="relative shrink-0">
            <div className="h-8 w-8 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-xs overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80"
                alt="Altman Breed"
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span>AB</span>
            </div>
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-[#84cc16] ring-2 ring-white" />
          </div>

          <div className="truncate">
            <div className="text-xs font-bold text-slate-800 truncate">Altman Breed</div>
            <div className="text-[10px] text-slate-500 truncate">altmanb@better.ai</div>
          </div>
        </div>

        <button
          type="button"
          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition"
          title="Sign out"
        >
          <LogOut size={14} />
        </button>
      </div>
    </aside>
  );
};
