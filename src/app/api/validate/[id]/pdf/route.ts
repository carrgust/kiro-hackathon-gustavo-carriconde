import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/db/client';
import { getScoreLabel } from '@/lib/validation/config';
import jsPDF from 'jspdf';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const prisma = getPrisma();

  const session = await prisma.validationSession.findUnique({
    where: { id: params.id },
    include: {
      pillars: {
        include: {
          subcategories: {
            include: {
              sources: true
            }
          }
        }
      }
    }
  });

  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  if (session.status !== 'complete') {
    return NextResponse.json({ error: 'Validation not complete' }, { status: 400 });
  }

  const doc = new jsPDF();
  let y = 20;

  // Title
  doc.setFontSize(20);
  doc.setTextColor(0, 0, 0);
  doc.text('Curatos DNA - Idea Validation Report', 20, y);
  y += 10;

  // Date
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, y);
  y += 15;

  // Business Idea
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Business Idea:', 20, y);
  y += 7;
  doc.setFontSize(10);
  const ideaLines = doc.splitTextToSize(session.canonicalDescription || session.originalInput, 170);
  doc.text(ideaLines, 20, y);
  y += ideaLines.length * 5 + 10;

  // Overall Score
  const scoreInfo = session.overallScore ? getScoreLabel(session.overallScore) : null;
  doc.setFontSize(14);
  doc.text(`Overall Score: ${session.overallScore || 0}/100`, 20, y);
  y += 7;
  
  if (scoreInfo) {
    const color = scoreInfo.color === '#22c55e' ? [34, 197, 94] :
                  scoreInfo.color === '#eab308' ? [234, 179, 8] :
                  scoreInfo.color === '#f97316' ? [249, 115, 22] : [239, 68, 68];
    doc.setTextColor(color[0], color[1], color[2]);
    doc.setFontSize(12);
    doc.text(scoreInfo.label, 20, y);
    y += 15;
  }

  // Pillars
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.text('Pillar Analysis:', 20, y);
  y += 10;

  for (const pillar of session.pillars) {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`${pillar.pillarIcon} ${pillar.pillarName}: ${pillar.score || 0}/100`, 20, y);
    y += 7;

    doc.setFontSize(10);
    for (const sub of pillar.subcategories) {
      doc.text(`  • ${sub.subcategoryName}: ${sub.score || 0}/100`, 25, y);
      y += 5;

      const foundSources = sub.sources.filter(s => s.status === 'found').slice(0, 2);
      for (const source of foundSources) {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.setTextColor(100, 100, 100);
        doc.text(`    ${source.sourceIcon} ${source.title || 'Source'}`, 30, y);
        y += 4;
        if (source.supports && source.supports.length > 0) {
          doc.text(`      ✓ ${source.supports[0]}`, 30, y);
          y += 4;
        }
      }
      doc.setTextColor(0, 0, 0);
      y += 2;
    }
    y += 5;
  }

  // Summary
  if (y > 230) {
    doc.addPage();
    y = 20;
  }

  doc.setFontSize(14);
  doc.text('Summary:', 20, y);
  y += 10;

  const sortedPillars = [...session.pillars].sort((a, b) => (b.score || 0) - (a.score || 0));
  
  doc.setFontSize(11);
  doc.setTextColor(34, 197, 94);
  doc.text('Strongest Pillars:', 20, y);
  y += 6;
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  for (let i = 0; i < 2 && i < sortedPillars.length; i++) {
    doc.text(`  • ${sortedPillars[i].pillarName} (${sortedPillars[i].score}/100)`, 20, y);
    y += 5;
  }
  y += 5;

  doc.setFontSize(11);
  doc.setTextColor(239, 68, 68);
  doc.text('Weakest Pillars:', 20, y);
  y += 6;
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  for (let i = sortedPillars.length - 1; i >= sortedPillars.length - 2 && i >= 0; i--) {
    doc.text(`  • ${sortedPillars[i].pillarName} (${sortedPillars[i].score}/100)`, 20, y);
    y += 5;
  }
  y += 10;

  doc.setFontSize(11);
  doc.text('Overall Recommendation:', 20, y);
  y += 6;
  doc.setFontSize(10);
  const recommendation = (session.overallScore || 0) >= 80 ? 'This idea shows strong potential and is worth pursuing.' :
                        (session.overallScore || 0) >= 60 ? 'This idea is promising but needs refinement in weaker areas.' :
                        (session.overallScore || 0) >= 40 ? 'This idea has significant concerns. Consider pivoting or major changes.' :
                        'This idea shows weak validation. Consider exploring alternative approaches.';
  const recLines = doc.splitTextToSize(recommendation, 170);
  doc.text(recLines, 20, y);

  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=validation-report-${params.id}.pdf`
    }
  });
}
