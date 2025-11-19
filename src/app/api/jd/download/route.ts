import { NextResponse } from "next/server";
import {
  PDFDocument,
  PDFPage,
  PDFFont,
  StandardFonts,
  rgb,
  RGB,
} from "pdf-lib";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Extract preview and full_package from the new structure
    const preview = data.preview || {};
    const fullPackage = data.full_package || {};
    const metadata = data.metadata || {};

    // Get role title for filename
    const roleTitle = preview.core_va_title || 
                     fullPackage?.service_structure?.core_va_role?.title || 
                     fullPackage?.detailed_specifications?.core_va_jd?.title || 
                     "Job Analysis";
    
    // Title with role title + timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").split("T")[0];
    const title = `${roleTitle.replace(/[^a-zA-Z0-9]/g, "_")}_${timestamp}.pdf`;

    // Create a PDF
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const margin = 50;
    let y = height - margin;

    // Utility to draw text and move y
    interface DrawLineOptions {
      size?: number;
      bold?: boolean;
      color?: RGB;
    }

    const drawLine = (text: string, opts: DrawLineOptions = {}) => {
      const { size = 12, bold = false, color = rgb(0, 0, 0) } = opts;
      const fontToUse = bold ? fontBold : font;
      const lines = splitTextIntoLines(
        text,
        width - margin * 2,
        size,
        fontToUse
      );
      for (const line of lines) {
        if (y < margin) {
          // new page if we run out of space
          const newPage = pdfDoc.addPage();
          y = height - margin;
          page = newPage;
        }
        page.drawText(line, { x: margin, y, size, font: fontToUse, color });
        y -= size + 4;
      }
    };

    const drawSection = (title: string) => {
      y -= 10;
      drawLine(title, { size: 14, bold: true, color: rgb(0.1, 0.1, 0.5) });
      y -= 5;
    };

    // Draw the header
    drawLine(roleTitle, {
      size: 20,
      bold: true,
      color: rgb(0.1, 0.1, 0.5),
    });
    y -= 10;
    drawLine("Job Description Analysis Report", { size: 12 });
    drawLine(`Generated: ${new Date().toLocaleDateString()}`, { size: 10 });
    y -= 20;

    // EXECUTIVE SUMMARY
    drawSection("EXECUTIVE SUMMARY");
    
    if (preview.service_type) {
      drawLine("Service Type", { size: 12, bold: true });
      drawLine(preview.service_type, { size: 11 });
      y -= 5;
    }

    if (preview.service_confidence) {
      drawLine("Confidence", { size: 12, bold: true });
      drawLine(preview.service_confidence, { size: 11 });
      y -= 5;
    }

    if (preview.service_reasoning) {
      drawLine("Service Reasoning", { size: 12, bold: true });
      drawLine(preview.service_reasoning, { size: 11 });
      y -= 5;
    }

    if (preview.primary_outcome) {
      drawLine("Primary Outcome", { size: 12, bold: true });
      drawLine(preview.primary_outcome, { size: 11 });
      y -= 5;
    }

    // SUMMARY SECTION
    if (preview.summary) {
      const summary = preview.summary;
      drawSection("SUMMARY");
      
      if (summary.company_stage) {
        drawLine("Company Stage", { size: 12, bold: true });
        drawLine(summary.company_stage, { size: 11 });
        y -= 5;
      }

      if (summary.outcome_90d) {
        drawLine("90-Day Outcome", { size: 12, bold: true });
        drawLine(summary.outcome_90d, { size: 11 });
        y -= 5;
      }

      if (summary.primary_bottleneck) {
        drawLine("Primary Bottleneck", { size: 12, bold: true });
        drawLine(summary.primary_bottleneck, { size: 11 });
        y -= 5;
      }

      if (summary.workflow_analysis) {
        drawLine("Workflow Analysis", { size: 12, bold: true });
        drawLine(summary.workflow_analysis, { size: 11 });
        y -= 5;
      }
    }

    // ROLE DETAILS
    if (fullPackage?.service_structure?.core_va_role || fullPackage?.detailed_specifications?.core_va_jd) {
      drawSection("ROLE DETAILS");
      
      const coreRole = fullPackage.service_structure?.core_va_role;
      const detailedJd = fullPackage.detailed_specifications?.core_va_jd;

      if (coreRole?.title || detailedJd?.title) {
        drawLine("Role Title", { size: 12, bold: true });
        drawLine(coreRole?.title || detailedJd?.title, { size: 11 });
        y -= 5;
      }

      if (coreRole?.hours_per_week || detailedJd?.hours_per_week) {
        drawLine("Hours Per Week", { size: 12, bold: true });
        drawLine(String(coreRole?.hours_per_week || detailedJd?.hours_per_week), { size: 11 });
        y -= 5;
      }

      if (detailedJd?.mission_statement || coreRole?.core_responsibility) {
        drawLine("Mission Statement", { size: 12, bold: true });
        drawLine(detailedJd?.mission_statement || coreRole?.core_responsibility, { size: 11 });
        y -= 5;
      }

      // Core Outcomes
      if (detailedJd?.core_outcomes && detailedJd.core_outcomes.length > 0) {
        drawLine("90-Day Core Outcomes", { size: 12, bold: true });
        for (const outcome of detailedJd.core_outcomes) {
          drawLine(`• ${outcome}`, { size: 11 });
        }
        y -= 5;
      }

      // Responsibilities
      if (detailedJd?.responsibilities && detailedJd.responsibilities.length > 0) {
        drawLine("Key Responsibilities", { size: 12, bold: true });
        for (const resp of detailedJd.responsibilities) {
          if (typeof resp === "string") {
            drawLine(`• ${resp}`, { size: 11 });
          } else if (resp?.details && Array.isArray(resp.details)) {
            for (const detail of resp.details) {
              drawLine(`• ${detail}`, { size: 11 });
            }
          }
        }
        y -= 5;
      } else if (coreRole?.recurring_tasks && coreRole.recurring_tasks.length > 0) {
        drawLine("Recurring Tasks", { size: 12, bold: true });
        for (const task of coreRole.recurring_tasks) {
          drawLine(`• ${task}`, { size: 11 });
        }
        y -= 5;
      }

      // Skills
      if (coreRole?.skill_requirements || detailedJd?.skills_required) {
        const skills = coreRole?.skill_requirements || detailedJd?.skills_required;
        drawLine("Required Skills", { size: 12, bold: true });
        if (skills.required && Array.isArray(skills.required)) {
          for (const skill of skills.required) {
            if (typeof skill === "string") {
              drawLine(`• ${skill}`, { size: 11 });
            } else if (skill?.skill) {
              drawLine(`• ${skill.skill}`, { size: 11 });
            }
          }
        }
        y -= 5;
      }

      // Tools
      if (detailedJd?.tools && detailedJd.tools.length > 0) {
        drawLine("Tools Required", { size: 12, bold: true });
        for (const tool of detailedJd.tools) {
          if (typeof tool === "string") {
            drawLine(`• ${tool}`, { size: 11 });
          } else if (tool?.tool) {
            drawLine(`• ${tool.tool}`, { size: 11 });
          }
        }
        y -= 5;
      }

      // KPIs
      if (detailedJd?.kpis && detailedJd.kpis.length > 0) {
        drawLine("Key Performance Indicators", { size: 12, bold: true });
        for (const kpi of detailedJd.kpis) {
          if (typeof kpi === "string") {
            drawLine(`• ${kpi}`, { size: 11 });
          } else if (kpi?.metric) {
            const kpiText = kpi.target ? `${kpi.metric} — ${kpi.target}` : kpi.metric;
            drawLine(`• ${kpiText}`, { size: 11 });
          }
        }
        y -= 5;
      }
    }

    // KEY RISKS
    if (preview.key_risks && preview.key_risks.length > 0) {
      drawSection("KEY RISKS");
      for (const risk of preview.key_risks) {
        drawLine(`• ${risk}`, { size: 11 });
      }
      y -= 5;
    }

    // CRITICAL QUESTIONS
    if (preview.critical_questions && preview.critical_questions.length > 0) {
      drawSection("CRITICAL QUESTIONS");
      for (const question of preview.critical_questions) {
        drawLine(`• ${question}`, { size: 11 });
      }
      y -= 5;
    }

    // IMPLEMENTATION PLAN
    if (fullPackage?.implementation_plan) {
      const implPlan = fullPackage.implementation_plan;
      
      if (implPlan.immediate_next_steps && implPlan.immediate_next_steps.length > 0) {
        drawSection("IMMEDIATE NEXT STEPS");
        for (const step of implPlan.immediate_next_steps) {
          drawLine(`${step.step || step}`, { size: 11, bold: true });
          if (typeof step === "object" && step.owner) {
            drawLine(`Owner: ${step.owner} | Timeline: ${step.timeline}`, { size: 10 });
            if (step.output) {
              drawLine(`Output: ${step.output}`, { size: 10 });
            }
          }
          y -= 3;
        }
        y -= 5;
      }
    }

    // Save PDF
    const pdfBytes = await pdfDoc.save();
    const buffer = Buffer.from(pdfBytes);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${title}"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return new NextResponse("Failed to generate PDF", { status: 500 });
  }
}

// Helper function to wrap long lines
function splitTextIntoLines(
  text: string,
  maxWidth: number,
  fontSize: number,
  font: PDFFont
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const width = font.widthOfTextAtSize(line + word, fontSize);
    if (width > maxWidth && line !== "") {
      lines.push(line.trim());
      line = word + " ";
    } else {
      line += word + " ";
    }
  }
  if (line) lines.push(line.trim());
  return lines;
}
