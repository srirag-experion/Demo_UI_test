import React from 'react';
import { PlusCircle } from 'lucide-react';
import { SectionHeader } from '../components/common/SectionHeader';
import { SelectField } from '../components/common/SelectField';
import { FormField } from '../components/common/FormField';
import { SecretField } from '../components/common/SecretField';
import { ConnectionTest } from '../components/common/ConnectionTest';
import { useConfig } from '../context/ConfigContext';
import { VectorDBType } from '../types/config';

export const RAGSection: React.FC = () => {
  const { config, updateSection } = useConfig();
  const vectorDb = config.rag.vectorDb;

  const handleVectorDbChange = (newDb: string) => {
    updateSection('rag', { vectorDb: newDb as VectorDBType });
  };

  const updateRAG = (fields: Partial<typeof config.rag>) => {
    updateSection('rag', fields);
  };

  const updatePinecone = (fields: Partial<typeof config.rag.pinecone>) => {
    updateSection('rag', {
      pinecone: { ...config.rag.pinecone, ...fields },
    });
  };

  const updateQdrant = (fields: Partial<typeof config.rag.qdrant>) => {
    updateSection('rag', {
      qdrant: { ...config.rag.qdrant, ...fields },
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader
        title="Knowledge Base & RAG"
        description="Connect document vector stores and embedding models for semantic codebase retrieval"
      />

      {/* Knowledge Base Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Knowledge Base</h2>
            <p className="text-[11px] text-slate-400">Documentation sources ingested into vector index</p>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3.5 py-1 text-xs font-semibold text-[#65a30d] bg-white border border-[#94d320] rounded-full hover:bg-[#edf8c7]/50 transition"
          >
            <span>Add New</span>
            <PlusCircle size={14} className="text-[#84cc16]" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-700">Primary Source Path</span>
              <span className="text-[10px] text-slate-400 font-medium">Connected: Active</span>
            </div>
            <input
              type="text"
              value={config.rag.documentSourcePath}
              onChange={(e) => updateRAG({ documentSourcePath: e.target.value })}
              className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-mono rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-lime-400/40 focus:border-lime-500 focus:outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-700">Target File Types</span>
              <span className="text-[10px] text-slate-400 font-medium">Connected: Active</span>
            </div>
            <input
              type="text"
              value={config.rag.fileExtensions}
              onChange={(e) => updateRAG({ fileExtensions: e.target.value })}
              className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-mono rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-lime-400/40 focus:border-lime-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
          <FormField label={`Chunk Size: ${config.rag.chunkSize} tokens`}>
            <input
              type="range"
              min="128"
              max="2048"
              step="64"
              value={config.rag.chunkSize}
              onChange={(e) => updateRAG({ chunkSize: parseInt(e.target.value) })}
              className="w-full accent-[#94d320] cursor-pointer"
            />
          </FormField>

          <FormField label={`Chunk Overlap: ${config.rag.chunkOverlap} tokens`}>
            <input
              type="range"
              min="0"
              max="256"
              step="16"
              value={config.rag.chunkOverlap}
              onChange={(e) => updateRAG({ chunkOverlap: parseInt(e.target.value) })}
              className="w-full accent-[#94d320] cursor-pointer"
            />
          </FormField>
        </div>
      </div>

      {/* DataBase & Vector Store Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">DataBase & Vector Store</h2>
            <p className="text-[11px] text-slate-400">Storage engine for high-dimensional embeddings</p>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3.5 py-1 text-xs font-semibold text-[#65a30d] bg-white border border-[#94d320] rounded-full hover:bg-[#edf8c7]/50 transition"
          >
            <span>Add New</span>
            <PlusCircle size={14} className="text-[#84cc16]" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <SelectField
            label="Primary Vector Engine"
            value={vectorDb}
            onChange={handleVectorDbChange}
            options={[
              { value: 'qdrant', label: 'Qdrant (ChromaDB / Local Engine)', badge: 'Recommended' },
              { value: 'pinecone', label: 'Pinecone Serverless Cloud' },
              { value: 'pgvector', label: 'PostgreSQL + pgvector' },
              { value: 'weaviate', label: 'Weaviate Cloud' },
            ]}
          />

          <SelectField
            label="Embedding Model"
            value={config.rag.embeddingProvider}
            onChange={(v) => updateRAG({ embeddingProvider: v as any })}
            options={[
              { value: 'openai-text-3-large', label: 'OpenAI text-embedding-3-small / large' },
              { value: 'voyage-ai-3', label: 'Voyage AI voyage-3 (Code Optimized)' },
              { value: 'cohere-embed-v3', label: 'Cohere embed-english-v3.0' },
            ]}
          />
        </div>

        {/* Dynamic fields */}
        {vectorDb === 'qdrant' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3 border-t border-slate-100">
            <FormField label="ChromaDB / Qdrant Host URL" required>
              <input
                type="text"
                value={config.rag.qdrant.url}
                onChange={(e) => updateQdrant({ url: e.target.value })}
                placeholder="http://localhost:8000"
                className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-mono rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-lime-400/40 focus:border-lime-500 focus:outline-none"
              />
            </FormField>

            <FormField label="Target Collection Name" required>
              <input
                type="text"
                value={config.rag.qdrant.collectionName}
                onChange={(e) => updateQdrant({ collectionName: e.target.value })}
                className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-mono font-bold rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-lime-400/40 focus:border-lime-500 focus:outline-none"
              />
            </FormField>
          </div>
        )}

        {vectorDb === 'pinecone' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3 border-t border-slate-100">
            <SecretField
              label="Pinecone API Key"
              value={config.rag.pinecone.apiKey}
              onChange={(v) => updatePinecone({ apiKey: v })}
              required
            />

            <FormField label="Index Name" required>
              <input
                type="text"
                value={config.rag.pinecone.indexName}
                onChange={(e) => updatePinecone({ indexName: e.target.value })}
                className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-mono rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-lime-400/40 focus:border-lime-500 focus:outline-none"
              />
            </FormField>
          </div>
        )}

        {/* Verification */}
        <div className="pt-3 border-t border-slate-100">
          <ConnectionTest serviceKey={vectorDb} serviceName={vectorDb.toUpperCase()} />
        </div>
      </div>
    </div>
  );
};
