import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";

interface AnalysisResult {
  preview: {
    summary?: string;
    primary_outcome: string;
    recommended_role: string;
    role_purpose?: string;
    service_mapping: string;
    weekly_hours?: number;
    client_facing?: boolean;
    core_outcomes?: string[];
    kpis: string[];
    key_tools?: string[];
    risks: string[];
  };
  ai_analysis: {
    what_you_told_us?: string;
    roles?: Array<{
      title: string;
      family: string;
      service: string;
      hours_per_week: number;
      client_facing: boolean;
      purpose: string;
      core_outcomes: string[];
      responsibilities: string[];
      skills: string[];
      tools: string[];
      kpis: string[];
      personality: string[];
      reporting_to: string;
      sample_week: {
        Mon: string;
        Tue: string;
        Wed: string;
        Thu: string;
        Fri: string;
      };
      overlap_requirements: string;
      communication_norms: string;
    }>;
    split_table?: Array<{
      role: string;
      purpose: string;
      core_outcomes: string[];
      hrs: number;
      service: string;
    }>;
    service_recommendation?: {
      best_fit: string;
      why: string;
      cost_framing?: string;
      next_steps: string[];
    };
    onboarding_2w?: {
      week_1: string[];
      week_2: string[];
    };
    risks: string[];
    assumptions: string[];
  };
  classification: any;
}

