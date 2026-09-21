import React, { useState } from 'react';
import { Database, Key, Link2, Download, Copy, Check, X } from 'lucide-react';
import { SchemaModel } from './types';

interface SchemaViewerProps {
  schemas: SchemaModel[];
}

export const SchemaViewer: React.FC<SchemaViewerProps> = ({ schemas }) => {
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'ts' | 'sql' | 'json'>('ts');
  const [copied, setCopied] = useState(false);

  const generateExportContent = () => {
    if (exportFormat === 'ts') {
      return schemas
        .map((s) => {
          const fields = s.fields
            .map((f) => `  ${f.name}${f.isNullable ? '?' : ''}: ${f.type || 'any'};`)
            .join('\n');
          return `export interface ${s.tableName} {\n${fields}\n}`;
        })
        .join('\n\n');
    }

    if (exportFormat === 'sql') {
      return schemas
        .map((s) => {
          const fields = s.fields
            .map((f) => {
              let sqlType = 'VARCHAR(255)';
              const t = (f.type || '').toLowerCase();
              if (t.includes('number') || t.includes('int')) sqlType = 'INTEGER';
              else if (t.includes('bool')) sqlType = 'BOOLEAN';
              else if (t.includes('date') || t.includes('time')) sqlType = 'TIMESTAMP';
              else if (t.includes('uuid')) sqlType = 'UUID';

              const pk = f.isPrimary ? ' PRIMARY KEY' : '';
              const notNull = !f.isNullable && !f.isPrimary ? ' NOT NULL' : '';
              return `  ${f.name} ${sqlType}${pk}${notNull}`;
            })
            .join(',\n');
          return `CREATE TABLE ${s.tableName.toLowerCase()} (\n${fields}\n);`;
        })
        .join('\n\n');
    }

    return JSON.stringify(schemas, null, 2);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateExportContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Extracted Data Structures & Schemas</h3>
          <p className="text-[11px] text-slate-500">
            Automatically extracted from database ORMs, Pydantic schemas, and TypeScript interfaces ({schemas.length} models)
          </p>
        </div>

        <button
          type="button"
          onClick={() => setExportModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1 text-xs font-semibold text-[#65a30d] bg-white border border-[#94d320] rounded-full hover:bg-[#edf8c7]/50 transition cursor-pointer"
        >
          <Download size={13} className="text-[#84cc16]" />
          <span>Export Schemas</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {schemas.map((schema) => (
          <div
            key={schema.id}
            className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs hover:shadow-xs transition flex flex-col justify-between"
          >
            <div>
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
                  <div
                    key={field.name}
                    className="py-2 px-2.5 flex items-center justify-between hover:bg-slate-50/80 rounded transition"
                  >
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
          </div>
        ))}
      </div>

      {/* Export Schemas Modal */}
      {exportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[85vh]">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Database size={16} className="text-[#94d320]" />
                <h3 className="text-sm font-bold">Export Extracted Schemas</h3>
              </div>
              <button
                type="button"
                onClick={() => setExportModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-4 space-y-3 flex-1 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg">
                  {(['ts', 'sql', 'json'] as const).map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setExportFormat(fmt)}
                      className={`px-3 py-1 text-xs font-semibold rounded-md uppercase transition cursor-pointer ${
                        exportFormat === fmt ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-900 bg-[#94d320] hover:bg-[#84cc16] rounded-lg transition shadow-2xs cursor-pointer"
                >
                  {copied ? <Check size={13} className="text-slate-900" /> : <Copy size={13} />}
                  <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
                </button>
              </div>

              <textarea
                readOnly
                rows={16}
                value={generateExportContent()}
                className="w-full font-mono text-xs p-3 bg-slate-900 text-slate-100 rounded-xl focus:outline-none resize-none flex-1 overflow-auto"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

