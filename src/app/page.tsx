'use client';

import '@/styles/glassmorphism.css';
import { useState, useEffect, useCallback, useMemo, Suspense, lazy, useRef } from 'react';
import { Toaster, toast } from 'sonner';
import { AnimatePresence } from 'framer-motion';
import { EngineState, Hypothesis, DNAData } from '@/types/project';
import { getStoredApiKey } from '@/lib/api';
import { HypothesisService } from '@/lib/api/hypothesis';
import { StreamingService } from '@/lib/api/streaming';
import { useScoring } from '@/hooks/useScoring';
import { useSync } from '@/hooks/useSync';
import { useSyncToasts } from '@/hooks/useSyncToasts';
import { buildAgentContext } from '@/lib/orchestrator/context-builder';
import { AgentAction } from '@/types/orchestrator';
import { SectionKey } from '@/lib/colors';
import Sidebar from '@/components/Sidebar';
import InputDashboard from '@/components/sections/InputDashboard';
import ProcessingSection from '@/components/sections/ProcessingSection';
import PRDSection from '@/components/sections/PRDSection';
import AutoCoderSection from '@/components/sections/AutoCoderSection';
import ConfirmationModal from '@/components/dashboard/ConfirmationModal';
import UnifiedAgentConsole from '@/components/dashboard/UnifiedAgentConsole';
import HypothesisModal from '@/components/dashboard/HypothesisModal';
import HypothesisColumn from '@/components/dashboard/HypothesisColumn';
import ModalLoading from '@/components/ui/ModalLoading';
import { KeyboardShortcuts } from '@/components/ui/KeyboardShortcuts';

// Lazy load heavy modals
const DNAModal = lazy(() => import('@/components/dashboard/DNAModal'));
const LandingPageModal = lazy(() => import('@/components/dashboard/LandingPageModal'));
const PRDModal = lazy(() => import('@/components/dashboard/PRDModal'));
const ExportModal = lazy(() => import('@/components/dashboard/ExportModal').then(m => ({ default: m.ExportModal })));

