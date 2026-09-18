import React from 'react';
import { Database, Key, Link2, PlusCircle } from 'lucide-react';
import { SchemaModel } from './types';

interface SchemaViewerProps {
  schemas: SchemaModel[];
}

export const SchemaViewer: React.FC<SchemaViewerProps> = ({ schemas }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Extracted Data Structures & Schemas</h3>
          <p className="text-[11px] text-slate-400">
            Automatically extracted from database ORMs, Pydantic schemas, and TypeScript interfaces
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-3.5 py-1 text-xs font-semibold text-[#65a30d] bg-white border border-[#94d320] rounded-full hover:bg-[#edf8c7]/50 transition"
        >
          <span>Export Schema (SQL / TS)</span>
          <PlusCircle size={14} className="text-[#84cc16]" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {schemas.map((schema) => (
          <div
            key={schema.id}
            className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs hover:shadow-xs transition"
          >
            {/* Table Header */}
            <div className="bg-slate-900 text-white p-3.5 px-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Database size={15} className="text-[#94d320]" />
                <span className="font-mono font-bold text-xs">{schema.tableName}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">{schema.fields.length} fields</span>
            </div>

            {schema.description && (
              <div className="p-2.5 px-4 bg-slate-50 border-b border-slate-100 text-[11px] text-slate-500">
                {schema.description}
              </div>
            )}

            {/* Field Table */}
            <div className="p-2 divide-y divide-slate-100 font-mono text-xs">
              {schema.fields.map((field) => (
                <div key={field.name} className="py-2 px-2.5 flex items-center justify-between hover:bg-slate-50/80 rounded transition">
                  <div className="flex items-center space-x-2 truncate">
                    {field.isPrimary ? (
                      <span title="Primary Key">
                        <Key size={12} className="text-amber-500 shrink-0" />
                      </span>
                    ) : field.isForeignKey ? (
                      <span title={`Foreign Key -> ${field.foreignTable}`}>
                        <Link2 size={12} className="text-blue-500 shrink-0" />
                      </span>
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-300 shrink-0" />
                    )}
                    <span className="font-medium text-slate-800 truncate">{field.name}</span>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0">
                    <span className="text-[11px] text-slate-400">{field.type}</span>
                    {field.foreignTable && (
                      <span className="text-[9px] px-1 py-0.2 bg-blue-50 text-blue-700 rounded border border-blue-200">
                        {field.foreignTable}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
