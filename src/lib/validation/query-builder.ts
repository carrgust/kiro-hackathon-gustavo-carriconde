import { getPromptForApi, getPillarConfig } from './registry-loader';
import { ExtractedKeywords } from './keyword-extractor';

export function buildQuery(
  pillarKey: string,
  apiId: string,
  keywords: ExtractedKeywords
): string {
  const template = getPromptForApi(pillarKey, apiId);
  if (!template) return '';
  
  return template
    .replace(/\{keyword\}/g, keywords.keyword)
    .replace(/\{industry\}/g, keywords.industry);
}

export function buildQueriesForPillar(
  pillarKey: string,
  keywords: ExtractedKeywords
): Array<{ apiId: string; query: string }> {
  const pillar = getPillarConfig(pillarKey);
  if (!pillar) return [];
  
  return pillar.apis.map(apiId => ({
    apiId,
    query: buildQuery(pillarKey, apiId, keywords)
  }));
}