export default function Dashboard() {
  const [state, setState] = useState<EngineState>({
    niche: '',
    nicheLocked: false,
    selectedRegions: [],
    avoidedThemes: [],
    autopilotEnabled: false,
    tokenBudget: 10000,
    tokensAvailable: 10000,
    tokensUsed: 0,
    totalTokensSpent: 0,
    tokenRate: 0,
    hypotheses: [],
    solutions: [],
    requirements: [],
    slider: 60,
    problemsScore: 0,
    solutionsScore: 0,
    requirementsUnlocked: false,
    dnaUnlocked: false,
    generatedDNA: null,
    agentRationale: [],
    chatHistory: [],
    prdAssessed: false
  });
  
  // Ref to track current state for use in intervals
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);
  
  // Ref for researchHypothesis to avoid dependency issues
  const researchHypothesisRef = useRef<((h: Hypothesis, c: 'hypotheses' | 'solutions' | 'requirements') => Promise<void>) | null>(null);
  
  // Ref to prevent duplicate initialization in StrictMode
  const initializedRef = useRef(false);
  
  // Ref to track all pending timeouts
  const pendingTimeoutsRef = useRef<NodeJS.Timeout[]>([]);
  
  // Ref to track streaming interval
  const orchestratorIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Helper function to schedule timeouts that tracks them
  const scheduleTimeout = useCallback((callback: () => void, delay: number) => {
    const timeoutId = setTimeout(() => {
      // Remove from tracking after execution
      pendingTimeoutsRef.current = pendingTimeoutsRef.current.filter(id => id !== timeoutId);
      callback();
    }, delay);
    pendingTimeoutsRef.current.push(timeoutId);
    return timeoutId;
  }, []);

  const [apiError, setApiError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<SectionKey>('INPUT');
  const [engineRunning, setEngineRunning] = useState(false);
  const [engineStartTime, setEngineStartTime] = useState<Date | null>(null);
  const [runningTime, setRunningTime] = useState('00:00');
  const [hypothesisService, setHypothesisService] = useState<HypothesisService | null>(null);
  const [streamingService, setStreamingService] = useState<StreamingService | null>(null);
  const [selectedHypothesis, setSelectedHypothesis] = useState<Hypothesis | null>(null);
  const [showDNAModal, setShowDNAModal] = useState(false);
  const [showLandingPageModal, setShowLandingPageModal] = useState(false);
  const [showPRDModal, setShowPRDModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [landingPageHtml, setLandingPageHtml] = useState('');
  const [prdMarkdown, setPrdMarkdown] = useState('');
  const [isGeneratingLandingPage, setIsGeneratingLandingPage] = useState(false);
  const [isGeneratingPRD, setIsGeneratingPRD] = useState(false);
  const [currentRationaleStream, setCurrentRationaleStream] = useState('');
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    hypothesis: Hypothesis | null;
    columnType: 'hypotheses' | 'solutions' | 'requirements';
  }>({
    isOpen: false,
    hypothesis: null,
    columnType: 'hypotheses'
  });
  
  // Track recent messages to prevent duplicates
  const recentMessagesRef = useRef<Set<string>>(new Set());
  
  // Helper to add rationale message (prevents duplicates with Set)
  const addRationale = useCallback((msg: string) => {
    // Normalize message for comparison (first 50 chars)
    const key = msg.substring(0, 50);
    
    if (recentMessagesRef.current.has(key)) return;
    
    recentMessagesRef.current.add(key);
    
    // Clear old messages from Set after 2 seconds
    scheduleTimeout(() => {
      recentMessagesRef.current.delete(key);
    }, 2000);
    
    setState(prev => ({
      ...prev,
      agentRationale: [...prev.agentRationale, msg].slice(-8)
    }));
  }, []);

  // Scoring hook for stage progression
  const scoring = useScoring({
    hypotheses: state.hypotheses,
    solutions: state.solutions,
    requirements: state.requirements,
  });

  // Memoized computed values to prevent unnecessary re-renders
  const validatedProblems = useMemo(
    () => state.hypotheses.filter(h => h.state === 'fact' || h.state === 'validated'),
    [state.hypotheses]
  );

  const validatedSolutions = useMemo(
    () => state.solutions.filter(h => h.state === 'fact' || h.state === 'validated'),
    [state.solutions]
  );

  const validatedRequirements = useMemo(
    () => state.requirements.filter(h => h.state === 'fact' || h.state === 'validated'),
    [state.requirements]
  );

  const problemsScore = useMemo(
    () => state.hypotheses.filter(h => h.state === 'fact').length,
    [state.hypotheses]
  );

  const solutionsScore = useMemo(
    () => state.solutions.filter(h => h.state === 'fact').length,
    [state.solutions]
  );

  const requirementsScore = useMemo(
    () => state.requirements.filter(h => h.state === 'fact').length,
    [state.requirements]
  );

  const canCreateDNA = useMemo(
    () => validatedProblems.length >= 2 && validatedSolutions.length >= 2,
    [validatedProblems.length, validatedSolutions.length]
  );

  // Sync toasts for real-time notifications
  const syncToasts = useSyncToasts();

  // WebSocket sync hook for real-time collaboration
  const [syncEnabled, setSyncEnabled] = useState(false);
  const sync = useSync({
    enabled: syncEnabled,
    wsUrl: 'ws://localhost:3001',
    onHypothesisAdd: useCallback((hypothesis: Hypothesis, column: 'hypotheses' | 'solutions' | 'requirements') => {
      setState(prev => ({
        ...prev,
        [column]: [...prev[column], hypothesis],
      }));
      syncToasts.showHypothesisAdded(column);
    }, [syncToasts]),
    onHypothesisUpdate: useCallback((hypothesis: Hypothesis, column: 'hypotheses' | 'solutions' | 'requirements') => {
      setState(prev => ({
        ...prev,
        [column]: prev[column].map(h => h.id === hypothesis.id ? hypothesis : h),
      }));
      syncToasts.showHypothesisUpdated(column);
    }, [syncToasts]),
    onHypothesisDelete: useCallback((hypothesis: Hypothesis, column: 'hypotheses' | 'solutions' | 'requirements') => {
      setState(prev => ({
        ...prev,
        [column]: prev[column].filter(h => h.id !== hypothesis.id),
      }));
    }, []),
    onStateSync: useCallback((syncState: { hypotheses: Hypothesis[]; solutions: Hypothesis[]; requirements: Hypothesis[] }) => {
      setState(prev => ({
        ...prev,
        hypotheses: syncState.hypotheses,
        solutions: syncState.solutions,
        requirements: syncState.requirements,
      }));
      syncToasts.showStateSynced();
    }, [syncToasts]),
    onUserJoin: useCallback((userId: string) => {
      syncToasts.showUserJoined(userId);
    }, [syncToasts]),
    onUserLeave: useCallback((userId: string) => {
      syncToasts.showUserLeft(userId);
    }, [syncToasts]),
  });

  // Update running time
  useEffect(() => {
    if (!engineRunning || !engineStartTime) {
      setRunningTime('00:00');
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - engineStartTime.getTime()) / 1000);
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      setRunningTime(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [engineRunning, engineStartTime]);

  // Load total spent and stored DNA from localStorage on mount
  useEffect(() => {
    const storedSpent = localStorage.getItem('curatos_total_spent');
    if (storedSpent) {
      setState(prev => ({ ...prev, totalTokensSpent: Number(storedSpent) }));
    }

    const storedDNA = localStorage.getItem('curatos_dna');
    if (storedDNA) {
      try {
        const dnaData = JSON.parse(storedDNA);
        // Convert date string back to Date object
        dnaData.generatedAt = new Date(dnaData.generatedAt);
        setState(prev => ({ ...prev, generatedDNA: dnaData }));
      } catch (error) {
        console.error('Error loading stored DNA:', error);
      }
    }
  }, []);

  // Persist total spent to localStorage
  useEffect(() => {
    localStorage.setItem('curatos_total_spent', state.totalTokensSpent.toString());
  }, [state.totalTokensSpent]);

  // Initialize services on mount (prevent double init in StrictMode)
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    console.log('[Init] Initializing services...');
    setHypothesisService(new HypothesisService('live'));
    setStreamingService(new StreamingService('live'));
    addRationale('Ready');
  }, [addRationale]);

  // Calculate scores and unlock status
  useEffect(() => {
    const problemsScore = state.hypotheses
      .filter(h => h.state === 'fact')
      .reduce((sum, h) => sum + h.confidence, 0);
    
    const solutionsScore = state.solutions
      .filter(h => h.state === 'fact')
      .reduce((sum, h) => sum + h.confidence, 0);
    
    // New progression logic: Problems (3+ green) -> Solutions -> Solutions (3+ green) -> Requirements -> Requirements (3+ green) -> DNA
    const problemsGreenFacts = state.hypotheses.filter(h => h.state === 'fact').length;
    const solutionsGreenFacts = state.solutions.filter(h => h.state === 'fact').length;
    const requirementsGreenFacts = state.requirements.filter(h => h.state === 'fact').length;
    
    const solutionsUnlocked = problemsGreenFacts >= 2;
    const requirementsUnlocked = problemsGreenFacts >= 2 && solutionsGreenFacts >= 2;
    const dnaUnlocked = scoring.canCreateDNA;
    
    setState(prev => ({
      ...prev,
      problemsScore,
      solutionsScore,
      requirementsUnlocked,
      dnaUnlocked
    }));
  }, [state.hypotheses, state.solutions, state.requirements, scoring.canCreateDNA]);

  // Assess if requirements are sufficient for PRD generation
  const assessRequirements = useCallback(async (requirements: Hypothesis[], niche: string): Promise<{ sufficient: boolean; missing: string[] }> => {
    const apiKey = getStoredApiKey();
    if (!apiKey) {
      return { sufficient: false, missing: ['API key required'] };
    }

    const reqList = requirements.map((r, i) => `${i + 1}. ${r.text}`).join('\n');
    
    const prompt = `You are a software architect reviewing requirements for a ${niche} app. Here are the current requirements:

${reqList}

Are these SUFFICIENT to build a complete, production-ready app? If NOT sufficient, respond with JSON: {"sufficient": false, "missing": ["FR: ...", "NFR: ..."]}.
If sufficient, respond with JSON: {"sufficient": true, "missing": []}.

Respond ONLY with valid JSON, no other text.`;

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-r1-0528:free',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
        }),
      });

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '{"sufficient": true, "missing": []}';
      
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const result = jsonMatch ? JSON.parse(jsonMatch[0]) : { sufficient: true, missing: [] };
      
      return result;
    } catch (error) {
      console.error('[AUTO-PRD] Assessment error:', error);
      return { sufficient: true, missing: [] }; // Fail open
    }
  }, []);

  // AUTO-PRD: Assess requirements when threshold reached
  useEffect(() => {
    const validatedProblems = state.hypotheses.filter(h => h.state === 'fact').length;
    const validatedSolutions = state.solutions.filter(h => h.state === 'fact').length;
    const requirementsCount = state.requirements.length;
    
    // Trigger when: 15+ requirements AND 2+ validated problems AND 2+ validated solutions
    const shouldAssess = requirementsCount >= 15 && validatedProblems >= 2 && validatedSolutions >= 2;
    
    if (shouldAssess && !state.prdAssessed && hypothesisService) {
      console.log('[AUTO-PRD] Threshold reached - assessing requirements...');
      setState(prev => ({ ...prev, prdAssessed: true })); // Prevent re-assessment
      
      addRationale('Assessing requirements for PRD...');
      
      // Assess and handle result
      (async () => {
        const assessment = await assessRequirements(state.requirements, state.niche);
        
        if (!assessment.sufficient && assessment.missing.length > 0) {
          console.log('[AUTO-PRD] Missing requirements:', assessment.missing);
          addRationale(`Missing ${assessment.missing.length} requirements - generating...`);
          
          // Generate missing requirements
          for (const missingReq of assessment.missing) {
            const type = missingReq.startsWith('NFR:') ? 'non-functional' : 'functional';
            const text = missingReq.replace(/^(FR:|NFR:)\s*/, '');
            
            // Check for duplicates
            const isDuplicate = stateRef.current.requirements.some(r => 
              r.text.toLowerCase().trim() === text.toLowerCase().trim()
            );
            
            if (isDuplicate) continue;
            
            const newReq: Hypothesis = {
              id: `req-${Date.now()}-${Math.random()}`,
              text,
              type: type as 'functional' | 'non-functional',
              state: 'hypothesis',
              confidence: 0,
              sources: [],
              status: 'pending',
              createdAt: new Date()
            };
            
            setState(prev => ({
              ...prev,
              requirements: [...prev.requirements, newReq]
            }));
            
            // Research the new requirement
            scheduleTimeout(() => researchHypothesisRef.current?.(newReq, 'requirements'), 300);
          }
        } else {
          console.log('[AUTO-PRD] Requirements sufficient - generating PRD...');
          addRationale('✓ Requirements sufficient - generating PRD...');
          
          // Auto-generate PRD
          scheduleTimeout(() => {
            handleGeneratePRD();
          }, 1000);
        }
      })();
    }
  }, [state.requirements.length, state.hypotheses, state.solutions, state.prdAssessed, state.requirements, state.niche, hypothesisService, assessRequirements, addRationale]);

  // Agent orchestrator loop
  useEffect(() => {
    if (!engineRunning || !hypothesisService) {
      // Clear interval if engine stopped
      if (orchestratorIntervalRef.current) {
        clearInterval(orchestratorIntervalRef.current);
        orchestratorIntervalRef.current = null;
      }
      return;
    }

    const interval = setInterval(async () => {
      try {
        // 1. Build context from current state
        const context = buildAgentContext(stateRef.current);
        
        // 2. Call orchestrator API
        const apiKey = getStoredApiKey();
        console.log('[Orchestrator] API key check:', apiKey);
        if (!apiKey) {
          console.log('[Orchestrator] No API key, skipping');
          return;
        }
        
        const response = await fetch('/api/agent/orchestrate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ context, apiKey })
        });
        
        if (!response.ok) return;
        
        const { thought, action, parameters } = await response.json();
        
        // 3. Display agent thought
        if (thought) {
          addRationale(thought);
        }
        
        // 4. Execute the action
        switch (action) {
          case AgentAction.GENERATE_PROBLEM:
            if (hypothesisService) {
              const newProblems = await hypothesisService.generateHypotheses(stateRef.current.niche, 'problems', 1);
              if (newProblems.length > 0) {
                setState(prev => ({
                  ...prev,
                  hypotheses: [...prev.hypotheses, { ...newProblems[0], status: 'pending' }]
                }));
                scheduleTimeout(() => researchHypothesisRef.current?.(newProblems[0], 'hypotheses'), 500);
              }
            }
            break;
            
          case AgentAction.GENERATE_SOLUTION:
            if (hypothesisService && parameters?.problemId) {
              const problem = stateRef.current.hypotheses.find(h => h.id === parameters.problemId);
              if (problem) {
                const newSolutions = await hypothesisService.generateSolutionForProblem(
                  stateRef.current.niche, 
                  problem.text, 
                  problem.id
                );
                if (newSolutions.length > 0) {
                  setState(prev => ({
                    ...prev,
                    solutions: [...prev.solutions, { ...newSolutions[0], status: 'pending' }]
                  }));
                  scheduleTimeout(() => researchHypothesisRef.current?.(newSolutions[0], 'solutions'), 500);
                }
              }
            }
            break;
            
          case AgentAction.GENERATE_REQUIREMENT:
            if (hypothesisService && parameters?.solutionId) {
              const solution = stateRef.current.solutions.find(s => s.id === parameters.solutionId);
              if (solution) {
                const newReqs = await hypothesisService.generateRequirementForSolution(
                  stateRef.current.niche,
                  solution.text,
                  solution.id
                );
                if (newReqs.length > 0) {
                  setState(prev => ({
                    ...prev,
                    requirements: [...prev.requirements, { ...newReqs[0], status: 'pending' }]
                  }));
                  scheduleTimeout(() => researchHypothesisRef.current?.(newReqs[0], 'requirements'), 500);
                }
              }
            }
            break;
            
          case AgentAction.RESEARCH_CARD:
            if (parameters?.cardId) {
              const card = [...stateRef.current.hypotheses, ...stateRef.current.solutions, ...stateRef.current.requirements]
                .find(c => c.id === parameters.cardId);
              if (card) {
                const column = stateRef.current.hypotheses.includes(card) ? 'hypotheses' :
                             stateRef.current.solutions.includes(card) ? 'solutions' : 'requirements';
                researchHypothesisRef.current?.(card, column);
              }
            }
            break;
            
          case AgentAction.GENERATE_PRD:
            handleGeneratePRD();
            break;
            
          case AgentAction.THINK:
          case AgentAction.WAIT:
          default:
            // No action needed
            break;
        }
        
      } catch (error) {
        console.error('Orchestrator loop error:', error);
      }
    }, 6000); // Every 6 seconds

    orchestratorIntervalRef.current = interval;

    return () => {
      clearInterval(interval);
      orchestratorIntervalRef.current = null;
    };
  }, [engineRunning, hypothesisService, addRationale, scheduleTimeout]);

  // Helper function to research a hypothesis with paced API status updates
  const researchHypothesis = useCallback(async (hypothesis: Hypothesis, column: 'hypotheses' | 'solutions' | 'requirements') => {
    if (!hypothesisService) return;
    
    // Skip if already researching or complete
    const current = stateRef.current[column].find(h => h.id === hypothesis.id);
    if (!current || current.status === 'downloading' || current.status === 'analyzing' || current.status === 'complete') {
      return;
    }
    
    // Set status to downloading
    setState(prev => ({
      ...prev,
      [column]: prev[column].map(h => h.id === hypothesis.id ? { ...h, status: 'downloading' as const } : h)
    }));
    
    // Show API status updates
    addRationale(`[SEARCHING] Querying Serper API...`);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    addRationale(`[FOUND] Analyzing web results...`);
    await new Promise(resolve => setTimeout(resolve, 600));
    
    try {
      const result = await hypothesisService.researchHypothesis(hypothesis, stateRef.current.niche, column === 'hypotheses');
      
      // Show research findings before displaying confidence
      if (result.sources.length > 0) {
        const sourceCount = result.sources.length;
        addRationale(`[VALIDATING] Found ${sourceCount} sources`);
        
        // Show key finding
        const firstSource = result.sources[0];
        const domain = firstSource.split('|||')[0].replace(/\[.*?\]/g, '').trim();
        addRationale(`[EVIDENCE] ${domain}: "${firstSource.split('|||')[1]?.substring(0, 40) || 'Supporting evidence'}..."`);
        
        await new Promise(resolve => setTimeout(resolve, 400));
      }
      
      const isFact = result.confidence >= 90;
      const updatedHypothesis = { 
        ...hypothesis, 
        state: isFact ? 'fact' as const : 'hypothesis' as const, 
        confidence: result.confidence, 
        sources: result.sources,
        status: 'complete' as const
      };
      
      setState(prev => ({
        ...prev,
        [column]: prev[column].map(h => h.id === hypothesis.id ? updatedHypothesis : h)
      }));
      addRationale(`[VALIDATED] ${isFact ? `✓ FACT ${result.confidence}%` : `○ ${result.confidence}%`}`);
      
      // CHAINED HYPOTHESIS SYSTEM
      if (column === 'hypotheses' && result.confidence >= 70) {
        // Problem validated - generate solution for this problem
        setTimeout(async () => {
          try {
            addRationale(`[CHAINING] Generating solution for problem...`);
            const newSolutions = await hypothesisService.generateSolutionForProblem(stateRef.current.niche, hypothesis.text, hypothesis.id);
            const newSolution = newSolutions[0];
            
            // Check for duplicates
            const isDuplicate = stateRef.current.solutions.some(s =>
              s.text.toLowerCase().trim() === newSolution.text.toLowerCase().trim()
            );
            
            if (!isDuplicate) {
              setState(prev => ({
                ...prev,
                solutions: [...prev.solutions, { ...newSolution, status: 'pending' as const }]
              }));
              setTimeout(() => researchHypothesisRef.current?.(newSolution, 'solutions'), 2000);
            }
          } catch (e) { console.error('Chain solution error:', e); }
        }, 1500);
      }
      
      if (column === 'solutions') {
        if (result.confidence < 70) {
          // Solution failed - increment parent problem attempts and retry
          const parentProblem = stateRef.current.hypotheses.find(p => p.id === hypothesis.parentProblemId);
          if (parentProblem) {
            const attempts = (parentProblem.solutionAttempts || 0) + 1;
            
            setState(prev => ({
              ...prev,
              hypotheses: prev.hypotheses.map(p => 
                p.id === parentProblem.id 
                  ? { ...p, solutionAttempts: attempts, status: attempts >= 3 ? 'not_solvable' as const : p.status }
                  : p
              )
            }));
            
            if (attempts < 3) {
              addRationale(`[RETRY] Solution failed, generating new one (${attempts}/3)...`);
              setTimeout(async () => {
                try {
                  const newSolutions = await hypothesisService.generateSolutionForProblem(stateRef.current.niche, parentProblem.text, parentProblem.id);
                  const newSolution = newSolutions[0];
                  setState(prev => ({
                    ...prev,
                    solutions: [...prev.solutions, { ...newSolution, status: 'pending' as const }]
                  }));
                  setTimeout(() => researchHypothesisRef.current?.(newSolution, 'solutions'), 2000);
                } catch (e) { console.error('Retry solution error:', e); }
              }, 1500);
            } else {
              addRationale(`[FAILED] Problem marked as not solvable after 3 attempts`);
            }
          }
        } else {
          // Solution validated - check if we have 3+ validated solutions to generate requirements
          const validatedSolutions = stateRef.current.solutions.filter(s => s.state === 'fact').length + 1; // +1 for current
          if (validatedSolutions >= 3) {
            setTimeout(async () => {
              try {
                addRationale(`[CHAINING] Generating requirement from solutions...`);
                const newRequirements = await hypothesisService.generateRequirementForSolution(stateRef.current.niche, hypothesis.text, hypothesis.id);
                const newRequirement = newRequirements[0];
                
                const isDuplicate = stateRef.current.requirements.some(r => 
                  r.text.toLowerCase().trim() === newRequirement.text.toLowerCase().trim()
                );
                
                if (!isDuplicate) {
                  setState(prev => ({
                    ...prev,
                    requirements: [...prev.requirements, { ...newRequirement, status: 'pending' as const }]
                  }));
                  setTimeout(() => researchHypothesisRef.current?.(newRequirement, 'requirements'), 2000);
                }
              } catch (e) { console.error('Chain requirement error:', e); }
            }, 1500);
          }
        }
      }
    } catch (error) {
      console.error('[Research] Error:', error);
      setState(prev => ({
        ...prev,
        [column]: prev[column].map(h => h.id === hypothesis.id ? { ...h, status: 'complete' as const } : h)
      }));
      addRationale(`[ERROR] Research failed`);
    }
  }, [hypothesisService, addRationale]);
  
  // Keep ref updated
  useEffect(() => { researchHypothesisRef.current = researchHypothesis; }, [researchHypothesis]);

  // Engine logic - dynamic speed based on completion
  useEffect(() => {
    if (!engineRunning || !hypothesisService) return;
    
    let timeoutId: NodeJS.Timeout;

    const generateAndResearch = async () => {
      const currentNiche = stateRef.current.niche;
      if (!currentNiche) return;
      
      const currentState = stateRef.current;
      const problemsFacts = currentState.hypotheses.filter(h => h.state === 'fact').length;
      const solutionsFacts = currentState.solutions.filter(h => h.state === 'fact').length;
      const requirementsFacts = currentState.requirements.filter(h => h.state === 'fact').length;
      const allComplete = problemsFacts >= 4 && solutionsFacts >= 4 && requirementsFacts >= 15;
      
      // Dynamic interval: slower for more deliberate feel
      const nextInterval = allComplete ? 5000 : 2500;
      
      // Update tokens (slower when complete)
      setState(prev => {
        const tokensUsed = allComplete ? 1 : Math.floor(Math.random() * 10) + 5;
        return {
          ...prev,
          tokensAvailable: Math.max(0, prev.tokensAvailable - tokensUsed),
          tokensUsed: prev.tokensUsed + tokensUsed,
          totalTokensSpent: prev.totalTokensSpent + tokensUsed,
          tokenRate: tokensUsed
        };
      });

      // Skip generation if all complete
      if (!allComplete && Math.random() < 0.85) {
        const problemsCount = currentState.hypotheses.length;
        
        const shouldGenerateProblem = problemsCount < 4;
        
        try {
          if (shouldGenerateProblem) {
            addRationale(`[HYPOTHESIS] Generating problem...`);
            await new Promise(resolve => setTimeout(resolve, 800));
            
            const newProblems = await hypothesisService.generateHypotheses(currentNiche, 'problems', 1);
            const newProblem = { ...newProblems[0], status: 'pending' as const };
            
            // Check for duplicates
            const isDuplicate = stateRef.current.hypotheses.some(h =>
              h.text.toLowerCase().trim() === newProblem.text.toLowerCase().trim()
            );
            
            if (!isDuplicate) {
              setState(prev => ({
                ...prev,
                hypotheses: [...prev.hypotheses, newProblem].slice(0, 4)
              }));
              addRationale(`+ Problem: "${newProblem.text.substring(0, 35)}..."`);
              
              // Add 2-second delay before research
              setTimeout(() => researchHypothesisRef.current?.(newProblem, 'hypotheses'), 2000);
            }
          }
        } catch (error) {
          console.error('Generation error:', error);
          addRationale(`[ERROR] Generation failed`);
        }
      }
      
      // Research pending hypotheses - MAX 1 researching at once per column for paced flow
      const researchingProblems = currentState.hypotheses.filter(h => h.status === 'downloading' || h.status === 'analyzing').length;
      const researchingSolutions = currentState.solutions.filter(h => h.status === 'downloading' || h.status === 'analyzing').length;
      const researchingRequirements = currentState.requirements.filter(h => h.status === 'downloading' || h.status === 'analyzing').length;
      
      const pendingProblems = currentState.hypotheses.filter(h => h.status === 'pending' && h.confidence === 0);
      const pendingSolutions = currentState.solutions.filter(h => h.status === 'pending' && h.confidence === 0);
      const pendingRequirements = currentState.requirements.filter(h => h.status === 'pending' && h.confidence === 0);
      
      if (pendingProblems.length > 0 && researchingProblems < 1) researchHypothesisRef.current?.(pendingProblems[0], 'hypotheses');
      if (pendingSolutions.length > 0 && researchingSolutions < 1) researchHypothesisRef.current?.(pendingSolutions[0], 'solutions');
      if (pendingRequirements.length > 0 && researchingRequirements < 1) researchHypothesisRef.current?.(pendingRequirements[0], 'requirements');
      if (pendingRequirements.length > 0 && researchingRequirements < 2) researchHypothesisRef.current?.(pendingRequirements[0], 'requirements' as any);
      
      // Schedule next run with dynamic interval
      timeoutId = setTimeout(generateAndResearch, nextInterval);
    };

    generateAndResearch();
    return () => clearTimeout(timeoutId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engineRunning, hypothesisService]);

  const handleStartEngine = useCallback(() => {
    if (!state.niche.trim()) {
      toast.error('Enter a niche first');
      return;
    }
    setEngineRunning(true);
    setEngineStartTime(new Date());
  }, [state.niche]);

  const handleStopEngine = useCallback(() => {
    setEngineRunning(false);
    setEngineStartTime(null);
    setState(prev => ({ ...prev, tokenRate: 0 }));
    // Clear all pending timeouts
    pendingTimeoutsRef.current.forEach(clearTimeout);
    pendingTimeoutsRef.current = [];
    // Clear orchestrator interval
    if (orchestratorIntervalRef.current) {
      clearInterval(orchestratorIntervalRef.current);
      orchestratorIntervalRef.current = null;
    }
  }, []);

  const handleEngineToggle = useCallback(() => {
    if (engineRunning) {
      handleStopEngine();
    } else {
      handleStartEngine();
    }
  }, [engineRunning, handleStartEngine, handleStopEngine]);

  const handleNicheChange = useCallback((niche: string) => {
    setState(prev => ({ ...prev, niche }));
  }, []);

  const handleNicheLockToggle = useCallback(() => {
    setState(prev => ({ ...prev, nicheLocked: !prev.nicheLocked }));
  }, []);

  const handleRegionsChange = useCallback((regions: string[]) => {
    setState(prev => ({ ...prev, selectedRegions: regions }));
  }, []);

  const handleItemClick = useCallback((hypothesis: Hypothesis) => {
    setSelectedHypothesis(hypothesis);
  }, []);

  const handleModalClose = useCallback(() => {
    setSelectedHypothesis(null);
  }, []);

  const removeHypothesis = useCallback((hypothesis: Hypothesis, columnType: 'hypotheses' | 'solutions' | 'requirements') => {
    setState(prev => ({
      ...prev,
      [columnType]: prev[columnType].filter(h => h.id !== hypothesis.id),
      avoidedThemes: [...prev.avoidedThemes, hypothesis.text]
    }));
  }, []);

  const handleItemRemove = useCallback((hypothesis: Hypothesis, columnType: 'hypotheses' | 'solutions' | 'requirements') => {
    const skipConfirmation = localStorage.getItem('skipRemovalConfirmation') === 'true';
    
    if (skipConfirmation) {
      removeHypothesis(hypothesis, columnType);
    } else {
      setConfirmationModal({
        isOpen: true,
        hypothesis,
        columnType
      });
    }
  }, [removeHypothesis]);

  const handleConfirmRemoval = useCallback((skipFuture: boolean) => {
    if (skipFuture) {
      localStorage.setItem('skipRemovalConfirmation', 'true');
    }
    
    if (confirmationModal.hypothesis) {
      removeHypothesis(confirmationModal.hypothesis, confirmationModal.columnType);
    }
    
    setConfirmationModal({ isOpen: false, hypothesis: null, columnType: 'hypotheses' });
  }, [confirmationModal.hypothesis, confirmationModal.columnType, removeHypothesis]);

  const handleCancelRemoval = useCallback(() => {
    setConfirmationModal({ isOpen: false, hypothesis: null, columnType: 'hypotheses' });
  }, []);

  const handleAutopilotToggle = () => {
    setState(prev => ({ ...prev, autopilotEnabled: !prev.autopilotEnabled }));
    
    if (!state.autopilotEnabled) {
      // Autopilot activated - start the magic
      addRationale('Autopilot engaged');
      
      // Auto-configure settings with animations
      setTimeout(() => typewriterNiche(), 500);
      setTimeout(() => animateGeoSelection(), 2500);
      setTimeout(() => animateSlider(), 4000);
      setTimeout(() => {
        if (!engineRunning) {
          handleStartEngine();
        }
      }, 5500);
    }
  };

  const typewriterNiche = () => {
    const niches = ['fintech payments', 'ai saas tools', 'healthcare tech', 'climate solutions', 'developer tools'];
    const selectedNiche = niches[Math.floor(Math.random() * niches.length)];
    
    let i = 0;
    const typeInterval = setInterval(() => {
      setState(prev => ({ ...prev, niche: selectedNiche.slice(0, i) }));
      i++;
      if (i > selectedNiche.length) {
        clearInterval(typeInterval);
        setState(prev => ({
          ...prev,
          nicheLocked: true
        }));
      }
    }, 100);
  };

  const animateGeoSelection = () => {
    const regions = ['US', 'GB', 'DE'];
    
    regions.forEach((region, index) => {
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          selectedRegions: Array.from(new Set([...prev.selectedRegions, region]))
        }));
      }, index * 800);
    });
  };

  const animateSlider = () => {
    
    const targetValue = 70;
    const currentValue = state.slider;
    const steps = 20;
    const increment = (targetValue - currentValue) / steps;
    
    let step = 0;
    const sliderInterval = setInterval(() => {
      setState(prev => ({ 
        ...prev, 
        slider: Math.round(currentValue + (increment * step))
      }));
      step++;
      if (step > steps) {
        clearInterval(sliderInterval);
      }
    }, 100);
  };

  const handleSliderChange = (value: number) => {
    setState(prev => ({ ...prev, slider: value }));
  };

  const handleTokenBudgetChange = (budget: number) => {
    setState(prev => ({ 
      ...prev, 
      tokenBudget: budget,
      tokensAvailable: budget - prev.tokensUsed
    }));
  };

  const handleSendMessage = (message: string) => {
    const userMessage = {
      role: 'user' as const,
      message,
      timestamp: new Date()
    };
    
    const agentResponse = {
      role: 'agent' as const,
      message: `Understood. I'll ${message.toLowerCase().includes('focus') ? 'adjust focus' : 'incorporate that guidance'}.`,
      timestamp: new Date()
    };

    setState(prev => ({
      ...prev,
      chatHistory: [...prev.chatHistory, userMessage, agentResponse].slice(-20)
    }));
  };

  const handleCreateDNA = async () => {
    const validatedProblems = state.hypotheses.filter(h => h.state === 'fact');
    const validatedSolutions = state.solutions.filter(h => h.state === 'fact');
    const validatedRequirements = state.requirements.filter(h => h.state === 'fact');

    const dnaData: DNAData = {
      niche: state.niche || 'fintech payments',
      generatedAt: new Date(),
      problems: validatedProblems,
      solutions: validatedSolutions,
      requirements: validatedRequirements,
      tokenCost: state.totalTokensSpent
    };

    try {
      setState(prev => ({ 
        ...prev, 
        generatedDNA: dnaData
      }));
      localStorage.setItem('curatos_dna', JSON.stringify(dnaData));
    } catch (error) {
      console.error('Error saving DNA:', error);
      toast.error('Failed to save DNA', { description: 'LocalStorage may be full' });
    }
    
    setShowDNAModal(true);
  };

  const handleGenerateLandingPage = async () => {
    if (!streamingService) {
      toast.error('Service not initialized', { description: 'Please refresh the page' });
      return;
    }

    setIsGeneratingLandingPage(true);
    addRationale('Generating landing page...');

    try {
      const validatedProblems = state.hypotheses.filter(h => h.state === 'fact');
      const validatedSolutions = state.solutions.filter(h => h.state === 'fact');

      const html = await streamingService.generateLandingPage(
        state.niche,
        validatedProblems,
        validatedSolutions
      );

      setLandingPageHtml(html);
      setShowDNAModal(false);
      setShowLandingPageModal(true);
      addRationale('✓ Landing page ready');
    } catch (error) {
      console.error('Landing page generation failed:', error);
      toast.error('Landing page generation failed', { description: String(error) });
      addRationale('✗ LP generation failed');
    } finally {
      setIsGeneratingLandingPage(false);
    }
  };

  const handleGeneratePRD = async () => {
    if (!streamingService) {
      toast.error('Service not initialized', { description: 'Please refresh the page' });
      return;
    }

    setIsGeneratingPRD(true);
    addRationale('Generating PRD...');

    try {
      const validatedProblems = state.hypotheses.filter(h => h.state === 'fact');
      const validatedSolutions = state.solutions.filter(h => h.state === 'fact');

      const markdown = await streamingService.generatePRD(
        state.niche,
        validatedProblems,
        validatedSolutions
      );

      setPrdMarkdown(markdown);
      setShowDNAModal(false);
      setShowPRDModal(true);
      addRationale('✓ PRD ready');
    } catch (error) {
      console.error('PRD generation failed:', error);
      toast.error('PRD generation failed', { description: String(error) });
      addRationale('✗ PRD generation failed');
    } finally {
      setIsGeneratingPRD(false);
    }
  };

  const handleDNAModalClose = () => {
    setShowDNAModal(false);
  };

  const handleStartBuild = () => {
    console.log('Starting build phase...');
    // TODO: Navigate to build phase
    setShowDNAModal(false);
  };

  const handleExportDNA = () => {
    if (!state.generatedDNA) return;

    const dna = state.generatedDNA;
    const markdown = generateDNAMarkdown(dna);
    
    // Create and download file
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${dna.niche.replace(/\s+/g, '-').toLowerCase()}-dna.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateDNAMarkdown = (dna: DNAData): string => {
    const formatDate = (date: Date) => date.toLocaleDateString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    });

    return `# ${dna.niche.toUpperCase()} - Product DNA

> **Generated:** ${formatDate(dna.generatedAt)}
> **Token Cost:** ${dna.tokenCost.toLocaleString()}

---

## Validated Problems (${dna.problems.length})

${dna.problems.map(p => `- **${p.text}** (${p.confidence}% confidence)`).join('\n')}

---

## Validated Solutions (${dna.solutions.length})

${dna.solutions.map(s => `- **${s.text}** (${s.confidence}% confidence)`).join('\n')}

---

## Requirements (${dna.requirements.length})

${dna.requirements.map(r => `- **[${r.type === 'functional' ? 'F' : 'NF'}]** ${r.text} (${r.confidence}% confidence)`).join('\n')}

---

## Summary

This DNA contains ${dna.problems.length + dna.solutions.length + dna.requirements.length} validated hypotheses ready for product development.

**Next Steps:**
1. Review and prioritize features
2. Create technical architecture
3. Begin development sprint planning

---

*Generated by Curatos - Autonomous AI Hypothesis Engine*
`;
  };

  const countGreenFacts = () => {
    const count = state.hypotheses.filter(h => h.state === 'fact').length;
    console.log('[DEBUG] countGreenFacts:', count);
    return count;
  };

  const countSolutionsGreenFacts = () => {
    const count = state.solutions.filter(h => h.state === 'fact').length;
    console.log('[DEBUG] countSolutionsGreenFacts:', count);
    return count;
  };

  const countRequirementsGreenFacts = () => {
    const count = state.requirements.filter(h => h.state === 'fact').length;
    console.log('[DEBUG] countRequirementsGreenFacts:', count);
    return count;
  };

  const getProvider = () => 'openrouter';
  const getModel = () => 'deepseek-chat';

  const getActiveColumns = () => {
    const columns = ['problems', 'solutions'];
    if (state.requirementsUnlocked) columns.push('requirements');
    return columns;
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      
      {/* Main Content with offset for sidebar */}
      <main className="flex-1 ml-16 sm:ml-20">
        <AnimatePresence mode="wait">
          {activeSection === 'INPUT' && (
            <InputDashboard
              key="input"
              apiKey={getStoredApiKey() || ''}
              niche={state.niche}
              onApiKeyChange={(key) => {
                localStorage.setItem('openrouter_api_key', key);
                if (key) {
                  setHypothesisService(new HypothesisService(key));
                  setStreamingService(new StreamingService(key));
                }
              }}
              onNicheChange={(niche) => setState(prev => ({ ...prev, niche }))}
              onStartProcessing={() => {
                setActiveSection('PROCESSING');
                handleEngineToggle();
              }}
              isProcessing={engineRunning}
            />
          )}
          
          {activeSection === 'PROCESSING' && (
            <ProcessingSection
              key="processing"
              isOnline={!!hypothesisService}
              isProcessing={engineRunning}
            >
              {/* Agent Console */}
              <div className="mb-6">
                <UnifiedAgentConsole
                  rationale={[...state.agentRationale, currentRationaleStream].filter(Boolean)}
                  onSendMessage={handleSendMessage}
                  disabled={!engineRunning}
                />
              </div>
              
              {/* Hypothesis columns - stack on mobile, row on desktop */}
              <div className="flex flex-col md:flex-row gap-4">
                <HypothesisColumn
                  title="problems"
                  hypotheses={state.hypotheses}
                  score={state.problemsScore}
                  percentage={state.slider}
                  validatedCount={countGreenFacts()}
                  requiredCount={3}
                  onItemClick={handleItemClick}
                  onItemRemove={(h) => handleItemRemove(h, 'hypotheses')}
                />
                
                <HypothesisColumn
                  title="solutions"
                  hypotheses={state.solutions}
                  score={state.solutionsScore}
                  percentage={100 - state.slider}
                  locked={countGreenFacts() < 2}
                  validatedCount={countSolutionsGreenFacts()}
                  requiredCount={2}
                  onItemClick={handleItemClick}
                  onItemRemove={(h) => handleItemRemove(h, 'solutions')}
                />
                
                <HypothesisColumn
                  title="requirements"
                  hypotheses={state.requirements}
                  score={state.requirements.filter(h => h.state === 'fact').reduce((sum, h) => sum + h.confidence, 0)}
                  locked={!(countGreenFacts() >= 2 && countSolutionsGreenFacts() >= 2)}
                  validatedCount={countRequirementsGreenFacts()}
                  requiredCount={2}
                  onItemClick={handleItemClick}
                  onItemRemove={(h) => handleItemRemove(h, 'requirements')}
                />
              </div>
            </ProcessingSection>
          )}
          
          {activeSection === 'PRD' && (
            <PRDSection
              key="prd"
              prdContent={prdMarkdown}
              isGenerating={isGeneratingPRD}
              onGenerate={handleGeneratePRD}
              canGenerate={validatedProblems.length >= 3 && validatedSolutions.length >= 3}
            />
          )}
          
          {activeSection === 'AUTOCODER' && (
            <AutoCoderSection key="autocoder" />
          )}
        </AnimatePresence>
      </main>
      
      {/* Modals - rendered outside sections */}
      <HypothesisModal
        hypothesis={selectedHypothesis}
        onClose={handleModalClose}
      />
      
      {/* Lazy loaded modals with Suspense */}
      <Suspense fallback={<ModalLoading message="Loading DNA Modal..." />}>
        {showDNAModal && (
          <DNAModal
            dna={state.generatedDNA}
            onClose={handleDNAModalClose}
            onStartBuild={handleStartBuild}
            onExport={handleExportDNA}
            onGenerateLandingPage={handleGenerateLandingPage}
            onGeneratePRD={handleGeneratePRD}
            isGeneratingLandingPage={isGeneratingLandingPage}
            isGeneratingPRD={isGeneratingPRD}
          />
        )}
      </Suspense>

      <Suspense fallback={<ModalLoading message="Loading Landing Page..." />}>
        {showLandingPageModal && (
          <LandingPageModal
            isOpen={showLandingPageModal}
            onClose={() => setShowLandingPageModal(false)}
            problems={validatedProblems}
            solutions={validatedSolutions}
            niche={state.niche}
            html={landingPageHtml}
          />
        )}
      </Suspense>

      <Suspense fallback={<ModalLoading message="Loading PRD..." />}>
        {showPRDModal && (
          <PRDModal
            isOpen={showPRDModal}
            onClose={() => setShowPRDModal(false)}
            problems={validatedProblems}
            solutions={validatedSolutions}
            niche={state.niche}
            markdown={prdMarkdown}
          />
        )}
      </Suspense>

      <Suspense fallback={<ModalLoading message="Loading Export..." />}>
        {showExportModal && (
          <ExportModal
            isOpen={showExportModal}
            onClose={() => setShowExportModal(false)}
            niche={state.niche}
            hypotheses={state.hypotheses}
            solutions={state.solutions}
            prdContent={prdMarkdown || undefined}
            landingPageHTML={landingPageHtml || undefined}
          />
        )}
      </Suspense>
      
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        title="Remove Hypothesis?"
        message="This hypothesis and related themes will be avoided in future AI generations"
        onConfirm={handleConfirmRemoval}
        onCancel={handleCancelRemoval}
      />

      {/* Keyboard Shortcuts */}
      <KeyboardShortcuts
        onExport={() => setShowExportModal(true)}
      />
      
      {/* Toast Notifications */}
      <Toaster 
        position="top-right" 
        theme="dark"
        toastOptions={{
          style: {
            background: 'rgba(26, 26, 36, 0.95)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            backdropFilter: 'blur(12px)',
            color: 'var(--text-primary-color)',
          },
          className: 'font-mono text-sm',
        }}
      />
    </div>
  );
}
