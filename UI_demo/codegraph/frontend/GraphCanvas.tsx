import React, { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Search } from 'lucide-react';
import { GraphNode, GraphEdge } from './types';

interface GraphCanvasProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onSelectNode?: (node: GraphNode) => void;
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({ nodes, edges, onSelectNode }) => {
  const [zoom, setZoom] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  const filteredNodes = nodes.filter((n) => {
    const matchesSearch = n.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          n.file.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || n.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node);
    if (onSelectNode) onSelectNode(node);
  };

  const getNodeColor = (type: GraphNode['type']) => {
    switch (type) {
      case 'api':
        return { bg: 'bg-[#edf8c7]', border: 'border-[#94d320]', text: 'text-slate-900', badge: 'bg-[#94d320] text-slate-900' };
      case 'service':
        return { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-900', badge: 'bg-blue-500 text-white' };
      case 'database':
        return { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-900', badge: 'bg-amber-500 text-white' };
      case 'test':
        return { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-900', badge: 'bg-purple-500 text-white' };
      default:
        return { bg: 'bg-slate-50', border: 'border-slate-300', text: 'text-slate-800', badge: 'bg-slate-500 text-white' };
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search class, function, endpoint..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 text-xs text-slate-800 placeholder:text-slate-400 rounded-lg pl-8 pr-3 py-1.5 border border-slate-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-lime-400/40 focus:border-lime-500 transition-all"
          />
          <Search size={13} className="absolute left-2.5 top-2 text-slate-400" />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1 overflow-x-auto text-xs">
          {['all', 'api', 'service', 'database', 'test'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFilterType(t)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize transition ${
                filterType === t
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200/60">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.6, z - 0.1))}
            className="p-1 hover:bg-white rounded text-slate-600 hover:text-slate-900 transition"
            title="Zoom Out"
          >
            <ZoomOut size={13} />
          </button>
          <span className="text-[10px] font-mono font-bold px-1.5 text-slate-600">{Math.round(zoom * 100)}%</span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(1.6, z + 0.1))}
            className="p-1 hover:bg-white rounded text-slate-600 hover:text-slate-900 transition"
            title="Zoom In"
          >
            <ZoomIn size={13} />
          </button>
          <button
            type="button"
            onClick={() => setZoom(1)}
            className="p-1 hover:bg-white rounded text-slate-600 hover:text-slate-900 transition"
            title="Reset Zoom"
          >
            <RotateCcw size={12} />
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="relative w-full h-[480px] bg-[#fafbfc] border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs select-none">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        {/* Canvas Container with Zoom Transform */}
        <div
          className="absolute inset-0 transition-transform duration-75 origin-top-left p-6"
          style={{ transform: `scale(${zoom})` }}
        >
          {/* SVG Connection Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <defs>
              <marker
                id="arrowhead"
                markerWidth="8"
                markerHeight="6"
                refX="7"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="#94a3b8" />
              </marker>
              <marker
                id="arrowhead-lime"
                markerWidth="8"
                markerHeight="6"
                refX="7"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="#84cc16" />
              </marker>
            </defs>

            {edges.map((edge) => {
              const srcNode = nodes.find((n) => n.id === edge.source);
              const tgtNode = nodes.find((n) => n.id === edge.target);
              if (!srcNode || !tgtNode) return null;

              const isHighlighted =
                selectedNode && (selectedNode.id === srcNode.id || selectedNode.id === tgtNode.id);

              const x1 = srcNode.x + 100;
              const y1 = srcNode.y + 35;
              const x2 = tgtNode.x;
              const y2 = tgtNode.y + 35;

              const cx1 = x1 + (x2 - x1) / 2;
              const cy1 = y1;
              const cx2 = x1 + (x2 - x1) / 2;
              const cy2 = y2;

              return (
                <g key={edge.id}>
                  <path
                    d={`M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`}
                    fill="none"
                    stroke={isHighlighted ? '#84cc16' : '#cbd5e1'}
                    strokeWidth={isHighlighted ? 2.5 : 1.5}
                    strokeDasharray={edge.type === 'tests' ? '4,4' : undefined}
                    markerEnd={isHighlighted ? 'url(#arrowhead-lime)' : 'url(#arrowhead)'}
                  />
                  {edge.label && (
                    <text
                      x={(x1 + x2) / 2}
                      y={(y1 + y2) / 2 - 6}
                      fill="#64748b"
                      fontSize="9"
                      fontFamily="sans-serif"
                      textAnchor="middle"
                      className="bg-white"
                    >
                      {edge.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Interactive Nodes */}
          <div className="relative z-10">
            {filteredNodes.map((node) => {
              const style = getNodeColor(node.type);
              const isSelected = selectedNode?.id === node.id;

              return (
                <div
                  key={node.id}
                  onClick={() => handleNodeClick(node)}
                  style={{ left: `${node.x}px`, top: `${node.y}px` }}
                  className={`absolute w-52 p-3 rounded-xl border-2 shadow-xs cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md ${style.bg} ${
                    isSelected ? 'ring-3 ring-lime-400 border-lime-500 shadow-md scale-[1.03]' : style.border
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full ${style.badge}`}
                    >
                      {node.type}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">L{node.line || 1}</span>
                  </div>

                  <div className={`text-xs font-bold truncate ${style.text}`}>{node.label}</div>
                  <div className="text-[10px] text-slate-500 font-mono truncate mt-0.5">{node.file}</div>

                  {node.metrics && (
                    <div className="mt-2 pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[9px] text-slate-500 font-mono">
                      <span>In: {node.metrics.callersCount}</span>
                      <span>Out: {node.metrics.calleesCount}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Legend */}
        <div className="absolute bottom-3 left-4 bg-white/90 backdrop-blur-xs p-2 rounded-lg border border-slate-200 shadow-xs flex items-center space-x-3 text-[10px] font-semibold text-slate-600">
          <div className="flex items-center space-x-1">
            <span className="h-2 w-2 rounded-full bg-[#94d320]" />
            <span>API Endpoint</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            <span>Service</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span>Database Table</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="h-2 w-2 rounded-full bg-purple-500" />
            <span>Test Suite</span>
          </div>
        </div>
      </div>

      {/* Selected Node Details Drawer */}
      {selectedNode && (
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 animate-fade-in">
          <div className="space-y-0.5">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-900">{selectedNode.label}</span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 bg-slate-100 rounded text-slate-600 font-mono">
                {selectedNode.type}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono">{selectedNode.file} (Line {selectedNode.line})</p>
            {selectedNode.description && (
              <p className="text-xs text-slate-700 mt-1">{selectedNode.description}</p>
            )}
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={() => setSelectedNode(null)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 bg-slate-100 rounded-lg font-medium"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
