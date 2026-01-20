import { NextRequest, NextResponse } from 'next/server'
import { getProvider } from '@/lib/api'
import { AgentContext, AgentAction } from '@/types/orchestrator'
import { getModelChain } from '@/lib/models/config'

const AGENT_SYSTEM_PROMPT = `
You are the Agent Console Orchestrator for Curatos DNA. Your role is to autonomously manage the hypothesis-to-PRD pipeline by analyzing card data and deciding the next optimal action.

CRITICAL CONSTRAINTS:
- You can ONLY use the provided card data (confidence, sources, state)
- You CANNOT use your training data for market insights
- All decisions must be based on validated web sources in the cards
- You must explain your reasoning before choosing an action
- You must cite specific card IDs when referencing data

AVAILABLE ACTIONS:
- GENERATE_PROBLEM: Create new problem hypothesis
- GENERATE_SOLUTION: Create solution for validated problem (requires problemId parameter)
- GENERATE_REQUIREMENT: Create requirement for validated solution (requires solutionId parameter)
- RESEARCH_CARD: Research unvalidated card via web search (requires cardId parameter)
- GENERATE_PRD: Create PRD when thresholds met (3+ problems, 3+ solutions, 15+ requirements)
- THINK: Analyze current state without taking action
- WAIT: No action needed, pipeline progressing well

DECISION PROCESS:
1. Analyze current pipeline state using ONLY the provided card data
2. Identify highest priority need based on card confidence scores and counts
3. Choose optimal action with required parameters
4. Explain reasoning citing specific card IDs and their data

Respond in JSON format:
{
  "thought": "Your detailed analysis of the current state citing card IDs",
  "action": "CHOSEN_ACTION",
  "parameters": { "cardId": "card-id-if-needed", "problemId": "problem-id-if-needed", "solutionId": "solution-id-if-needed" }
}
`

interface AgentResponse {
  thought: string
  action: AgentAction
  parameters?: {
    cardId?: string
    problemId?: string
    solutionId?: string
    requirementType?: 'functional' | 'non-functional'
  }
}

export async function POST(request: NextRequest) {
  try {
    const { context, apiKey }: { context: AgentContext; apiKey: string } = await request.json()

    if (!apiKey) {
      return NextResponse.json({ error: 'API key required' }, { status: 400 })
    }

    if (!context) {
      return NextResponse.json({ error: 'Agent context required' }, { status: 400 })
    }

    const provider = getProvider('openrouter', apiKey)

    // Format context for the agent
    const contextString = JSON.stringify({
      niche: context.niche,
      problems: context.problems.map(p => ({
        id: p.id,
        text: p.text,
        confidence: p.confidence,
        state: p.state,
        sources: p.sources.length
      })),
      solutions: context.solutions.map(s => ({
        id: s.id,
        text: s.text,
        confidence: s.confidence,
        state: s.state,
        parentId: s.parentId,
        sources: s.sources.length
      })),
      requirements: context.requirements.map(r => ({
        id: r.id,
        text: r.text,
        confidence: r.confidence,
        state: r.state,
        parentId: r.parentId,
        sources: r.sources.length
      })),
      stats: context.stats,
      pipeline: context.pipeline
    }, null, 2)

    const messages = [
      {
        role: 'system' as const,
        content: AGENT_SYSTEM_PROMPT
      },
      {
        role: 'user' as const,
        content: `Current pipeline context:\n\n${contextString}\n\nWhat is the next best action to progress the pipeline? Remember: you can ONLY use the card data provided above, cite specific card IDs, and cannot use any training knowledge.`
      }
    ]

    // Use fallback system for orchestrator
    const modelChain = getModelChain('ORCHESTRATOR')
    const { response } = await (provider as any).chatWithFallback(messages, modelChain)
    
    // Parse the JSON response
    let agentResponse: AgentResponse
    try {
      agentResponse = JSON.parse(response.content)
    } catch (parseError) {
      // Fallback if JSON parsing fails
      agentResponse = {
        thought: response.content,
        action: AgentAction.THINK,
        parameters: {}
      }
    }

    // Validate the action is valid
    if (!Object.values(AgentAction).includes(agentResponse.action)) {
      agentResponse.action = AgentAction.THINK
    }

    return NextResponse.json(agentResponse)

  } catch (error) {
    console.error('Agent orchestration error:', error)
    return NextResponse.json(
      { error: 'Failed to orchestrate agent decision' },
      { status: 500 }
    )
  }
}
