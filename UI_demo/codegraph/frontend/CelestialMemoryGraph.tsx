import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { Search, RefreshCw } from 'lucide-react';
import { GraphNode, GraphEdge } from './types';

interface CelestialMemoryGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  nodeTypesCount?: Record<string, number>;
  edgeTypesCount?: Record<string, number>;
  dirCounts?: Record<string, number>;
  repoName?: string;
  onRefresh?: () => void;
  onSelectNode?: (node: GraphNode) => void;
}

export const CelestialMemoryGraph: React.FC<CelestialMemoryGraphProps> = ({
  nodes,
  edges,
  nodeTypesCount = {},
  edgeTypesCount = {},
  dirCounts = {},
  repoName = 'project_codebase_memory',
  onRefresh,
  onSelectNode,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const [showLabels, setShowLabels] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDir, setSelectedDir] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  // Color Map
  const nodeTypeColors: Record<string, string> = {
    Function: '#00f5ff',
    Field: '#a3e635',
    Class: '#d946ef',
    File: '#38bdf8',
    Module: '#fb923c',
    Variable: '#2dd4bf',
    Folder: '#4ade80',
    Enum: '#facc15',
    Method: '#a78bfa',
    Interface: '#f472b6',
    Route: '#84cc16',
    Type: '#67e8f9',
    Project: '#ef4444',
    api: '#84cc16',
    service: '#3b82f6',
    database: '#f59e0b',
    util: '#10b981',
    test: '#a855f7',
  };

  // Node & Edge filter toggles — initialized with all types
  const [activeNodeTypes, setActiveNodeTypes] = useState<Set<string>>(() => {
    const s = new Set<string>();
    nodes.forEach((n) => { if (n.type) s.add(n.type); });
    Object.keys(nodeTypesCount).forEach((k) => s.add(k));
    if (s.size === 0) {
      ['Function', 'Field', 'Class', 'File', 'Module', 'Variable', 'Folder', 'Enum', 'Method', 'Interface', 'Route', 'Type', 'api', 'service', 'database', 'util', 'test'].forEach((t) => s.add(t));
    }
    return s;
  });

  const [activeEdgeTypes, setActiveEdgeTypes] = useState<Set<string>>(() => {
    const s = new Set<string>();
    edges.forEach((e) => { if (e.type) s.add(e.type); });
    Object.keys(edgeTypesCount).forEach((k) => s.add(k));
    if (s.size === 0) {
      ['defines', 'usage', 'calls', 'contains file', 'contains folder', 'writes', 'imports', 'inherits', 'defines method', 'queries', 'tests'].forEach((t) => s.add(t));
    }
    return s;
  });

  // Keep active types in sync whenever nodes/edges or project changes
  useEffect(() => {
    const allTypes = new Set<string>();
    nodes.forEach((n) => { if (n.type) allTypes.add(n.type); });
    Object.keys(nodeTypesCount).forEach((k) => allTypes.add(k));
    if (allTypes.size === 0) {
      ['Function', 'Field', 'Class', 'File', 'Module', 'Variable', 'Folder', 'Enum', 'Method', 'Interface', 'Route', 'Type', 'api', 'service', 'database', 'util', 'test'].forEach((t) => allTypes.add(t));
    }
    setActiveNodeTypes(allTypes);

    const allEdges = new Set<string>();
    edges.forEach((e) => { if (e.type) allEdges.add(e.type); });
    Object.keys(edgeTypesCount).forEach((k) => allEdges.add(k));
    if (allEdges.size === 0) {
      ['defines', 'usage', 'calls', 'contains file', 'contains folder', 'writes', 'imports', 'inherits', 'defines method', 'queries', 'tests'].forEach((t) => allEdges.add(t));
    }
    setActiveEdgeTypes(allEdges);
  }, [nodes, edges, nodeTypesCount, edgeTypesCount]);

  // Filtered nodes
  const filteredNodes = useMemo(() => {
    const res = nodes.filter((n) => {
      const typeMatch = activeNodeTypes.has(n.type) || activeNodeTypes.size === 0;
      const searchMatch =
        !searchQuery ||
        n.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.file.toLowerCase().includes(searchQuery.toLowerCase());
      const dirMatch = !selectedDir || n.file.startsWith(selectedDir) || n.file === selectedDir;
      return typeMatch && searchMatch && dirMatch;
    });
    return res.length > 0 ? res : nodes;
  }, [nodes, activeNodeTypes, searchQuery, selectedDir]);

  const filteredNodeIdSet = useMemo(() => new Set(filteredNodes.map((n) => n.id)), [filteredNodes]);

  const filteredEdges = useMemo(() => {
    return edges.filter((e) => {
      const edgeType = e.type || 'calls';
      const typeMatch = activeEdgeTypes.has(edgeType) || activeEdgeTypes.size === 0;
      const nodesVisible = filteredNodeIdSet.has(e.source) && filteredNodeIdSet.has(e.target);
      return typeMatch && nodesVisible;
    });
  }, [edges, activeEdgeTypes, filteredNodeIdSet]);

  const toggleAllNodeTypes = (enable: boolean) => {
    if (enable) {
      const all = new Set<string>();
      nodes.forEach((n) => { if (n.type) all.add(n.type); });
      Object.keys(nodeTypesCount).forEach((k) => all.add(k));
      setActiveNodeTypes(all);
    } else {
      setActiveNodeTypes(new Set());
    }
  };

  const toggleNodeType = (type: string) => {
    const next = new Set(activeNodeTypes);
    if (next.has(type)) next.delete(type);
    else next.add(type);
    setActiveNodeTypes(next);
  };

  const toggleEdgeType = (type: string) => {
    const next = new Set(activeEdgeTypes);
    if (next.has(type)) next.delete(type);
    else next.add(type);
    setActiveEdgeTypes(next);
  };

  // ─────────────────────────────────────────────
  // High-Performance Three.js 3D WebGL Engine
  // ─────────────────────────────────────────────
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 800;
    let height = container.clientHeight || 600;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060a10);
    scene.fog = new THREE.FogExp2(0x060a10, 0.001);

    const camera = new THREE.PerspectiveCamera(50, width / height, 1, 4000);
    camera.position.set(0, 30, 480);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setClearColor(0x060a10, 1.0);
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Particle Starfield Background
    const starsGeo = new THREE.BufferGeometry();
    const starsCount = 800;
    const starPositions = new Float32Array(starsCount * 3);
    for (let i = 0; i < starsCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 1600;
      starPositions[i + 1] = (Math.random() - 0.5) * 1600;
      starPositions[i + 2] = (Math.random() - 0.5) * 1600;
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starsMat = new THREE.PointsMaterial({ color: 0x334155, size: 1.5, transparent: true, opacity: 0.6 });
    const starsField = new THREE.Points(starsGeo, starsMat);
    scene.add(starsField);

    // Group for Galaxy Rotation
    const graphGroup = new THREE.Group();
    scene.add(graphGroup);

    // Node & Edge Cache
    const nodePositionMap = new Map<string, THREE.Vector3>();
    const sphereGeo = new THREE.SphereGeometry(1, 12, 12);
    const materialCache = new Map<string, THREE.MeshBasicMaterial>();

    const getMaterial = (colorHex: string) => {
      if (!materialCache.has(colorHex)) {
        materialCache.set(colorHex, new THREE.MeshBasicMaterial({ color: new THREE.Color(colorHex) }));
      }
      return materialCache.get(colorHex)!;
    };

    const interactiveMeshes: THREE.Mesh[] = [];

    // 1. Build Node Meshes — Centered in 3D Space
    const totalN = Math.max(1, filteredNodes.length);
    filteredNodes.forEach((node, idx) => {
      let pos: THREE.Vector3;

      if (node.z !== undefined && typeof node.x === 'number' && Math.abs(node.x) <= 300) {
        // Native 3D coordinates present
        pos = new THREE.Vector3(node.x, node.y ?? 0, node.z);
      } else {
        // Distribute along spherical 3D celestial shell
        const phi = Math.acos(-1.0 + (2.0 * idx) / totalN);
        const theta = Math.sqrt(totalN * Math.PI) * phi;
        const radius = 180.0 + (idx % 3) * 30.0;
        pos = new THREE.Vector3(
          radius * Math.cos(theta) * Math.sin(phi),
          radius * Math.sin(theta) * Math.sin(phi),
          radius * Math.cos(phi)
        );
      }

      nodePositionMap.set(node.id, pos);

      const colorHex = nodeTypeColors[node.type] || node.color || '#00f5ff';
      const size = node.size || (['Class', 'Route', 'api', 'Project'].includes(node.type) ? 4.5 : ['File', 'Folder', 'service'].includes(node.type) ? 3.5 : 2.5);

      const mesh = new THREE.Mesh(sphereGeo, getMaterial(colorHex));
      mesh.position.copy(pos);
      mesh.scale.set(size, size, size);
      mesh.userData = { node };

      graphGroup.add(mesh);
      interactiveMeshes.push(mesh);
    });

    // 2. Build Glowing Edge Lines
    const linePositions: number[] = [];
    const lineColors: number[] = [];

    filteredEdges.forEach((edge) => {
      const p1 = nodePositionMap.get(edge.source);
      const p2 = nodePositionMap.get(edge.target);
      if (p1 && p2) {
        linePositions.push(p1.x, p1.y, p1.z);
        linePositions.push(p2.x, p2.y, p2.z);

        const isCalls = edge.type === 'calls' || edge.type === 'queries';
        const isDefines = edge.type === 'defines' || edge.type === 'defines method';
        const c1 = new THREE.Color(isCalls ? 0x00f5ff : isDefines ? 0x10b981 : 0xa855f7);
        const c2 = new THREE.Color(0x38bdf8);

        lineColors.push(c1.r, c1.g, c1.b);
        lineColors.push(c2.r, c2.g, c2.b);
      }
    });

    if (linePositions.length > 0) {
      const edgeGeo = new THREE.BufferGeometry();
      edgeGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
      edgeGeo.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3));

      const edgeMat = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending,
      });

      const lineSegments = new THREE.LineSegments(edgeGeo, edgeMat);
      graphGroup.add(lineSegments);
    }

    // 3. Fast Interaction Handlers
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let autoRotate = true;
    let autoRotateTimer: any = null;

    const raycaster = new THREE.Raycaster();
    const mouseVector = new THREE.Vector2();

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      autoRotate = false;
      if (autoRotateTimer) clearTimeout(autoRotateTimer);
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      if (isDragging) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;

        graphGroup.rotation.y += deltaX * 0.005;
        graphGroup.rotation.x += deltaY * 0.005;

        previousMousePosition = { x: e.clientX, y: e.clientY };
      }

      // Fast Raycasting check directly on DOM tooltip
      if (tooltipRef.current && clientX >= 0 && clientX <= width && clientY >= 0 && clientY <= height) {
        mouseVector.x = (clientX / width) * 2 - 1;
        mouseVector.y = -(clientY / height) * 2 + 1;
        raycaster.setFromCamera(mouseVector, camera);

        const intersects = raycaster.intersectObjects(interactiveMeshes, false);
        if (intersects.length > 0) {
          const targetNode = intersects[0].object.userData.node as GraphNode;
          const tooltip = tooltipRef.current;
          const color = nodeTypeColors[targetNode.type] || '#00f5ff';
          const callers = targetNode.metrics?.callersCount ?? 0;
          const callees = targetNode.metrics?.calleesCount ?? 0;

          tooltip.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 4px;">
              <span style="font-weight: 700; color: #ffffff; font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 180px;">${targetNode.label}</span>
              <span style="background: ${color}; color: #020617; font-weight: 800; font-size: 9px; text-transform: uppercase; padding: 2px 6px; border-radius: 4px;">${targetNode.type}</span>
            </div>
            <div style="font-size: 10px; color: #94a3b8; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-bottom: 2px;">${targetNode.file}</div>
            <div style="font-size: 10px; color: #64748b; margin-bottom: 4px;">Line: ${targetNode.line || 1}</div>
            <div style="display: flex; justify-content: space-between; padding-top: 4px; border-top: 1px solid #1e293b; font-size: 10px; color: #cbd5e1;">
              <span>In-callers: <strong style="color:#38bdf8;">${callers}</strong></span>
              <span>Out-callees: <strong style="color:#a3e635;">${callees}</strong></span>
            </div>
          `;

          const tooltipX = Math.min(window.innerWidth - 270, e.clientX + 14);
          const tooltipY = Math.min(window.innerHeight - 150, e.clientY + 14);

          tooltip.style.left = `${tooltipX}px`;
          tooltip.style.top = `${tooltipY}px`;
          tooltip.style.display = 'block';
          container.style.cursor = 'pointer';
        } else {
          tooltipRef.current.style.display = 'none';
          container.style.cursor = isDragging ? 'grabbing' : 'grab';
        }
      }
    };

    const onMouseUp = () => {
      isDragging = false;
      autoRotateTimer = setTimeout(() => {
        autoRotate = true;
      }, 2500);
    };

    const onClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;
      mouseVector.x = (clientX / width) * 2 - 1;
      mouseVector.y = -(clientY / height) * 2 + 1;
      raycaster.setFromCamera(mouseVector, camera);

      const intersects = raycaster.intersectObjects(interactiveMeshes, false);
      if (intersects.length > 0) {
        const node = intersects[0].object.userData.node as GraphNode;
        setSelectedNode(node);
        if (onSelectNode) onSelectNode(node);
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z = Math.max(100, Math.min(1200, camera.position.z + e.deltaY * 0.4));
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('click', onClick);
    container.addEventListener('wheel', onWheel, { passive: false });

    // Smooth Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (autoRotate) {
        graphGroup.rotation.y += 0.0012;
      }
      renderer.render(scene, camera);
    };
    animate();

    // Robust ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cr = entry.contentRect;
        if (cr.width > 0 && cr.height > 0) {
          width = cr.width;
          height = cr.height;
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animId);
      if (autoRotateTimer) clearTimeout(autoRotateTimer);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('click', onClick);
      container.removeEventListener('wheel', onWheel);
      resizeObserver.disconnect();
      renderer.dispose();
      sphereGeo.dispose();
      materialCache.forEach((m) => m.dispose());
    };
  }, [filteredNodes, filteredEdges]);

  // Combined node types counts
  const nodeTypeEntries = useMemo(() => {
    const list: Array<{ type: string; count: number; color: string }> = [];
    const knownOrder = [
      'Function',
      'Field',
      'Class',
      'File',
      'Module',
      'Variable',
      'Folder',
      'Enum',
      'Method',
      'Interface',
      'Route',
      'Type',
      'api',
      'service',
      'database',
      'util',
      'test',
    ];

    const countedTypes = new Set<string>();

    knownOrder.forEach((t) => {
      const cnt = nodeTypesCount[t] || nodes.filter((n) => n.type === t).length;
      if (cnt > 0) {
        countedTypes.add(t);
        list.push({ type: t, count: cnt, color: nodeTypeColors[t] || '#00f5ff' });
      }
    });

    Object.entries(nodeTypesCount).forEach(([k, cnt]) => {
      if (!countedTypes.has(k) && cnt > 0) {
        countedTypes.add(k);
        list.push({ type: k, count: cnt, color: nodeTypeColors[k] || '#38bdf8' });
      }
    });

    nodes.forEach((n) => {
      if (!countedTypes.has(n.type)) {
        const cnt = nodes.filter((x) => x.type === n.type).length;
        if (cnt > 0) {
          countedTypes.add(n.type);
          list.push({ type: n.type, count: cnt, color: nodeTypeColors[n.type] || '#00f5ff' });
        }
      }
    });

    return list;
  }, [nodeTypesCount, nodes]);

  // Combined edge types counts
  const edgeTypeEntries = useMemo(() => {
    const list: Array<{ type: string; count: number }> = [];
    const knownEdges = [
      'defines',
      'usage',
      'calls',
      'contains file',
      'contains folder',
      'writes',
      'defines method',
      'configures',
      'file changes with',
      'inherits',
      'handles',
      'queries',
      'tests',
      'imports',
    ];

    const countedEdges = new Set<string>();

    knownEdges.forEach((t) => {
      const cnt = edgeTypesCount[t] || edges.filter((e) => e.type === t).length;
      if (cnt > 0) {
        countedEdges.add(t);
        list.push({ type: t, count: cnt });
      }
    });

    edges.forEach((e) => {
      const et = e.type || 'calls';
      if (!countedEdges.has(et)) {
        const cnt = edges.filter((x) => (x.type || 'calls') === et).length;
        if (cnt > 0) {
          countedEdges.add(et);
          list.push({ type: et, count: cnt });
        }
      }
    });

    return list;
  }, [edgeTypesCount, edges]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-[#060a10] border border-slate-800 shadow-2xl text-slate-200 select-none flex flex-col min-h-[640px] h-[780px]">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-[#090e15]/95 backdrop-blur-md border-b border-slate-800/90 z-20">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#10b981] animate-pulse" />
            <span className="font-bold text-sm tracking-wide text-white font-mono">Codebase Memory</span>
          </div>

          <div className="flex items-center space-x-1 bg-slate-900/90 p-0.5 rounded-lg border border-slate-800 text-xs">
            <button type="button" className="px-3 py-1 rounded-md bg-[#10b981]/20 text-[#34d399] font-bold">
              Graph
            </button>
            <button type="button" className="px-3 py-1 rounded-md text-slate-400 hover:text-slate-200">
              Projects
            </button>
            <button type="button" className="px-3 py-1 rounded-md text-slate-400 hover:text-slate-200">
              Control
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-2 bg-slate-900/90 border border-slate-800 px-3 py-1 rounded-lg text-slate-400 font-mono text-[11px]">
            <span className="truncate max-w-[280px]">
              GRAPH: <span className="text-slate-200 font-semibold">{repoName}</span>
            </span>
          </div>

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold transition cursor-pointer"
            >
              <RefreshCw size={12} />
              <span>Refresh</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Body with Sidebar + 3D Viewport */}
      <div className="relative flex-1 min-h-0 flex overflow-hidden">
        {/* Left Filter Sidebar */}
        <div className="w-64 bg-[#090e15]/90 backdrop-blur-md border-r border-slate-800/80 p-4 space-y-4 overflow-y-auto shrink-0 z-20 text-xs custom-scrollbar">
          {/* Filters Header */}
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 tracking-wider">
            <span>FILTERS</span>
            <div className="flex items-center space-x-2 text-[10px]">
              <button
                type="button"
                onClick={() => toggleAllNodeTypes(true)}
                className="text-[#34d399] hover:underline cursor-pointer font-bold"
              >
                All
              </button>
              <span>|</span>
              <button
                type="button"
                onClick={() => toggleAllNodeTypes(false)}
                className="hover:text-slate-200 cursor-pointer"
              >
                None
              </button>
            </div>
          </div>

          {/* Nodes Section */}
          <div className="space-y-1.5">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Nodes</div>
            <div className="flex flex-wrap gap-1.5">
              {nodeTypeEntries.map((item) => {
                const isActive = activeNodeTypes.has(item.type);
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => toggleNodeType(item.type)}
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono transition cursor-pointer border ${
                      isActive
                        ? 'bg-slate-900 border-slate-600 text-slate-100 shadow-2xs'
                        : 'bg-transparent border-slate-800/60 text-slate-500 opacity-40'
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: item.color }} />
                    <span>{item.type}</span>
                    <span className="text-slate-300 font-bold">{item.count.toLocaleString()}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Edges Section */}
          <div className="space-y-1.5 pt-1">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Edges</div>
            <div className="flex flex-wrap gap-1.5">
              {edgeTypeEntries.map((item) => {
                const isActive = activeEdgeTypes.has(item.type);
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => toggleEdgeType(item.type)}
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono transition cursor-pointer border ${
                      isActive
                        ? 'bg-slate-900 border-slate-600 text-slate-200'
                        : 'bg-transparent border-slate-800/60 text-slate-500 opacity-40'
                    }`}
                  >
                    <span>{item.type}</span>
                    <span className="text-slate-300 font-bold">{item.count.toLocaleString()}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Show Labels Checkbox */}
          <div className="pt-2 border-t border-slate-800/80">
            <label className="flex items-center gap-2 text-[11px] text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showLabels}
                onChange={(e) => setShowLabels(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-[#10b981] focus:ring-0 w-3.5 h-3.5"
              />
              <span>Show labels</span>
            </label>
          </div>

          {/* Search Input */}
          <div className="relative pt-1">
            <input
              type="text"
              placeholder="Search symbol, class..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-7 pr-2.5 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-[#10b981]"
            />
            <Search size={12} className="absolute left-2.5 top-3.5 text-slate-500" />
          </div>

          {/* Directory Hierarchy Breakdown */}
          {Object.keys(dirCounts).length > 0 && (
            <div className="space-y-1 pt-2 border-t border-slate-800/80 font-mono text-[11px]">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Directories</div>
              <div className="space-y-0.5 max-h-48 overflow-y-auto custom-scrollbar">
                <div
                  onClick={() => setSelectedDir(null)}
                  className={`px-2 py-1 rounded flex items-center justify-between cursor-pointer transition ${
                    selectedDir === null ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:bg-slate-900'
                  }`}
                >
                  <span>. (all)</span>
                  <span className="text-slate-400 font-bold">{nodes.length}</span>
                </div>
                {Object.entries(dirCounts).map(([d, cnt]) => (
                  <div
                    key={d}
                    onClick={() => setSelectedDir(selectedDir === d ? null : d)}
                    className={`px-2 py-1 rounded flex items-center justify-between cursor-pointer transition ${
                      selectedDir === d ? 'bg-[#10b981]/20 text-[#34d399] font-bold' : 'text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    <span className="truncate max-w-[140px]">📁 {d}</span>
                    <span className="text-slate-400 font-bold">{cnt}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 3D WebGL Viewport */}
        <div className="relative flex-1 min-h-0 h-full overflow-hidden bg-[#060a10]">
          {/* Top-left Subtitle Stats */}
          <div className="absolute left-4 top-3 z-10 pointer-events-none font-mono text-xs text-slate-300 flex items-center space-x-2 bg-slate-950/80 px-3 py-1 rounded-md backdrop-blur-xs border border-slate-800/80 shadow-md">
            <span className="text-[#34d399] font-extrabold">{filteredNodes.length.toLocaleString()}</span>
            <span className="text-slate-300 font-semibold">nodes</span>
            <span className="text-slate-500">/</span>
            <span className="text-[#38bdf8] font-extrabold">{filteredEdges.length.toLocaleString()}</span>
            <span className="text-slate-300 font-semibold">edges</span>
          </div>

          {/* WebGL Canvas Mount Container */}
          <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing bg-[#060a10]" />

          {/* Fast Zero-Re-Render Tooltip Ref */}
          <div
            ref={tooltipRef}
            style={{ display: 'none', position: 'fixed', zIndex: 999 }}
            className="pointer-events-none p-3 rounded-xl bg-slate-950/95 border border-slate-700 shadow-2xl backdrop-blur-md text-xs space-y-1 font-mono max-w-xs"
          />

          {/* Selected Node Bottom Card */}
          {selectedNode && (
            <div className="absolute bottom-4 left-4 right-4 z-20 p-3.5 bg-slate-950/95 border border-slate-700 rounded-xl backdrop-blur-md flex items-center justify-between shadow-2xl animate-fade-in">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-white text-sm">{selectedNode.label}</span>
                  <span
                    className="px-2 py-0.5 rounded text-[10px] uppercase font-bold text-slate-950"
                    style={{ background: nodeTypeColors[selectedNode.type] || '#00f5ff' }}
                  >
                    {selectedNode.type}
                  </span>
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  {selectedNode.file} (Line {selectedNode.line || 1})
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNode(null)}
                className="px-3 py-1 text-xs text-slate-400 hover:text-white bg-slate-900 rounded-lg border border-slate-800 cursor-pointer"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
