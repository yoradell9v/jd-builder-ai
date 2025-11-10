import { NextResponse } from "next/server";
import OpenAI from "openai";

// Classification engine - maps keywords to craft families
const CRAFT_KEYWORDS = {
  "Tech/Automation": [
    "ghl",
    "workflow",
    "pipeline",
    "trigger",
    "funnel",
    "zaps",
    "automations",
    "webhook",
    "integration",
    "api",
  ],
  "Creative/Build": {
    Design: [
      "banner",
      "thumbnail",
      "canva",
      "brand kit",
      "ad creative",
      "graphic",
    ],
    Web: ["wordpress", "webflow", "landing page", "html", "css", "website"],
    Video: ["video edit", "premiere", "final cut", "motion", "thumbnail"],
  },
  "Growth/Revenue": {
    SDR: ["dms", "cold email", "appointments", "inbox", "outreach", "calls"],
    Marketing: ["campaign", "ads", "marketing", "growth"],
    Social: ["social media", "instagram", "tiktok", "linkedin", "posts"],
    Copy: ["email copy", "ad copy", "blogs", "scripts", "content writing"],
  },
  "Business/Operations": {
    PM: ["sprints", "roadmap", "coordination", "handoffs", "project"],
    Admin: ["admin", "calendar", "email management", "scheduling"],
    Support: ["tickets", "helpdesk", "customer service", "cs"],
    Data: ["dashboard", "report", "metrics", "kpi", "analytics"],
  },
};

// Adjacency matrix for Unicorn pairing
const ALLOWED_UNICORN_PAIRS = [
  ["Admin/EA", "Ops Coordinator", "Project Manager"],
  ["Marketing Coordinator", "Social Media Manager", "Copywriter"],
  ["GHL Implementer", "CRM/Automation Tech", "Data Analyst"],
  ["Graphic Designer", "Video Editor"],
];

// KPI Library
const KPI_LIBRARY = {
  "Admin/EA": [
    "Task SLA adherence %",
    "Inbox zero cadence per week",
    "Meeting prep on-time %",
    "SOP coverage %",
  ],
  "Ops Coordinator": [
    "Sprint throughput (stories/week)",
    "On-time completion %",
    "Blockers resolved <24h %",
  ],
  "Project Manager": [
    "Sprint throughput (stories/week)",
    "On-time completion %",
    "Blockers resolved <24h %",
    "Stakeholder satisfaction score",
  ],
  Support: [
    "CSAT %",
    "First response time",
    "Resolution time",
    "Doc updates per week",
  ],
  SDR: [
    "Dials/emails per day",
    "Reply rate %",
    "Booked calls per week",
    "No-show rate %",
  ],
  "Marketing Coordinator": [
    "Campaigns launched per month",
    "Asset readiness %",
    "CTA click-through %",
  ],
  "Social Media Manager": [
    "Posts per week",
    "Avg saves/shares per post",
    "Profile click-through %",
  ],
  Copywriter: [
    "Drafts per week",
    "Approval rate %",
    "CTR uplift vs baseline %",
  ],
  "Graphic Designer": [
    "Assets per week",
    "Acceptance rate %",
    "On-brief score",
  ],
  "Video Editor": [
    "Videos per week",
    "First-cut approval %",
    "Avg turnaround (days)",
  ],
  "Web Developer": [
    "Pages per sprint",
    "QA pass rate %",
    "Load speed (LCP ms)",
  ],
  "GHL Implementer": [
    "Automations launched per month",
    "Form error rate %",
    "Booked calls per month",
  ],
  "CRM/Automation Tech": [
    "Data hygiene %",
    "Sync error incidents",
    "SLA for fixes (hours)",
  ],
  "Data Analyst": [
    "Dashboard freshness (days)",
    "Accuracy %",
    "Insight actions per month",
  ],
};

