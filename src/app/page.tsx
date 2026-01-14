'use client';

import { useState, useEffect } from 'react';
import { EngineState, Hypothesis, DNAData } from '@/types/project';
import { getStoredApiKey } from '@/lib/api';
import { HypothesisService } from '@/lib/api/hypothesis';
import { StreamingService } from '@/lib/api/streaming';
import ConfirmationModal from '@/components/dashboard/ConfirmationModal';
import EnhancedHeader from '@/components/dashboard/EnhancedHeader';
import AgentRationale from '@/components/dashboard/AgentRationale';
import ChatInterface from '@/components/dashboard/ChatInterface';
import RadarEqualizer from '@/components/dashboard/RadarEqualizer';
import HypothesisModal from '@/components/dashboard/HypothesisModal';
import DNAModal from '@/components/dashboard/DNAModal';
import LandingPageModal from '@/components/dashboard/LandingPageModal';
import PRDModal from '@/components/dashboard/PRDModal';
import HypothesisColumn from '@/components/dashboard/HypothesisColumn';
import DNAButton from '@/components/dashboard/DNAButton';
import APIConnector from '@/components/dashboard/APIConnector';

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
    chatHistory: []
  });

  const [apiConnected, setApiConnected] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');
  const [engineRunning, setEngineRunning] = useState(false);
  const [engineStartTime, setEngineStartTime] = useState<Date | null>(null);
  const [runningTime, setRunningTime] = useState('00:00');
  const [hypothesisService, setHypothesisService] = useState<HypothesisService | null>(null);
  const [streamingService, setStreamingService] = useState<StreamingService | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [selectedHypothesis, setSelectedHypothesis] = useState<Hypothesis | null>(null);
  const [showDNAModal, setShowDNAModal] = useState(false);
  const [showLandingPageModal, setShowLandingPageModal] = useState(false);
  const [showPRDModal, setShowPRDModal] = useState(false);
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

  // Check for stored API key on mount
  useEffect(() => {
    const storedKey = getStoredApiKey();
    if (storedKey) {
      setApiKey(storedKey);
      setApiConnected(true);
      setHypothesisService(new HypothesisService(storedKey));
      setStreamingService(new StreamingService(storedKey));
    }
  }, []);

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
    
    const solutionsUnlocked = problemsGreenFacts >= 3;
    const requirementsUnlocked = problemsGreenFacts >= 3 && solutionsGreenFacts >= 3;
    const dnaUnlocked = requirementsUnlocked && requirementsGreenFacts >= 3;
    
    setState(prev => ({
      ...prev,
      problemsScore,
      solutionsScore,
      requirementsUnlocked,
      dnaUnlocked
    }));
  }, [state.hypotheses, state.solutions, state.requirements]);

  // Real streaming rationale updates
  useEffect(() => {
    if (!engineRunning || !streamingService) return;

    const interval = setInterval(async () => {
      if (Math.random() < 0.4) { // 40% chance to start streaming
        const focus = Math.random() < (state.slider / 100) ? 'problems' : 'solutions';
        
        // Clear current stream and start new one
        setCurrentRationaleStream('');
        
        const onRationaleUpdate = (text: string) => {
          setCurrentRationaleStream(prev => {
            const newStream = prev + text;
            // Update rationale state with complete lines
            if (text.includes('\n') || newStream.length > 100) {
              setState(current => ({
                ...current,
                agentRationale: [...current.agentRationale, newStream.trim()].slice(-15)
              }));
              return '';
            }
            return newStream;
          });
        };

        try {
          await streamingService.streamHypothesisGeneration(state.niche, focus, onRationaleUpdate);
        } catch (error) {
          console.error('Streaming error:', error);
        }
      }
    }, 8000); // Every 8 seconds

    return () => clearInterval(interval);
  }, [engineRunning, streamingService, state.slider, state.niche]);

  // Engine logic - generate and research hypotheses
  useEffect(() => {
    if (!engineRunning || !hypothesisService) return;

    const interval = setInterval(async () => {
      setState(prev => {
        // Update token usage
        const tokensUsed = Math.floor(Math.random() * 15) + 5;
        const newState = {
          ...prev,
          tokensAvailable: Math.max(0, prev.tokensAvailable - tokensUsed),
          tokensUsed: prev.tokensUsed + tokensUsed,
          totalTokensSpent: prev.totalTokensSpent + tokensUsed,
          tokenRate: tokensUsed
        };

        // Stop if no tokens left
        if (newState.tokensAvailable <= 0) {
          setEngineRunning(false);
        }

        return newState;
      });

      // Generate new hypotheses occasionally
      if (Math.random() < 0.3) {
        try {
          // Slider logic: higher value = more problems focus
          const focus = Math.random() < (state.slider / 100) ? 'problems' : 'solutions';
          
          // Add rationale for hypothesis creation
          setState(prev => ({
            ...prev,
            agentRationale: [...prev.agentRationale, `Created hypothesis: Analyzing ${focus} in ${state.niche}`].slice(-15)
          }));
          
          const newHypotheses = await hypothesisService.generateHypotheses(state.niche, focus, 1);
          
          setState(prev => ({
            ...prev,
            [focus === 'problems' ? 'hypotheses' : 'solutions']: [
              ...prev[focus === 'problems' ? 'hypotheses' : 'solutions'],
              ...newHypotheses
            ].slice(0, 8), // Keep max 8 items
            agentRationale: [...prev.agentRationale, `Generated: ${newHypotheses[0]?.text || 'New hypothesis'}`].slice(-15)
          }));
        } catch (error) {
          console.error('Error generating hypotheses:', error);
        }
      }

      // Auto-generate requirements when both problems and solutions have 3+ green facts
      setState(prev => {
        const problemsGreenFacts = prev.hypotheses.filter(h => h.state === 'fact').length;
        const solutionsGreenFacts = prev.solutions.filter(h => h.state === 'fact').length;
        const requirementsCount = prev.requirements.length;
        
        if (problemsGreenFacts >= 3 && solutionsGreenFacts >= 3 && requirementsCount < 8 && Math.random() < 0.2) {
          // Generate requirement
          hypothesisService.generateHypotheses(prev.niche, 'problems', 1)
            .then(newReqs => {
              const type = Math.random() < 0.6 ? 'functional' : 'non-functional';
              setState(current => ({
                ...current,
                requirements: [...current.requirements, ...newReqs.map(req => ({ 
                  ...req, 
                  text: req.text,
                  type: type as 'functional' | 'non-functional'
                }))],
                agentRationale: [...current.agentRationale, `Auto-generated requirement: ${type}`].slice(-15)
              }));
            })
            .catch(error => {
              console.error('Error auto-generating requirement:', error);
            });
        }
        
        return prev;
      });

      // Research existing hypotheses
      setState(prev => {
        const allItems = [...prev.hypotheses, ...prev.solutions];
        const hypothesisItems = allItems.filter(h => h.state === 'hypothesis');
        
        if (hypothesisItems.length > 0 && Math.random() < 0.3) {
          const itemToResearch = hypothesisItems[0];
          const isHypothesis = prev.hypotheses.some(h => h.id === itemToResearch.id);
          
          // Add rationale for research start
          setState(current => ({
            ...current,
            agentRationale: [...current.agentRationale, `Researching: ${itemToResearch.text}`].slice(-15)
          }));
          
          // Simulate research completion
          hypothesisService.researchHypothesis(itemToResearch, prev.niche)
            .then(result => {
              setState(current => ({
                ...current,
                [isHypothesis ? 'hypotheses' : 'solutions']: current[isHypothesis ? 'hypotheses' : 'solutions'].map(h =>
                  h.id === itemToResearch.id
                    ? { ...h, state: 'fact' as const, confidence: result.confidence, sources: result.sources }
                    : h
                ),
                agentRationale: [...current.agentRationale, `Validated with ${result.confidence}% confidence. ${result.sources.length} sources found.`].slice(-15)
              }));
            })
            .catch(error => {
              console.error('Error researching hypothesis:', error);
            });
        }

        return prev;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [engineRunning, hypothesisService, state.slider, state.niche]);

  const handleConnect = (key: string) => {
    setApiKey(key);
    setApiConnected(true);
    
    if (key === 'demo') {
      throw new Error('Demo mode is disabled. Please provide a valid OpenRouter API key.');
    } else {
      setIsDemoMode(false);
      setHypothesisService(new HypothesisService(key));
      setStreamingService(new StreamingService(key));
    }
  };

  const handleStartEngine = () => {
    if (!state.niche.trim()) {
      alert('Enter a niche first');
      return;
    }
    setEngineRunning(true);
    setEngineStartTime(new Date());
  };

  const handleStopEngine = () => {
    setEngineRunning(false);
    setEngineStartTime(null);
    setState(prev => ({ ...prev, tokenRate: 0 }));
  };

  const handleEngineToggle = () => {
    if (engineRunning) {
      handleStopEngine();
    } else {
      handleStartEngine();
    }
  };

  const handleNicheChange = (niche: string) => {
    setState(prev => ({ ...prev, niche }));
  };

  const handleNicheLockToggle = () => {
    setState(prev => ({ ...prev, nicheLocked: !prev.nicheLocked }));
  };

  const handleRegionsChange = (regions: string[]) => {
    setState(prev => ({ ...prev, selectedRegions: regions }));
  };

  const handleItemClick = (hypothesis: Hypothesis) => {
    setSelectedHypothesis(hypothesis);
  };

  const handleModalClose = () => {
    setSelectedHypothesis(null);
  };

  const handleItemRemove = (hypothesis: Hypothesis, columnType: 'hypotheses' | 'solutions' | 'requirements') => {
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
  };

  const removeHypothesis = (hypothesis: Hypothesis, columnType: 'hypotheses' | 'solutions' | 'requirements') => {
    setState(prev => ({
      ...prev,
      [columnType]: prev[columnType].filter(h => h.id !== hypothesis.id),
      avoidedThemes: [...prev.avoidedThemes, hypothesis.text]
    }));
  };

  const handleConfirmRemoval = (skipFuture: boolean) => {
    if (skipFuture) {
      localStorage.setItem('skipRemovalConfirmation', 'true');
    }
    
    if (confirmationModal.hypothesis) {
      removeHypothesis(confirmationModal.hypothesis, confirmationModal.columnType);
    }
    
    setConfirmationModal({ isOpen: false, hypothesis: null, columnType: 'hypotheses' });
  };

  const handleCancelRemoval = () => {
    setConfirmationModal({ isOpen: false, hypothesis: null, columnType: 'hypotheses' });
  };

  const handleAutopilotToggle = () => {
    setState(prev => ({ ...prev, autopilotEnabled: !prev.autopilotEnabled }));
    
    if (!state.autopilotEnabled) {
      // Autopilot activated - start the magic
      setState(prev => ({
        ...prev,
        agentRationale: [...prev.agentRationale, '✈ Autopilot engaged. AI is now flying your business...'].slice(-15)
      }));
      
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
    
    setState(prev => ({
      ...prev,
      agentRationale: [...prev.agentRationale, `Analyzing market opportunities...`].slice(-15)
    }));
    
    let i = 0;
    const typeInterval = setInterval(() => {
      setState(prev => ({ ...prev, niche: selectedNiche.slice(0, i) }));
      i++;
      if (i > selectedNiche.length) {
        clearInterval(typeInterval);
        setState(prev => ({
          ...prev,
          nicheLocked: true,
          agentRationale: [...prev.agentRationale, `Selected niche: ${selectedNiche}`].slice(-15)
        }));
      }
    }, 100);
  };

  const animateGeoSelection = () => {
    const regions = ['US', 'GB', 'DE'];
    setState(prev => ({
      ...prev,
      agentRationale: [...prev.agentRationale, 'Selecting optimal geographic markets...'].slice(-15)
    }));
    
    regions.forEach((region, index) => {
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          selectedRegions: [...prev.selectedRegions, region]
        }));
      }, index * 800);
    });
    
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        agentRationale: [...prev.agentRationale, `Geographic focus: ${regions.join(', ')}`].slice(-15)
      }));
    }, regions.length * 800);
  };

  const animateSlider = () => {
    setState(prev => ({
      ...prev,
      agentRationale: [...prev.agentRationale, 'Optimizing problem-solution balance...'].slice(-15)
    }));
    
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
        setState(prev => ({
          ...prev,
          agentRationale: [...prev.agentRationale, `Optimal balance achieved: ${targetValue}% problems focus`].slice(-15)
        }));
      }
    }, 100);
  };

  const handleAddHypothesis = async () => {
    if (!hypothesisService) return;
    
    try {
      const newHypotheses = await hypothesisService.generateHypotheses(state.niche, 'problems', 1);
      setState(prev => ({
        ...prev,
        hypotheses: [...prev.hypotheses, ...newHypotheses]
      }));
    } catch (error) {
      console.error('Error adding hypothesis:', error);
    }
  };

  const handleAddSolution = async () => {
    if (!hypothesisService) return;
    
    try {
      const newSolutions = await hypothesisService.generateHypotheses(state.niche, 'solutions', 1);
      setState(prev => ({
        ...prev,
        solutions: [...prev.solutions, ...newSolutions]
      }));
    } catch (error) {
      console.error('Error adding solution:', error);
    }
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

  const handleAddRequirement = async () => {
    if (!hypothesisService) return;
    
    try {
      const type = Math.random() < 0.6 ? 'functional' : 'non-functional';
      const newReqs = await hypothesisService.generateHypotheses(state.niche, 'problems', 1);
      setState(prev => ({
        ...prev,
        requirements: [...prev.requirements, ...newReqs.map(req => ({ 
          ...req, 
          text: req.text,
          type: type as 'functional' | 'non-functional'
        }))]
      }));
    } catch (error) {
      console.error('Error adding requirement:', error);
    }
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
      chatHistory: [...prev.chatHistory, userMessage, agentResponse].slice(-20) // Keep last 20
    }));
  };

  const handleCreateDNA = async () => {
    if (!streamingService) return;

    // Generate DNA from validated facts
    const validatedProblems = state.hypotheses.filter(h => h.state === 'fact');
    const validatedSolutions = state.solutions.filter(h => h.state === 'fact');
    const validatedRequirements = state.requirements.filter(h => h.state === 'fact');

    const dnaData: DNAData = {
      niche: state.niche,
      generatedAt: new Date(),
      problems: validatedProblems,
      solutions: validatedSolutions,
      requirements: validatedRequirements,
      tokenCost: state.totalTokensSpent
    };

    // Store in state and localStorage
    setState(prev => ({ 
      ...prev, 
      generatedDNA: dnaData,
      agentRationale: [...prev.agentRationale, `✨ DNA generated with ${validatedProblems.length + validatedSolutions.length + validatedRequirements.length} validated hypotheses`].slice(-15)
    }));
    localStorage.setItem('curatos_dna', JSON.stringify(dnaData));
    
    // Open DNA modal first
    setShowDNAModal(true);
  };

  const handleGenerateLandingPage = async () => {
    if (!streamingService) return;

    setIsGeneratingLandingPage(true);
    setState(prev => ({
      ...prev,
      agentRationale: [...prev.agentRationale, '🚀 Generating landing page...'].slice(-15)
    }));

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

      setState(prev => ({
        ...prev,
        agentRationale: [...prev.agentRationale, '✅ Landing page generated!'].slice(-15)
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        agentRationale: [...prev.agentRationale, '❌ Landing page generation failed'].slice(-15)
      }));
    } finally {
      setIsGeneratingLandingPage(false);
    }
  };

  const handleGeneratePRD = async () => {
    if (!streamingService) return;

    setIsGeneratingPRD(true);
    setState(prev => ({
      ...prev,
      agentRationale: [...prev.agentRationale, '📄 Generating PRD...'].slice(-15)
    }));

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

      setState(prev => ({
        ...prev,
        agentRationale: [...prev.agentRationale, '✅ PRD generated!'].slice(-15)
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        agentRationale: [...prev.agentRationale, '❌ PRD generation failed'].slice(-15)
      }));
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

  const handleDemoMode = () => {
    // Reinitialize StreamingService with demo API key
    setStreamingService(new StreamingService('demo'));
    
    const now = new Date();
    const DEMO_PROBLEMS = [
      { id: 'p1', text: 'Developers struggle to understand repository health metrics', state: 'fact' as const, confidence: 92, sources: ['GitHub Survey 2024'], createdAt: now },
      { id: 'p2', text: 'Code review processes lack intelligent insights', state: 'fact' as const, confidence: 88, sources: ['Stack Overflow Developer Survey'], createdAt: now },
      { id: 'p3', text: 'Team productivity metrics are scattered across tools', state: 'fact' as const, confidence: 85, sources: ['DevOps Report 2024'], createdAt: now },
      { id: 'p4', text: 'Pull request bottlenecks are hard to identify', state: 'hypothesis' as const, confidence: 0, sources: [], createdAt: now },
      { id: 'p5', text: 'Security vulnerabilities detection is reactive', state: 'hypothesis' as const, confidence: 0, sources: [], createdAt: now },
      { id: 'p6', text: 'Documentation quality assessment is manual', state: 'hypothesis' as const, confidence: 0, sources: [], createdAt: now },
      { id: 'p7', text: 'Contributor onboarding lacks personalized guidance', state: 'hypothesis' as const, confidence: 0, sources: [], createdAt: now },
      { id: 'p8', text: 'Technical debt accumulation goes unnoticed', state: 'hypothesis' as const, confidence: 0, sources: [], createdAt: now }
    ];

    const DEMO_SOLUTIONS = [
      { id: 's1', text: 'AI-powered repository health dashboard', state: 'fact' as const, confidence: 89, sources: ['GitHub API Documentation'], createdAt: now },
      { id: 's2', text: 'Intelligent code review assistant with ML insights', state: 'fact' as const, confidence: 91, sources: ['OpenAI Codex Research'], createdAt: now },
      { id: 's3', text: 'Unified team analytics API with GitHub integration', state: 'fact' as const, confidence: 87, sources: ['GitHub Enterprise Features'], createdAt: now },
      { id: 's4', text: 'Automated PR workflow optimization engine', state: 'hypothesis' as const, confidence: 0, sources: [], createdAt: now },
      { id: 's5', text: 'Proactive security scanning with AI recommendations', state: 'hypothesis' as const, confidence: 0, sources: [], createdAt: now },
      { id: 's6', text: 'Smart documentation quality scoring system', state: 'hypothesis' as const, confidence: 0, sources: [], createdAt: now },
      { id: 's7', text: 'Personalized developer onboarding workflows', state: 'hypothesis' as const, confidence: 0, sources: [], createdAt: now },
      { id: 's8', text: 'Technical debt tracking with refactoring suggestions', state: 'hypothesis' as const, confidence: 0, sources: [], createdAt: now }
    ];

    const DEMO_REQUIREMENTS = [
      { id: 'r1', text: 'GitHub API integration with OAuth authentication', state: 'fact' as const, confidence: 95, sources: ['GitHub API Docs'], type: 'functional' as const, createdAt: now },
      { id: 'r2', text: 'Real-time webhook processing for repository events', state: 'fact' as const, confidence: 93, sources: ['GitHub Webhooks Guide'], type: 'functional' as const, createdAt: now },
      { id: 'r3', text: 'Machine learning pipeline for code analysis', state: 'fact' as const, confidence: 88, sources: ['ML Engineering Best Practices'], type: 'functional' as const, createdAt: now },
      { id: 'r4', text: 'Sub-200ms API response time for dashboard queries', state: 'fact' as const, confidence: 90, sources: ['Performance Benchmarks'], type: 'non-functional' as const, createdAt: now },
      { id: 'r5', text: 'GDPR compliant data processing and storage', state: 'fact' as const, confidence: 92, sources: ['GDPR Compliance Guide'], type: 'non-functional' as const, createdAt: now },
      { id: 'r6', text: 'Horizontal scaling to 10k+ repositories', state: 'fact' as const, confidence: 86, sources: ['Scalability Patterns'], type: 'non-functional' as const, createdAt: now },
      { id: 'r7', text: 'Multi-tenant architecture with role-based access', state: 'hypothesis' as const, confidence: 0, sources: [], type: 'functional' as const, createdAt: now },
      { id: 'r8', text: '99.9% uptime SLA with automated failover', state: 'hypothesis' as const, confidence: 0, sources: [], type: 'non-functional' as const, createdAt: now }
    ];

    setState({
      ...state,
      niche: 'GitHub Intelligence API',
      nicheLocked: true,
      hypotheses: DEMO_PROBLEMS,
      solutions: DEMO_SOLUTIONS,
      requirements: DEMO_REQUIREMENTS,
      requirementsUnlocked: true,
      dnaUnlocked: true,
      agentRationale: ['Demo mode activated', 'Loaded GitHub Intelligence API dataset', 'Ready for DNA generation']
    });

    setTimeout(() => {
      setShowDNAModal(true);
    }, 2000);
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
    return state.hypotheses.filter(h => h.state === 'fact').length;
  };

  const countSolutionsGreenFacts = () => {
    return state.solutions.filter(h => h.state === 'fact').length;
  };

  const countRequirementsGreenFacts = () => {
    return state.requirements.filter(h => h.state === 'fact').length;
  };

  const getProvider = () => isDemoMode ? 'demo' : 'openrouter';
  const getModel = () => isDemoMode ? 'mock' : 'deepseek-r1';

  const getActiveColumns = () => {
    const columns = ['problems', 'solutions'];
    if (state.requirementsUnlocked) columns.push('requirements');
    return columns;
  };

  if (!apiConnected) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <APIConnector 
          apiConnected={apiConnected}
          apiKey={apiKey}
          onConnect={handleConnect}
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-black relative ${state.autopilotEnabled ? 'autopilot-scan' : ''}`}>
      <div className={state.autopilotEnabled ? 'autopilot-border autopilot-glow' : ''}>
        <div className="bg-black rounded-md">
          <EnhancedHeader
            provider={getProvider()}
            model={getModel()}
            tokenBudget={state.tokenBudget}
            totalTokensSpent={state.totalTokensSpent}
            runningTime={runningTime}
            niche={state.niche}
            nicheLocked={state.nicheLocked}
            selectedRegions={state.selectedRegions}
            autopilotEnabled={state.autopilotEnabled}
            engineRunning={engineRunning}
            sliderValue={state.slider}
            onTokenBudgetChange={handleTokenBudgetChange}
        onNicheChange={handleNicheChange}
        onNicheLockToggle={handleNicheLockToggle}
        onRegionsChange={handleRegionsChange}
        onAutopilotToggle={handleAutopilotToggle}
        onSliderChange={handleSliderChange}
        onEngineToggle={handleEngineToggle}
        onDemoMode={handleDemoMode}
      />
      
      <div className="flex">
        {/* Left side: Agent rationale and chat */}
        <div className="flex-1">
          <AgentRationale
            rationale={[...state.agentRationale, currentRationaleStream].filter(Boolean)}
            isActive={engineRunning}
            autopilotEnabled={state.autopilotEnabled}
          />
          
          <ChatInterface
            chatHistory={state.chatHistory}
            onSendMessage={handleSendMessage}
            disabled={!engineRunning}
          />
        </div>
        
        {/* Right side: Radar equalizer */}
        <div className="w-64 border-l border-gray-800">
          <div className="h-full p-4">
            <RadarEqualizer
              problems={countGreenFacts()}
              solutions={countSolutionsGreenFacts()}
              requirements={countRequirementsGreenFacts()}
              isActive={engineRunning}
            />
          </div>
        </div>
      </div>
      
      <div className="flex">
        <HypothesisColumn
          title="problems"
          hypotheses={state.hypotheses}
          score={state.problemsScore}
          percentage={state.slider}
          validatedCount={countGreenFacts()}
          requiredCount={3}
          onItemClick={handleItemClick}
          onItemRemove={(h) => handleItemRemove(h, 'hypotheses')}
          onAdd={handleAddHypothesis}
        />
        
        <div className="w-px bg-gray-800" />
        
        <HypothesisColumn
          title="solutions"
          hypotheses={state.solutions}
          score={state.solutionsScore}
          percentage={100 - state.slider}
          locked={countGreenFacts() < 3}
          validatedCount={countSolutionsGreenFacts()}
          requiredCount={3}
          onItemClick={handleItemClick}
          onItemRemove={(h) => handleItemRemove(h, 'solutions')}
          onAdd={handleAddSolution}
        />
        
        <div className="w-px bg-gray-800" />
        
        <HypothesisColumn
          title="requirements"
          hypotheses={state.requirements}
          score={state.requirements.filter(h => h.state === 'fact').reduce((sum, h) => sum + h.confidence, 0)}
          locked={!(countGreenFacts() >= 3 && countSolutionsGreenFacts() >= 3)}
          validatedCount={countRequirementsGreenFacts()}
          onItemClick={handleItemClick}
          onItemRemove={(h) => handleItemRemove(h, 'requirements')}
          onAdd={handleAddRequirement}
        />
      </div>
      
      <DNAButton
        unlocked={state.dnaUnlocked}
        validatedCount={countGreenFacts() + countSolutionsGreenFacts() + countRequirementsGreenFacts()}
        requiredCount={9}
        onClick={handleCreateDNA}
      />
      
      <HypothesisModal
        hypothesis={selectedHypothesis}
        onClose={handleModalClose}
      />
      
      <DNAModal
        dna={showDNAModal ? state.generatedDNA : null}
        onClose={handleDNAModalClose}
        onStartBuild={handleStartBuild}
        onExport={handleExportDNA}
        onGenerateLandingPage={handleGenerateLandingPage}
        onGeneratePRD={handleGeneratePRD}
        isGeneratingLandingPage={isGeneratingLandingPage}
        isGeneratingPRD={isGeneratingPRD}
      />

      <LandingPageModal
        isOpen={showLandingPageModal}
        onClose={() => setShowLandingPageModal(false)}
        problems={state.hypotheses.filter(h => h.state === 'fact')}
        solutions={state.solutions.filter(h => h.state === 'fact')}
        niche={state.niche}
        html={landingPageHtml}
      />

      <PRDModal
        isOpen={showPRDModal}
        onClose={() => setShowPRDModal(false)}
        problems={state.hypotheses.filter(h => h.state === 'fact')}
        solutions={state.solutions.filter(h => h.state === 'fact')}
        niche={state.niche}
        markdown={prdMarkdown}
      />
      
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        title="Remove Hypothesis?"
        message="This hypothesis and related themes will be avoided in future AI generations"
        onConfirm={handleConfirmRemoval}
        onCancel={handleCancelRemoval}
      />
        </div>
      </div>
    </div>
  );
}
