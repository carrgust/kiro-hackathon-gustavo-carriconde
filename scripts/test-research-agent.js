#!/usr/bin/env node

// Test script to verify all research sources are being called
import { createResearchAgent } from '../src/lib/api/research-agent.js';

async function testResearchAgent() {
  console.log('🧪 Testing Research Agent with all sources...\n');
  
  // Test without Serper key (should still call OpenAlex, HackerNews, Wikipedia)
  const agent = createResearchAgent('test-key', undefined);
  
  try {
    const result = await agent.research('fintech payment solutions for small businesses');
    
    console.log('📊 Results:');
    console.log(`- Sources found: ${result.sources.length}`);
    console.log(`- Confidence: ${result.confidence}%`);
    console.log('\n🔍 Reasoning:');
    result.reasoning.forEach(r => console.log(`  ${r}`));
    
    console.log('\n📋 Source breakdown:');
    const sourceTypes = {};
    result.sources.forEach(s => {
      const type = s.source_type || 'unknown';
      sourceTypes[type] = (sourceTypes[type] || 0) + 1;
    });
    
    Object.entries(sourceTypes).forEach(([type, count]) => {
      console.log(`  ${type}: ${count} sources`);
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testResearchAgent();
