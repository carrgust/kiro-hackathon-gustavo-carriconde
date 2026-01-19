/**
 * Test script for source prioritization and Wikipedia filtering
 */

import { createResearchAgent } from '../src/lib/api/research-agent';

async function testSourcePrioritization() {
  console.log('🧪 Testing Source Prioritization and Wikipedia Filtering\n');
  
  // Mock API key for testing
  const agent = createResearchAgent('test-key');
  
  // Test cases
  const testCases = [
    {
      name: 'Market Research Query (should avoid Wikipedia)',
      hypothesis: 'fintech payment processing market size and pricing'
    },
    {
      name: 'Definition Query (Wikipedia allowed)',
      hypothesis: 'what is blockchain technology definition and history'
    },
    {
      name: 'Company Info Query (Wikipedia allowed)',
      hypothesis: 'Apple Inc company founded headquarters location'
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`📋 Test: ${testCase.name}`);
    console.log(`Query: "${testCase.hypothesis}"`);
    
    try {
      const result = await agent.research(testCase.hypothesis);
      
      console.log(`✅ Confidence: ${result.confidence}%`);
      console.log(`📊 Sources found: ${result.sources.length}`);
      
      // Analyze source types
      const sourceTypes = result.sources.reduce((acc, source) => {
        acc[source.source_type] = (acc[source.source_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      console.log('📈 Source breakdown:');
      Object.entries(sourceTypes).forEach(([type, count]) => {
        console.log(`  - ${type}: ${count} sources`);
      });
      
      // Check Wikipedia usage
      const wikipediaSources = result.sources.filter(s => s.source_type === 'wikipedia');
      if (wikipediaSources.length > 0) {
        console.log(`⚠️  Wikipedia sources: ${wikipediaSources.length}`);
        wikipediaSources.forEach(s => {
          console.log(`    - ${s.title} (weight: ${s.confidence_weight})`);
        });
      } else {
        console.log('✅ No Wikipedia sources used');
      }
      
      console.log(`🔍 Reasoning: ${result.reasoning.join(', ')}`);
      
    } catch (error) {
      console.error(`❌ Test failed: ${error}`);
    }
    
    console.log('\n' + '─'.repeat(60) + '\n');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testSourcePrioritization().catch(console.error);
}

export { testSourcePrioritization };
