import { APIResult } from './types';

export async function searchFRED(query: string): Promise<APIResult> {
  const start = Date.now();
  // FRED requires API key registration - return graceful degradation
  // Users can register at https://fred.stlouisfed.org/docs/api/api_key.html
  console.log(`[FRED] ⚠ Skipped (requires API key registration)`);
  return { 
    source: 'FRED', 
    success: true, 
    data: [], 
    queryTime: Date.now() - start 
  };
}
