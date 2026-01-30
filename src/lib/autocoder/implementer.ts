import type { Feature, PRD } from './types';
import { callLLM } from './llm';

const SYSTEM_PROMPT = `You are a world-class UI/UX designer and frontend developer. You build stunning single-page HTML mockups.

OUTPUT: Return ONLY the complete updated index.html content. No markdown fences, no explanation — just raw HTML starting with <!DOCTYPE html>.

DESIGN RULES:
- Single index.html with ALL CSS in <style> and ALL JS in <script>
- Google Fonts via CDN — pick distinctive fonts, not just Inter
- Fully responsive (320px to 2560px)
- CSS custom properties for theming
- Vanilla JS only — no frameworks
- Bold, distinctive typography with dramatic size contrast
- Unexpected color combos — NOT default blue/purple gradients
- CSS animations with cubic-bezier timing
- Never use plain white backgrounds — use gradients, noise, subtle patterns
- Professional SaaS/startup aesthetic
- Smooth scroll behavior
- Intersection Observer for scroll animations

CRITICAL: Return the FULL HTML file every time, starting with <!DOCTYPE html> and ending with </html>. Never return partial HTML.`;

export async function implementFeature(
  feature: Feature,
  currentHtml: string,
  prd: PRD,
): Promise<string> {
  const userMessage = currentHtml
    ? `Current index.html:\n${currentHtml}\n\n---\n\nAdd this section to the page:\nName: ${feature.name}\nDetails: ${feature.description}\n${feature.acceptance_criteria.length > 0 ? `Acceptance Criteria:\n${feature.acceptance_criteria.map(ac => `- ${ac}`).join('\n')}` : ''}\n\nReturn the COMPLETE updated HTML file.`
    : `Create the initial index.html scaffold for: ${prd.executive_summary}\n\nFirst section: ${feature.name}\nDetails: ${feature.description}\n\nReturn the COMPLETE HTML file starting with <!DOCTYPE html>.`;

  const response = await callLLM([
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userMessage },
  ], { maxTokens: 32000 });

  let html = response.trim();
  if (html.startsWith('```')) {
    html = html.replace(/^```(?:html)?\n?/, '').replace(/\n?```$/, '');
  }

  if (!html.includes('<html') && !html.includes('<!DOCTYPE')) {
    throw new Error('Response does not contain valid HTML');
  }

  return html;
}
