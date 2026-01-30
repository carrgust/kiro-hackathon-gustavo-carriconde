import type { PRD, Feature, AutoCoderEvent } from './types';
import { decomposePRDToFeatures } from './decomposer';
import { implementFeature } from './implementer';
import { generateDesignSystem, DesignSystem } from './designer';

function now(): string {
  return new Date().toISOString();
}

export async function* runAutoCoderPipeline(
  prd: PRD,
  projectId: string,
): AsyncGenerator<AutoCoderEvent> {
  yield { type: 'pipeline_started', timestamp: now(), projectId };

  // Phase 1: Decompose PRD into features
  yield { type: 'phase_started', timestamp: now(), phase: 'initializer' };

  let features: Feature[];
  try {
    features = await decomposePRDToFeatures(prd);
    console.log(`[AutoCoder] Decomposed into ${features.length} features`);
  } catch (error) {
    yield { type: 'error', timestamp: now(), message: `Decomposition failed: ${error}` };
    return;
  }

  // Phase 1.5: Generate design system
  yield { type: 'phase_started', timestamp: now(), phase: 'designer' } as AutoCoderEvent;
  let designSystem: DesignSystem | null = null;
  try {
    designSystem = await generateDesignSystem({
      name: 'MVP',
      problem: prd.executive_summary,
      targetUsers: prd.target_users.map(u => u.persona).join(', ') || 'general users',
      features: features
    });
    console.log(`[AutoCoder] Design: ${designSystem.aesthetic} | Fonts: ${designSystem.displayFont} + ${designSystem.bodyFont}`);
  } catch (e) {
    console.log('[AutoCoder] Design system generation failed, using defaults');
  }

  // Phase 2: Implement each feature sequentially
  yield { type: 'phase_started', timestamp: now(), phase: 'coder', totalFeatures: features.length };
  let html = '';
  let completed = 0;

  for (const feature of features) {
    feature.status = 'in_progress';
    feature.attempts += 1;
    yield { type: 'feature_started', timestamp: now(), feature: { ...feature } };

    try {
      html = await implementFeature(feature, html, prd, designSystem);
      feature.status = 'done';
      completed += 1;
      yield { type: 'feature_completed', timestamp: now(), feature: { ...feature }, completed, total: features.length };
      yield { type: 'preview_updated', timestamp: now(), html };
    } catch (error) {
      console.error(`[AutoCoder] Feature ${feature.id} failed:`, error);
      if (feature.attempts >= 2) {
        feature.status = 'skipped';
        yield { type: 'feature_skipped', timestamp: now(), feature: { ...feature }, error: String(error) };
      } else {
        yield { type: 'feature_error', timestamp: now(), feature: { ...feature }, error: String(error) };
      }
    }

    yield { type: 'progress', timestamp: now(), completed, total: features.length };
  }

  yield { type: 'pipeline_completed', timestamp: now(), completed, total: features.length, html };
}
