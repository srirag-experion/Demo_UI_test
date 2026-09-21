import React, { useState, useMemo } from 'react';
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
  const [maxPerLane, setMaxPerLane] = useState<number>(20);

  // 5 Architectural Lanes
  const layerLanes = useMemo(
    () => [
      {
        id: 'api',
        title: 'API & Ingress',
        matchTypes: ['Route', 'api', 'Router', 'Endpoint'],
        x: 40,
        color: 'text-lime-800 bg-lime-50 border-lime-300',
        badgeColor: 'bg-[#84cc16] text-slate-950',
      },
      {
        id: 'service',
        title: 'Core Logic & Services',
        matchTypes: ['Function', 'Method', 'service', 'Service', 'Controller', 'Handler'],
        x: 340,
        color: 'text-blue-800 bg-blue-50 border-blue-300',
        badgeColor: 'bg-blue-600 text-white',
      },
      {
        id: 'database',
        title: 'Data Models & Schemas',
        matchTypes: ['Class', 'Model', 'Schema', 'Interface', 'Enum', 'Type', 'database'],
        x: 640,
        color: 'text-amber-800 bg-amber-50 border-amber-300',
        badgeColor: 'bg-amber-500 text-white',
      },
      {
        id: 'util',
        title: 'Utilities & Clients',
        matchTypes: ['Field', 'Variable', 'util', 'Client', 'Helper'],
        x: 940,
        color: 'text-emerald-800 bg-emerald-50 border-emerald-300',
        badgeColor: 'bg-emerald-600 text-white',
      },
      {
        id: 'test',
        title: 'Test Suites & Modules',
        matchTypes: ['test', 'File', 'Folder', 'Module'],
        x: 1240,
        color: 'text-purple-800 bg-purple-50 border-purple-300',
        badgeColor: 'bg-purple-600 text-white',
      },
    ],
    []
  );

  // Determine which lane a node belongs to
  const getNodeLaneIndex = (type: string): number => {
    for (let i = 0; i < layerLanes.length; i++) {
      if (layerLanes[i].matchTypes.includes(type)) return i;
    }
    return 1; // Default to Services
  };

  // Filter nodes matching search & type filters
  const filteredNodes = useMemo(() => {
    return nodes.filter((n) => {
      const label = n.label || '';
      const file = n.file || '';
      const matchesSearch =
        !searchQuery ||
        label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || n.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [nodes, searchQuery, filterType]);

  // Compute clean, non-overlapping grid positions
  const { positionedNodes, maxRowCount, nodePosMap } = useMemo(() => {
    const laneCounters = [0, 0, 0, 0, 0];
    const posMap = new Map<string, { x: number; y: number }>();

    const placed: Array<GraphNode & { computedX: number; computedY: number }> = [];

    // Group nodes by lane
    const laneBuckets: GraphNode[][] = [[], [], [], [], []];
    filteredNodes.forEach((node) => {
      const laneIdx = getNodeLaneIndex(node.type);
      laneBuckets[laneIdx].push(node);
    });

    // Place nodes in lanes up to maxPerLane (or all if maxPerLane === -1)
    laneBuckets.forEach((bucket, laneIdx) => {
      const limit = maxPerLane === -1 ? bucket.length : Math.min(bucket.length, maxPerLane);
      for (let r = 0; r < limit; r++) {
        const node = bucket[r];
        const x = layerLanes[laneIdx].x;
        const y = 64 + r * 122; // 122px vertical step gives 24px gap for 98px tall cards
        laneCounters[laneIdx]++;
        posMap.set(node.id, { x, y });
        placed.push({
          ...node,
          computedX: x,
          computedY: y,
        });
      }
    });

    const maxRows = Math.max(...laneCounters, 4);
    return {
      positionedNodes: placed,
      maxRowCount: maxRows,
      nodePosMap: posMap,
    };
  }, [filteredNodes, maxPerLane, layerLanes]);

  const canvasW = 1540;
  const canvasH = Math.max(680, 100 + maxRowCount * 124);

  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node);
    if (onSelectNode) onSelectNode(node);
  };

  const getNodeColorStyle = (type: string) => {
    const laneIdx = getNodeLaneIndex(type);
    switch (laneIdx) {
      case 0:
        return {
          bg: 'bg-lime-50/95 hover:bg-lime-100/90',
          border: 'border-lime-300 hover:border-lime-500',
          text: 'text-slate-900',
          fileText: 'text-slate-600',
          metricsText: 'text-slate-700',
          badge: 'bg-[#84cc16] text-slate-950',
        };
      case 1:
        return {
          bg: 'bg-blue-50/95 hover:bg-blue-100/90',
          border: 'border-blue-300 hover:border-blue-500',
          text: 'text-slate-900',
          fileText: 'text-slate-600',
          metricsText: 'text-slate-700',
          badge: 'bg-blue-600 text-white',
        };
      case 2:
        return {
          bg: 'bg-amber-50/95 hover:bg-amber-100/90',
          border: 'border-amber-300 hover:border-amber-500',
          text: 'text-slate-900',
          fileText: 'text-slate-600',
          metricsText: 'text-slate-700',
          badge: 'bg-amber-500 text-white',
        };
      case 3:
        return {
          bg: 'bg-emerald-50/95 hover:bg-emerald-100/90',
          border: 'border-emerald-300 hover:border-emerald-500',
          text: 'text-slate-900',
          fileText: 'text-slate-600',
          metricsText: 'text-slate-700',
          badge: 'bg-emerald-600 text-white',
        };
      case 4:
        return {
          bg: 'bg-purple-50/95 hover:bg-purple-100/90',
          border: 'border-purple-300 hover:border-purple-500',
          text: 'text-slate-900',
          fileText: 'text-slate-600',
          metricsText: 'text-slate-700',
          badge: 'bg-purple-600 text-white',
        };
      default:
        return {
          bg: 'bg-slate-50/95 hover:bg-slate-100',
          border: 'border-slate-300 hover:border-slate-400',
          text: 'text-slate-900',
          fileText: 'text-slate-600',
          metricsText: 'text-slate-700',
          badge: 'bg-slate-700 text-white',
        };
    }
  };

  return (
    <div className="space-y-4 select-none">
      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search symbol, class, file..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 text-xs text-slate-800 placeholder:text-slate-400 rounded-lg pl-8 pr-3 py-1.5 border border-slate-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-lime-400/40 focus:border-lime-500 transition-all"
          />
          <Search size={13} className="absolute left-2.5 top-2 text-slate-400" />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1 overflow-x-auto text-xs">
          {['all', 'Function', 'Class', 'File', 'Field', 'Route'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFilterType(t)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize transition cursor-pointer ${
                filterType === t
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t === 'all' ? `All (${nodes.length})` : t}
            </button>
          ))}
        </div>

        {/* Density & Zoom Controls */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200/80 text-[11px]">
            <button
              type="button"
              onClick={() => setMaxPerLane(20)}
              className={`px-2 py-0.5 rounded font-semibold transition cursor-pointer ${
                maxPerLane === 20 ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Top 20/Lane
            </button>
            <button
              type="button"
              onClick={() => setMaxPerLane(-1)}
              className={`px-2 py-0.5 rounded font-semibold transition cursor-pointer ${
                maxPerLane === -1 ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All Cards
            </button>
          </div>

          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200/60">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
              className="p-1 hover:bg-white rounded text-slate-600 hover:text-slate-900 transition cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut size={13} />
            </button>
            <span className="text-[10px] font-mono font-bold px-1.5 text-slate-600">{Math.round(zoom * 100)}%</span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))}
              className="p-1 hover:bg-white rounded text-slate-600 hover:text-slate-900 transition cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn size={13} />
            </button>
            <button
              type="button"
              onClick={() => setZoom(1)}
              className="p-1 hover:bg-white rounded text-slate-600 hover:text-slate-900 transition cursor-pointer"
              title="Reset Zoom"
            >
              <RotateCcw size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas Area — scrollable container */}
      <div
        className="relative w-full bg-[#fafbfc] border border-slate-200/80 rounded-2xl overflow-auto shadow-2xs"
        style={{ minHeight: 560, maxHeight: 780 }}
      >
        {/* Empty State */}
        {filteredNodes.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-30 pointer-events-none">
            <div className="p-5 bg-white/90 backdrop-blur-xs rounded-2xl border border-slate-200 shadow-md max-w-sm space-y-2 pointer-events-auto">
              <div className="w-10 h-10 mx-auto rounded-xl bg-[#edf8c7] flex items-center justify-center text-[#65a30d] font-bold text-lg">
                ⚡
              </div>
              <h3 className="text-sm font-bold text-slate-800">No Matching Symbols</h3>
              <p className="text-xs text-slate-500">No nodes match your current search or filter criteria.</p>
            </div>
          </div>
        )}

        {/* Scaled Canvas Inner */}
        <div
          className="relative transition-transform duration-75 origin-top-left p-6"
          style={{
            transform: `scale(${zoom})`,
            width: `${canvasW}px`,
            height: `${canvasH}px`,
            backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        >
          {/* Layer Lane Headers */}
          {layerLanes.map((col) => (
            <div
              key={col.title}
              style={{ left: `${col.x}px`, top: '12px' }}
              className={`absolute w-64 py-2 px-3 rounded-lg border text-[11px] font-bold uppercase tracking-wider text-center shadow-2xs pointer-events-none z-10 ${col.color}`}
            >
              {col.title}
            </div>
          ))}

          {/* SVG Connection Lines */}
          <svg className="absolute inset-0 pointer-events-none z-0" style={{ width: `${canvasW}px`, height: `${canvasH}px` }}>
            <defs>
              <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#94a3b8" />
              </marker>
              <marker id="arrowhead-lime" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#84cc16" />
              </marker>
              <marker id="arrowhead-blue" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#3b82f6" />
              </marker>
            </defs>

            {edges.map((edge) => {
              const p1 = nodePosMap.get(edge.source);
              const p2 = nodePosMap.get(edge.target);
              if (!p1 || !p2) return null;

              const isHighlighted =
                selectedNode && (selectedNode.id === edge.source || selectedNode.id === edge.target);

              let x1: number, y1: number, x2: number, y2: number;
              let cx1: number, cy1: number, cx2: number, cy2: number;

              if (p1.x < p2.x) {
                // Source is left of Target
                x1 = p1.x + 256;
                y1 = p1.y + 49;
                x2 = p2.x;
                y2 = p2.y + 49;
                const dx = Math.max(30, (x2 - x1) / 2);
                cx1 = x1 + dx;
                cy1 = y1;
                cx2 = x2 - dx;
                cy2 = y2;
              } else if (p1.x > p2.x) {
                // Backward connection
                x1 = p1.x + 128;
                y1 = p1.y + 98;
                x2 = p2.x + 128;
                y2 = p2.y;
                cx1 = x1;
                cy1 = y1 + 30;
                cx2 = x2;
                cy2 = y2 - 30;
              } else {
                // Same column vertical connection
                x1 = p1.x + 256;
                y1 = p1.y + 49;
                x2 = p2.x + 256;
                y2 = p2.y + 49;
                cx1 = x1 + 25;
                cy1 = y1 + 10;
                cx2 = x2 + 25;
                cy2 = y2 - 10;
              }

              return (
                <g key={edge.id}>
                  <path
                    d={`M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`}
                    fill="none"
                    stroke={isHighlighted ? '#84cc16' : '#cbd5e1'}
                    strokeWidth={isHighlighted ? 2.5 : 1.2}
                    markerEnd={isHighlighted ? 'url(#arrowhead-lime)' : 'url(#arrowhead)'}
                  />
                  {edge.label && (
                    <text
                      x={(x1 + x2) / 2}
                      y={(y1 + y2) / 2 - 4}
                      fill="#475569"
                      fontSize="9.5"
                      fontWeight="600"
                      fontFamily="sans-serif"
                      textAnchor="middle"
                      stroke="#f8fafc"
                      strokeWidth="3"
                      paintOrder="stroke"
                    >
                      {edge.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Clean Non-Overlapping Interactive Cards */}
          <div className="relative z-10">
            {positionedNodes.map((node) => {
              const style = getNodeColorStyle(node.type);
              const isSelected = selectedNode?.id === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => handleNodeClick(node)}
                  style={{ left: `${node.computedX}px`, top: `${node.computedY}px` }}
                  className={`absolute w-64 h-[98px] p-2.5 rounded-xl border shadow-2xs cursor-pointer transition-all flex flex-col justify-between hover:scale-[1.02] hover:shadow-md ${style.bg} ${
                    isSelected ? 'ring-2 ring-lime-400 border-lime-500 shadow-md scale-[1.03]' : style.border
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md shadow-2xs ${style.badge}`}>
                        {node.type}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 font-bold">L{node.line || 1}</span>
                    </div>
                    <div className={`text-xs font-extrabold truncate ${style.text}`} title={node.label}>
                      {node.label}
                    </div>
                    <div className={`text-[10px] font-mono truncate mt-0.5 ${style.fileText}`} title={node.file}>
                      {node.file}
                    </div>
                  </div>

                  {node.metrics && (
                    <div className={`pt-1 border-t border-slate-200/90 flex items-center justify-between text-[9.5px] font-mono font-bold ${style.metricsText}`}>
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
        <div className="sticky bottom-0 left-0 bg-white/95 backdrop-blur-xs p-2.5 border-t border-slate-200 flex items-center space-x-4 text-[10px] font-semibold text-slate-700 z-20">
          <span className="text-slate-500 font-mono font-bold mr-1">{positionedNodes.length} nodes displayed</span>
          {[
            ['API / Routes', '#84cc16'],
            ['Services / Functions', '#2563eb'],
            ['Models / Classes', '#d97706'],
            ['Utilities / Fields', '#059669'],
            ['Tests / Files', '#9333ea'],
          ].map(([label, color]) => (
            <div key={label} className="flex items-center space-x-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Node Details Drawer */}
      {selectedNode && (
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 animate-fade-in">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-slate-900">{selectedNode.label}</span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-mono">
                {selectedNode.type}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono">
              {selectedNode.file} (Line {selectedNode.line || 1})
            </p>
            {selectedNode.description && <p className="text-xs text-slate-700 mt-1">{selectedNode.description}</p>}
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={() => setSelectedNode(null)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition cursor-pointer"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
