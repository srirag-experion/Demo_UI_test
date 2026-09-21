export type NodeType =
  | 'Function'
  | 'Field'
  | 'Class'
  | 'File'
  | 'Module'
  | 'Variable'
  | 'Folder'
  | 'Enum'
  | 'Method'
  | 'Interface'
  | 'Route'
  | 'Type'
  | 'Project'
  | 'api'
  | 'service'
  | 'database'
  | 'test'
  | 'middleware'
  | 'util';

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  file: string;
  line?: number;
  description?: string;
  x: number;
  y: number;
  z?: number;
  gridX?: number;
  gridY?: number;
  color?: string;
  size?: number;
  metrics?: {
    callersCount: number;
    calleesCount: number;
    complexity?: string;
  };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: string;
}

export interface SchemaField {
  name: string;
  type: string;
  isPrimary?: boolean;
  isForeignKey?: boolean;
  foreignTable?: string;
  isNullable?: boolean;
}

export interface SchemaModel {
  id: string;
  tableName: string;
  description?: string;
  fields: SchemaField[];
}

export interface ImpactRadiusResult {
  targetFile: string;
  symbolName: string;
  highRiskCallers: Array<{ file: string; symbol: string; reason: string }>;
  mediumRiskConsumers: Array<{ file: string; symbol: string; reason: string }>;
  mandatoryTests: Array<{ testFile: string; framework: string; command: string }>;
  rulesEnforced: string[];
}

export interface ArchitecturalRule {
  id: string;
  ruleTitle: string;
  description: string;
  scope: string;
  severity: 'strict' | 'warning' | 'info';
  createdAt: string;
  enforcedBy: string;
}

export interface ProjectCodebaseMemory {
  projectId: string;
  repoUrl: string;
  branch: string;
  lastParsedAt: string;
  totalFiles: number;
  totalSymbols: number;
  nodes: GraphNode[];
  edges: GraphEdge[];
  schemas: SchemaModel[];
  rules: ArchitecturalRule[];
  node_types_count?: Record<string, number>;
  edge_types_count?: Record<string, number>;
  dir_counts?: Record<string, number>;
}