// Personality fit profiles
const PERSONALITY_PROFILES = {
  "Admin/EA": [
    "Highly organized and proactive",
    "Excellent written and verbal communication",
    "Detail-oriented with follow-through",
    "Professional and discreet",
  ],
  "Ops Coordinator": [
    "Systems thinker",
    "Strong coordination skills",
    "Proactive problem solver",
    "Clear communicator",
  ],
  "Project Manager": [
    "Strategic and organized",
    "Strong stakeholder management",
    "Proactive and accountable",
    "Excellent documentation habits",
  ],
  "GHL Implementer": [
    "Systematic and methodical",
    "Clear written communication",
    "Low-ego, open to feedback",
    "Detail-safe with QA mindset",
  ],
  "CRM/Automation Tech": [
    "Analytical and logical",
    "Strong troubleshooting skills",
    "Documentation-focused",
    "Patient with technical details",
  ],
  "Data Analyst": [
    "Analytical and precise",
    "Strong pattern recognition",
    "Clear data storytelling",
    "Attention to detail",
  ],
  "Marketing Coordinator": [
    "Organized multitasker",
    "Creative problem solver",
    "Strong communication",
    "Results-oriented",
  ],
  "Social Media Manager": [
    "Creative and trend-aware",
    "Strong visual sense",
    "Engaging communicator",
    "Community-focused",
  ],
  Copywriter: [
    "Language-precise",
    "Persuasive storyteller",
    "Adaptable voice",
    "Research-oriented",
  ],
  "Graphic Designer": [
    "Creative and inventive",
    "Open to iterative feedback",
    "Strong visual communication",
    "Brand-conscious",
  ],
  "Video Editor": [
    "Creative storyteller",
    "Technical proficiency",
    "Detail-oriented",
    "Deadline-driven",
  ],
  "Web Developer": [
    "Methodical and systematic",
    "Quality-focused",
    "Less client-facing",
    "Continuous learner",
  ],
  SDR: [
    "Resilient and persistent",
    "Extroverted and personable",
    "Quick response time",
    "Goal-oriented",
  ],
  Support: [
    "Patient and empathetic",
    "Clear communicator",
    "Consistent documentation",
    "Problem-solver",
  ],
};

function classifyTasks(tasks: string[], tools: string[], outcome: string) {
  const allText = [...tasks, ...tools, outcome].join(" ").toLowerCase();
  const crafts: { family: string; role: string; keywords: number }[] = [];

  // Check Tech/Automation
  const techMatches = CRAFT_KEYWORDS["Tech/Automation"].filter((kw) =>
    allText.includes(kw.toLowerCase())
  ).length;
  if (techMatches > 0) {
    crafts.push({
      family: "Tech/Automation",
      role: "GHL Implementer",
      keywords: techMatches,
    });
  }

  // Check Creative/Build
  Object.entries(CRAFT_KEYWORDS["Creative/Build"]).forEach(
    ([role, keywords]) => {
      const matches = keywords.filter((kw) =>
        allText.includes(kw.toLowerCase())
      ).length;
      if (matches > 0) {
        crafts.push({ family: "Creative/Build", role, keywords: matches });
      }
    }
  );

  // Check Growth/Revenue
  Object.entries(CRAFT_KEYWORDS["Growth/Revenue"]).forEach(
    ([role, keywords]) => {
      const matches = keywords.filter((kw) =>
        allText.includes(kw.toLowerCase())
      ).length;
      if (matches > 0) {
        crafts.push({ family: "Growth/Revenue", role, keywords: matches });
      }
    }
  );

  // Check Business/Operations
  Object.entries(CRAFT_KEYWORDS["Business/Operations"]).forEach(
    ([role, keywords]) => {
      const matches = keywords.filter((kw) =>
        allText.includes(kw.toLowerCase())
      ).length;
      if (matches > 0) {
        crafts.push({ family: "Business/Operations", role, keywords: matches });
      }
    }
  );

  return crafts.sort((a, b) => b.keywords - a.keywords);
}

