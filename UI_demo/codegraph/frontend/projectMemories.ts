import { ProjectCodebaseMemory } from './types';

export const PROJECT_CODEBASE_MEMORIES: Record<string, ProjectCodebaseMemory> = {
  'ASTRA-CORE': {
    projectId: 'ASTRA-CORE',
    repoUrl: 'https://github.com/Astra-Global/enterprise-core-service',
    branch: 'main',
    lastParsedAt: 'Just now (Synced)',
    totalFiles: 148,
    totalSymbols: 620,
    nodes: [
      { id: '1', label: 'POST /api/v1/trigger', type: 'api', file: 'src/api/routes.py', line: 42, description: 'FastAPI trigger webhook', x: 80, y: 120, metrics: { callersCount: 12, calleesCount: 2 } },
      { id: '2', label: 'PipelineRunner', type: 'service', file: 'src/pipeline/runner.py', line: 18, description: '6-Stage execution sequencer', x: 300, y: 120, metrics: { callersCount: 3, calleesCount: 4 } },
      { id: '3', label: 'ImpactAnalysisStage', type: 'service', file: 'src/stages/01_impact.py', line: 15, description: 'Tree-sitter & AST analyzer', x: 540, y: 50, metrics: { callersCount: 1, calleesCount: 2 } },
      { id: '4', label: 'GooseAgentDocker', type: 'service', file: 'src/agent/goose.py', line: 30, description: 'Dockerized code generation container', x: 540, y: 180, metrics: { callersCount: 1, calleesCount: 3 } },
      { id: '5', label: 'PostgreSQL: dev_requests', type: 'database', file: 'src/db/models.py', line: 55, description: 'Authoritative pipeline state table', x: 800, y: 90, metrics: { callersCount: 4, calleesCount: 0 } },
      { id: '6', label: 'Redis: TaskQueue', type: 'database', file: 'src/cache/redis.py', line: 12, description: 'Lock & idempotency store', x: 800, y: 220, metrics: { callersCount: 2, calleesCount: 0 } },
      { id: '7', label: 'test_pipeline_e2e.py', type: 'test', file: 'tests/e2e/test_pipeline.py', line: 1, description: 'Playwright & Pytest verification suite', x: 300, y: 300, metrics: { callersCount: 0, calleesCount: 3 } },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', label: 'dispatches', type: 'calls' },
      { id: 'e2-3', source: '2', target: '3', label: 'executes Stage 1', type: 'calls' },
      { id: 'e2-4', source: '2', target: '4', label: 'executes Stage 4', type: 'calls' },
      { id: 'e2-5', source: '2', target: '5', label: 'persists state', type: 'queries' },
      { id: 'e4-6', source: '4', target: '6', label: 'acquires lock', type: 'queries' },
      { id: 'e7-2', source: '7', target: '2', label: 'verifies', type: 'tests' },
    ],
    schemas: [
      {
        id: 's1',
        tableName: 'dev_requests',
        description: 'Persistent log of ticket executions and state',
        fields: [
          { name: 'request_id', type: 'UUID', isPrimary: true },
          { name: 'ticket_key', type: 'VARCHAR(64)', isNullable: false },
          { name: 'status', type: 'VARCHAR(32)', isNullable: false },
          { name: 'project_id', type: 'VARCHAR(32)', isForeignKey: true, foreignTable: 'projects' },
          { name: 'created_at', type: 'TIMESTAMP', isNullable: false },
        ],
      },
      {
        id: 's2',
        tableName: 'stage_runs',
        description: 'Individual execution checkpoints for stages 1 to 6',
        fields: [
          { name: 'run_id', type: 'UUID', isPrimary: true },
          { name: 'request_id', type: 'UUID', isForeignKey: true, foreignTable: 'dev_requests' },
          { name: 'stage_name', type: 'VARCHAR(32)' },
          { name: 'review_decision', type: 'VARCHAR(16)' },
          { name: 'tokens_used', type: 'INTEGER' },
        ],
      },
      {
        id: 's3',
        tableName: 'architectural_rules',
        description: 'Learned codebase conventions & safety invariants',
        fields: [
          { name: 'rule_id', type: 'INTEGER', isPrimary: true },
          { name: 'scope', type: 'VARCHAR(64)' },
          { name: 'rule_text', type: 'TEXT' },
          { name: 'severity', type: 'VARCHAR(16)' },
        ],
      },
    ],
    rules: [
      { id: 'r1', ruleTitle: 'Repository Layer Isolation', description: 'Never query database models directly from FastAPI route handlers; always access through PipelineRunner services.', scope: 'src/api/*', severity: 'strict', createdAt: '2026-03-01', enforcedBy: 'AST Linter' },
      { id: 'r2', ruleTitle: 'Docker Volume Sandbox Barrier', description: 'Goose agent code generation must restrict write permissions exclusively to the mounted /workspace directory.', scope: 'src/agent/*', severity: 'strict', createdAt: '2026-03-05', enforcedBy: 'Docker Policy' },
      { id: 'r3', ruleTitle: 'Mandatory Human-in-the-Loop on PR', description: 'Stage 6 (PR creation) cannot auto-approve; it requires explicit POST /hil/{id}/approve confirmation.', scope: 'Stage 6', severity: 'strict', createdAt: '2026-03-10', enforcedBy: 'Gate Engine' },
    ],
  },

  'PAY-API': {
    projectId: 'PAY-API',
    repoUrl: 'https://github.com/Astra-Global/payment-microservice',
    branch: 'main',
    lastParsedAt: '10 mins ago',
    totalFiles: 82,
    totalSymbols: 310,
    nodes: [
      { id: 'p1', label: 'POST /v1/webhooks/stripe', type: 'api', file: 'app/api/webhooks.py', line: 24, description: 'Stripe signature verified webhook endpoint', x: 80, y: 100, metrics: { callersCount: 1, calleesCount: 2 } },
      { id: 'p2', label: 'PaymentService.process()', type: 'service', file: 'app/services/payment.py', line: 45, description: 'Core charge and settlement engine', x: 320, y: 100, metrics: { callersCount: 3, calleesCount: 3 } },
      { id: 'p3', label: 'StripeGatewayClient', type: 'service', file: 'app/gateways/stripe.py', line: 12, description: 'SDK wrapper with retry logic', x: 560, y: 40, metrics: { callersCount: 1, calleesCount: 0 } },
      { id: 'p4', label: 'LedgerService', type: 'service', file: 'app/services/ledger.py', line: 33, description: 'Double-entry audit accounting', x: 560, y: 160, metrics: { callersCount: 1, calleesCount: 1 } },
      { id: 'p5', label: 'DB: Transactions', type: 'database', file: 'app/models/transaction.py', line: 20, description: 'Immutable transaction records', x: 820, y: 100, metrics: { callersCount: 3, calleesCount: 0 } },
      { id: 'p6', label: 'test_payment_flow.py', type: 'test', file: 'tests/unit/test_payment.py', line: 1, description: 'Pytest suite for Stripe payment flows', x: 320, y: 280, metrics: { callersCount: 0, calleesCount: 2 } },
    ],
    edges: [
      { id: 'pe1-2', source: 'p1', target: 'p2', label: 'invokes', type: 'calls' },
      { id: 'pe2-3', source: 'p2', target: 'p3', label: 'calls Stripe', type: 'calls' },
      { id: 'pe2-4', source: 'p2', target: 'p4', label: 'records audit', type: 'calls' },
      { id: 'pe4-5', source: 'p4', target: 'p5', label: 'writes ledger', type: 'queries' },
      { id: 'pe6-2', source: 'p6', target: 'p2', label: 'tests', type: 'tests' },
    ],
    schemas: [
      {
        id: 'ps1',
        tableName: 'transactions',
        description: 'Card and bank transfer transactions',
        fields: [
          { name: 'id', type: 'UUID', isPrimary: true },
          { name: 'stripe_charge_id', type: 'VARCHAR(128)', isNullable: false },
          { name: 'amount_cents', type: 'BIGINT', isNullable: false },
          { name: 'currency', type: 'VARCHAR(3)', isNullable: false },
          { name: 'status', type: 'VARCHAR(32)' },
        ],
      },
      {
        id: 'ps2',
        tableName: 'ledger_entries',
        description: 'Double-entry balanced accounting journal',
        fields: [
          { name: 'entry_id', type: 'BIGINT', isPrimary: true },
          { name: 'transaction_id', type: 'UUID', isForeignKey: true, foreignTable: 'transactions' },
          { name: 'account_type', type: 'VARCHAR(32)' },
          { name: 'amount', type: 'DECIMAL(12,2)' },
        ],
      },
    ],
    rules: [
      { id: 'pr1', ruleTitle: 'Idempotency Key Enforcement', description: 'Every Stripe charge API call must pass a unique client idempotency key to prevent double charging.', scope: 'app/gateways/stripe.py', severity: 'strict', createdAt: '2026-02-14', enforcedBy: 'PAY Linter' },
      { id: 'pr2', ruleTitle: 'Decimal Precision for Currency', description: 'Never store or compute currency in float; always use Python Decimal or integer cents.', scope: 'app/models/*', severity: 'strict', createdAt: '2026-02-18', enforcedBy: 'Type Check' },
    ],
  },

  'WEB-PORTAL': {
    projectId: 'WEB-PORTAL',
    repoUrl: 'https://github.com/Astra-Global/customer-web-portal',
    branch: 'main',
    lastParsedAt: '1 hour ago',
    totalFiles: 210,
    totalSymbols: 890,
    nodes: [
      { id: 'w1', label: '<CartModal />', type: 'api', file: 'src/components/CartModal.tsx', line: 15, description: 'React checkout modal component', x: 80, y: 100, metrics: { callersCount: 2, calleesCount: 2 } },
      { id: 'w2', label: 'useCartStore()', type: 'service', file: 'src/store/cartStore.ts', line: 10, description: 'Zustand reactive client state', x: 320, y: 100, metrics: { callersCount: 4, calleesCount: 2 } },
      { id: 'w3', label: 'CheckoutApiClient', type: 'service', file: 'src/api/checkoutClient.ts', line: 22, description: 'Typed fetch client to backend API', x: 560, y: 100, metrics: { callersCount: 1, calleesCount: 0 } },
      { id: 'w4', label: 'LocalStorage: cart_items', type: 'database', file: 'src/store/persistence.ts', line: 8, description: 'Local storage cache for guest users', x: 560, y: 220, metrics: { callersCount: 1, calleesCount: 0 } },
      { id: 'w5', label: 'CartModal.spec.tsx', type: 'test', file: 'src/components/__tests__/Cart.spec.tsx', line: 1, description: 'Vitest + React Testing Library suite', x: 320, y: 280, metrics: { callersCount: 0, calleesCount: 1 } },
    ],
    edges: [
      { id: 'we1-2', source: 'w1', target: 'w2', label: 'binds state', type: 'calls' },
      { id: 'we2-3', source: 'w2', target: 'w3', label: 'submits order', type: 'calls' },
      { id: 'we2-4', source: 'w2', target: 'w4', label: 'persists cache', type: 'queries' },
      { id: 'we5-1', source: 'w5', target: 'w1', label: 'mounts & tests', type: 'tests' },
    ],
    schemas: [
      {
        id: 'ws1',
        tableName: 'CartState (Zustand Schema)',
        description: 'Frontend client shopping cart state',
        fields: [
          { name: 'items', type: 'Array<CartItem>', isPrimary: false },
          { name: 'totalPrice', type: 'number' },
          { name: 'discountCode', type: 'string | null' },
          { name: 'isSubmitting', type: 'boolean' },
        ],
      },
      {
        id: 'ws2',
        tableName: 'CustomerProfile (DTO)',
        description: 'Customer metadata returned from auth session',
        fields: [
          { name: 'userId', type: 'string', isPrimary: true },
          { name: 'email', type: 'string' },
          { name: 'tier', type: 'standard | premium' },
        ],
      },
    ],
    rules: [
      { id: 'wr1', ruleTitle: 'Zod Validation on Form Inputs', description: 'All checkout form inputs must be parsed with CheckoutFormSchema before dispatching network requests.', scope: 'src/components/*', severity: 'strict', createdAt: '2026-01-20', enforcedBy: 'ESLint Rule' },
      { id: 'wr2', ruleTitle: 'No Direct Window.localStorage Calls', description: 'Access localStorage strictly through persistence.ts wrapper for safe SSR and error handling.', scope: 'src/store/*', severity: 'warning', createdAt: '2026-02-01', enforcedBy: 'Code Review' },
    ],
  },
};
