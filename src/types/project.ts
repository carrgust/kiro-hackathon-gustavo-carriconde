export type HypothesisState = 'hypothesis' | 'fact';

export interface Hypothesis {
  id: string;
  text: string;
  state: HypothesisState;
  confidence: number; // 0-100
  sources?: string[];
  type?: 'functional' | 'non-functional'; // For requirements column
  createdAt: Date;
}

export interface ChatMessage {
  role: 'user' | 'agent';
  message: string;
  timestamp: Date;
}

export interface DNAData {
  niche: string;
  generatedAt: Date;
  problems: Hypothesis[];
  solutions: Hypothesis[];
  requirements: Hypothesis[];
  tokenCost: number;
}

export interface EngineState {
  niche: string;
  nicheLocked: boolean;
  selectedRegions: string[];
  avoidedThemes: string[];
  autopilotEnabled: boolean;
  tokenBudget: number;
  tokensAvailable: number;
  tokensUsed: number;
  totalTokensSpent: number;
  tokenRate: number;
  hypotheses: Hypothesis[];
  solutions: Hypothesis[];
  requirements: Hypothesis[];
  slider: number; // 0-100, problems vs solutions focus
  problemsScore: number;
  solutionsScore: number;
  requirementsUnlocked: boolean;
  dnaUnlocked: boolean;
  generatedDNA: DNAData | null;
  agentRationale: string[];
  chatHistory: ChatMessage[];
}