function determineSplitLogic(
  crafts: { family: string; role: string }[],
  weeklyHours: number,
  clientFacing: boolean
) {
  const families = [...new Set(crafts.map((c) => c.family))];

  // Rule 1: Multiple families → split
  if (families.length > 1) {
    return { shouldSplit: true, reason: "Multiple craft families detected" };
  }

  // Rule 2: Deep work + client-facing → split
  const deepWorkFamilies = ["Tech/Automation", "Creative/Build"];
  if (clientFacing && deepWorkFamilies.includes(families[0])) {
    return {
      shouldSplit: true,
      reason: "Deep work and client-facing conflict",
    };
  }

  // Rule 3: Too many hours for secondary craft
  const hoursPerCraft = weeklyHours / crafts.length;
  if (crafts.length > 1 && hoursPerCraft < 5) {
    return {
      shouldSplit: true,
      reason: "Secondary craft needs <5 hrs/week",
    };
  }

  return { shouldSplit: false, reason: "Single focused role appropriate" };
}

function determineService(
  crafts: { family: string; role: string }[],
  weeklyHours: number,
  splitNeeded: boolean
) {
  // POD if less than 20 hours
  if (weeklyHours < 20) {
    return {
      service: "POD",
      reason: "Low weekly hours suit project-based work",
    };
  }

  // Check if adjacent for Unicorn
  if (splitNeeded && crafts.length === 2) {
    const rolesMatch = ALLOWED_UNICORN_PAIRS.some((pair) =>
      crafts.every((c) => pair.includes(c.role))
    );

    if (rolesMatch) {
      return {
        service: "Unicorn VA",
        reason: "Adjacent crafts can be combined efficiently",
      };
    }
  }

  if (splitNeeded) {
    return {
      service: "Dedicated + POD",
      reason: "Multiple non-adjacent roles need separation",
    };
  }

  return {
    service: "Dedicated VA",
    reason: "Single focused role with sufficient hours",
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { intake_json, upload_ids = [] } = body;

    // Validate required fields
    if (!intake_json?.brand?.name || !intake_json?.tasks_top5?.length) {
      return NextResponse.json(
        { error: "Invalid intake data" },
        { status: 400 }
      );
    }

    // Classification engine
    const crafts = classifyTasks(
      intake_json.tasks_top5,
      intake_json.tools || [],
      intake_json.outcome_90d || ""
    );

    const splitLogic = determineSplitLogic(
      crafts,
      intake_json.weekly_hours,
      intake_json.client_facing
    );

    const serviceMapping = determineService(
      crafts,
      intake_json.weekly_hours,
      splitLogic.shouldSplit
    );

    // Build comprehensive system prompt
    const systemPrompt = `You are Job Description Builder AI for Level 9 Virtual. Your job is to create comprehensive, in-depth job descriptions that provide complete clarity for hiring and onboarding.

CORE MISSION:
(1) Ingest intake JSON + classification results
(2) Identify the client's primary outcome and the single highest-leverage role
(3) Design roles that most directly drive the client's stated goal
(4) Map each role to the most appropriate L9V service (Dedicated VA, Unicorn VA, or POD)

PRINCIPLES:
- Outcomes over duties: design roles that most directly drive the client's stated goal
- Role clarity: one role = one dominant craft
- Personality fit matters: ensure behavioral profile matches the craft
- Tool reality: only include tools the client uses
- Provide rich, actionable detail in every section

CLASSIFICATION RESULTS:
${JSON.stringify({ crafts, splitLogic, serviceMapping }, null, 2)}

INTAKE DATA:
${JSON.stringify(intake_json, null, 2)}

KPI LIBRARY (use these as defaults, customize to the specific role):
${JSON.stringify(KPI_LIBRARY, null, 2)}

PERSONALITY PROFILES (use these as templates, customize to client needs):
${JSON.stringify(PERSONALITY_PROFILES, null, 2)}

YOU MUST RESPOND WITH A COMPLETE JSON OBJECT CONTAINING ALL OF THE FOLLOWING:

{
  "what_you_told_us": "A comprehensive 2-3 paragraph summary synthesizing the client's business goal, key tasks, constraints (hours, timezone, client-facing needs), tools in use, and the primary outcome they want to achieve in 90 days. Make this narrative and insightful.",
  
  "roles": [
    {
      "title": "Specific role name (e.g., 'GHL Implementer', 'Executive Assistant')",
      "family": "The craft family (Tech/Automation, Creative/Build, Growth/Revenue, Business/Operations)",
      "service": "Dedicated VA | Unicorn VA | POD",
      "hours_per_week": 20,
      "client_facing": true/false,
      "purpose": "A clear 2-sentence mission statement explaining why this role exists and what it unlocks for the business",
      
      "core_outcomes": [
        "4-6 specific, measurable outcomes this role will deliver in 90 days",
        "Each should be concrete and tied to business impact",
        "Example: 'Launch 2 new lead-generation funnels with <2% form error rate'",
        "Example: 'Increase booked calls by 15 per month through automation optimization'"
      ],
      
      "responsibilities": [
        "6 detailed responsibilities, each 1-2 sentences",
        "Include the 'how' not just the 'what'",
        "Example: 'Build and QA multi-step GHL workflows including form integrations, conditional logic, and calendar booking'",
        "Example: 'Conduct weekly A/B tests on funnel conversion points and document findings in Sheets'"
      ],
      
      "skills": [
        "6-8 specific skills with context",
        "Example: 'GHL workflow builder (intermediate: triggers, filters, webhooks)'",
        "Example: 'Clear async communication via Loom and Slack'",
        "Not just tool names - include proficiency level or application context"
      ],
      
      "tools": [
        "List of 4-8 tools the client uses",
        "Include tool AND primary use case",
        "Example: 'GHL (workflows, pipelines, forms)'",
        "Example: 'Google Sheets (KPI tracking, test logs)'"
      ],
      
      "kpis": [
        "3-5 specific KPIs with targets where possible",
        "Mix leading and lagging indicators",
        "Example: '2 funnel launches per month'",
        "Example: 'Form error rate <2%'",
        "Example: '+15 booked calls per month (30-day rolling average)'"
      ],
      
      "personality": [
        "4-5 personality traits that are CRITICAL for this role",
        "Be specific to the craft and client context",
        "Example: 'Systematic and detail-safe—catches edge cases before they become problems'",
        "Example: 'Comfortable with ambiguity in early stages, then locks into process'",
        "Not generic—tailor to whether role is creative, analytical, client-facing, etc."
      ],
      
      "reporting_to": "The role or person this VA reports to (e.g., 'Marketing Director', 'Founder', 'Operations Lead')",
      
      "sample_week": {
        "Mon": "Detailed description of Monday activities (2-3 sentences). Example: 'Review weekend form submissions and fix any errors. Plan week's automation builds in ClickUp. Sync with Marketing Lead on funnel priorities.'",
        "Tue": "Detailed Tuesday activities",
        "Wed": "Detailed Wednesday activities",
        "Thu": "Detailed Thursday activities",
        "Fri": "Detailed Friday activities (include reporting/review rituals)"
      },
      
      "overlap_requirements": "Specific guidance on timezone overlap needs. Example: '2-3 hours daily overlap with EST for standup and real-time troubleshooting. Async-first otherwise.'",
      
      "communication_norms": "How this role communicates. Example: 'Daily async updates in Slack. Weekly Loom for KPI review. Bi-weekly 30-min sync for planning.'"
    }
  ],
  
  "split_table": [
    {
      "role": "Primary role name",
      "purpose": "Brief 1-sentence purpose",
      "core_outcomes": ["outcome 1", "outcome 2"],
      "hrs": 20,
      "service": "Dedicated | Unicorn | POD"
    }
  ],
  
  "service_recommendation": {
    "best_fit": "Dedicated VA | Unicorn VA | POD | Dedicated + POD",
    "why": "2-3 paragraph explanation of why this service mapping is optimal. Include: (1) workload match, (2) craft adjacency or conflicts, (3) cost-efficiency, (4) trade-offs vs alternatives",
    "cost_framing": "Brief context on cost expectations WITHOUT specific prices. Example: 'Dedicated VAs typically range from $X-Y monthly depending on seniority. POD work is billed project-based.'",
    "next_steps": [
      "3-5 concrete next steps",
      "Example: 'Approve this JD and role split'",
      "Example: 'Schedule kickoff call to review KPI tracking setup'",
      "Example: 'Prepare SOP for top 2 workflows to accelerate onboarding'"
    ]
  },
  
  "onboarding_2w": {
    "week_1": [
      "4-6 detailed onboarding actions for Week 1",
      "Example: 'Grant GHL admin access + walkthrough of current funnel architecture'",
      "Example: 'Share top 3 SOPs and have VA summarize understanding via Loom'",
      "Example: 'Assign first dry-run task: clone existing funnel and modify thank-you page'"
    ],
    "week_2": [
      "4-6 detailed onboarding actions for Week 2",
      "Example: 'Launch first live automation with QA checklist'",
      "Example: 'Establish weekly KPI reporting cadence and review format'",
      "Example: 'Conduct 30-min retro: what's clear, what needs more context'"
    ]
  },
  
  "risks": [
    "3-5 specific risks or tradeoffs with this role design",
    "Example: 'If design tasks exceed 8h/week, the POD model will bottleneck—consider dedicated designer at that point'",
    "Example: 'GHL Implementer has limited client-facing experience—best paired with internal point person for client comms'",
    "Be honest and anticipatory"
  ],
  
  "assumptions": [
    "3-5 assumptions you're making that the client should validate",
    "Example: 'Assuming current GHL workflows are documented or VA will have access to walk through them'",
    "Example: 'Assuming design backlog averages 6-8 hours per week; if higher, role split needed'",
    "Example: 'Assuming client has existing SOPs or is willing to create them in Week 1'"
  ]
}

CRITICAL REQUIREMENTS:
- Every field must be populated with rich, detailed, actionable content
- No placeholders or generic statements
- Tailor everything to the specific client context from intake_json
- Use the classification results to inform role design, but write for humans
- Make this comprehensive enough that a hiring manager could use it immediately
- Sample week should read like a real week, with specific activities
- KPIs should be measurable and tied to the 90-day outcome
- Personality traits should differentiate good-fit from poor-fit candidates

Respond ONLY with the complete JSON object. No markdown, no explanations outside the JSON.`;

    // Call OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content:
            "Generate the complete, in-depth job description analysis based on the intake data and classification results provided. Ensure every section is comprehensive and actionable.",
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 4000, // Increased for longer responses
    });

    const aiAnalysis = JSON.parse(
      completion.choices[0].message.content || "{}"
    );

    // Build comprehensive preview
    const preview = {
      summary: aiAnalysis.what_you_told_us,
      primary_outcome: intake_json.outcome_90d,
      recommended_role: aiAnalysis.roles?.[0]?.title || "Unknown",
      role_purpose: aiAnalysis.roles?.[0]?.purpose || "",
      service_mapping: serviceMapping.service,
      weekly_hours: aiAnalysis.roles?.[0]?.hours_per_week || intake_json.weekly_hours,
      client_facing: aiAnalysis.roles?.[0]?.client_facing ?? intake_json.client_facing,
      core_outcomes: aiAnalysis.roles?.[0]?.core_outcomes || [],
      kpis: aiAnalysis.roles?.[0]?.kpis || [],
      key_tools: aiAnalysis.roles?.[0]?.tools?.slice(0, 5) || [],
      risks: aiAnalysis.risks || [],
    };

    return NextResponse.json({
      preview,
      ai_analysis: aiAnalysis,
      classification: {
        crafts,
        split_logic: splitLogic,
        service_mapping: serviceMapping,
      },
    });
  } catch (error) {
    console.error("JD Analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze job description" },
      { status: 500 }
    );
  }
}