export async function POST(req: Request) {
  try {
    const data: AnalysisResult = await req.json();

    const { preview, ai_analysis } = data;

    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // ===== HEADER =====
      doc.fontSize(22).text("Comprehensive Job Description Analysis", {
        align: "center",
      });
      doc.moveDown(2);

      // ===== PREVIEW SECTION =====
      doc.fontSize(18).text("Preview Summary", { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12).text(preview.summary || "No summary available.");
      doc.moveDown();

      doc.fontSize(16).text("Recommended Role:");
      doc.fontSize(12).text(preview.recommended_role);
      doc.moveDown();

      doc.fontSize(16).text("Role Purpose:");
      doc.fontSize(12).text(preview.role_purpose || "Not specified.");
      doc.moveDown();

      doc.fontSize(16).text("Primary Outcome:");
      doc.fontSize(12).text(preview.primary_outcome);
      doc.moveDown();

      if (preview.core_outcomes?.length) {
        doc.fontSize(16).text("Core Outcomes:");
        preview.core_outcomes.forEach((o) => doc.fontSize(12).text(`• ${o}`));
        doc.moveDown();
      }

      if (preview.kpis?.length) {
        doc.fontSize(16).text("Key Performance Indicators:");
        preview.kpis.forEach((kpi) => doc.fontSize(12).text(`• ${kpi}`));
        doc.moveDown();
      }

      if (preview.key_tools?.length) {
        doc.fontSize(16).text("Key Tools:");
        preview.key_tools.forEach((t) => doc.fontSize(12).text(`• ${t}`));
        doc.moveDown();
      }

      if (preview.risks?.length) {
        doc.fontSize(16).text("Risks:");
        preview.risks.forEach((r) => doc.fontSize(12).text(`• ${r}`));
        doc.moveDown();
      }

      // ===== AI ANALYSIS SECTION =====
      doc.addPage();
      doc.fontSize(18).text("AI Analysis", { underline: true });
      doc.moveDown();

      if (ai_analysis.what_you_told_us) {
        doc.fontSize(16).text("What You Told Us:");
        doc.fontSize(12).text(ai_analysis.what_you_told_us);
        doc.moveDown();
      }

      if (ai_analysis.roles?.length) {
        ai_analysis.roles.forEach((role, idx) => {
          doc.fontSize(18).text(`Role #${idx + 1}: ${role.title}`, {
            underline: true,
          });
          doc.moveDown(0.5);

          doc.fontSize(12).text(`Purpose: ${role.purpose}`);
          doc.text(`Service: ${role.service}`);
          doc.text(`Weekly Hours: ${role.hours_per_week}`);
          doc.text(`Client Facing: ${role.client_facing ? "Yes" : "No"}`);
          doc.moveDown();

          doc.fontSize(14).text("Core Outcomes:");
          role.core_outcomes.forEach((c) => doc.fontSize(12).text(`• ${c}`));
          doc.moveDown();

          doc.fontSize(14).text("Responsibilities:");
          role.responsibilities.forEach((r) => doc.fontSize(12).text(`• ${r}`));
          doc.moveDown();

          doc.fontSize(14).text("Required Skills:");
          role.skills.forEach((s) => doc.fontSize(12).text(`• ${s}`));
          doc.moveDown();

          doc.fontSize(14).text("Tools & Technologies:");
          role.tools.forEach((t) => doc.fontSize(12).text(`• ${t}`));
          doc.moveDown();

          doc.fontSize(14).text("Key Performance Indicators:");
          role.kpis.forEach((k) => doc.fontSize(12).text(`• ${k}`));
          doc.moveDown();

          doc.fontSize(14).text("Personality Fit:");
          role.personality.forEach((p) => doc.fontSize(12).text(`• ${p}`));
          doc.moveDown();

          doc.fontSize(14).text("Sample Week:");
          Object.entries(role.sample_week).forEach(([day, task]) =>
            doc.fontSize(12).text(`${day}: ${task}`)
          );
          doc.moveDown();

          doc.fontSize(14).text("Communication Norms:");
          doc.fontSize(12).text(role.communication_norms);
          doc.moveDown(2);
        });
      }

      // ===== SERVICE RECOMMENDATION =====
      if (ai_analysis.service_recommendation) {
        doc.addPage();
        const { best_fit, why, cost_framing, next_steps } =
          ai_analysis.service_recommendation;

        doc.fontSize(18).text("Service Recommendation", { underline: true });
        doc.moveDown();

        doc.fontSize(16).text("Best Fit:");
        doc.fontSize(12).text(best_fit);
        doc.moveDown();

        doc.fontSize(16).text("Why:");
        doc.fontSize(12).text(why);
        doc.moveDown();

        if (cost_framing) {
          doc.fontSize(16).text("Cost Framing:");
          doc.fontSize(12).text(cost_framing);
          doc.moveDown();
        }

        if (next_steps?.length) {
          doc.fontSize(16).text("Next Steps:");
          next_steps.forEach((s) => doc.fontSize(12).text(`→ ${s}`));
          doc.moveDown();
        }
      }

      // ===== ONBOARDING PLAN =====
      if (ai_analysis.onboarding_2w) {
        doc.addPage();
        doc.fontSize(18).text("2-Week Onboarding Plan", { underline: true });
        doc.moveDown();

        doc.fontSize(16).text("Week 1:");
        ai_analysis.onboarding_2w.week_1.forEach((w) =>
          doc.fontSize(12).text(`• ${w}`)
        );
        doc.moveDown();

        doc.fontSize(16).text("Week 2:");
        ai_analysis.onboarding_2w.week_2.forEach((w) =>
          doc.fontSize(12).text(`• ${w}`)
        );
        doc.moveDown();
      }

      // ===== RISKS & ASSUMPTIONS =====
      if (ai_analysis.risks?.length || ai_analysis.assumptions?.length) {
        doc.addPage();

        if (ai_analysis.risks?.length) {
          doc.fontSize(18).text("Risks", { underline: true });
          ai_analysis.risks.forEach((r) => doc.fontSize(12).text(`• ${r}`));
          doc.moveDown();
        }

        if (ai_analysis.assumptions?.length) {
          doc.fontSize(18).text("Assumptions", { underline: true });
          ai_analysis.assumptions.forEach((a) =>
            doc.fontSize(12).text(`• ${a}`)
          );
          doc.moveDown();
        }
      }

      doc.end();
    });

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="job-analysis.pdf"',
      },
    });
  } catch (err) {
    console.error("Error generating PDF:", err);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
