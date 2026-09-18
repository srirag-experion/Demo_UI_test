export type NodeType = 'api' | 'service' | 'database' | 'test' | 'middleware' | 'util';

export interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  file: string;
  line?: number;
  description?: string;
  x: number;
  y: number;
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
  label?: string; // 'calls' | 'imports' | 'queries' | 'tests'
  type?: 'calls' | 'imports' | 'queries' | 'tests';
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
  scope: string; // e.g. 'PaymentService', 'All API Endpoints'
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
}
